using Microsoft.EntityFrameworkCore;
using Recruitment.API.Data;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel;
using System;
using Microsoft.Extensions.Logging;

namespace Recruitment.API.Services
{
    public class RecruiterRepository : IRecruiterRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<RecruiterRepository> _logger;
        private readonly IEmailService _emailService;

        public RecruiterRepository(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<RecruiterRepository> logger,
            IEmailService emailService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _emailService = emailService;
        }

        private int GetUserId()
        {
            if (int.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            {
                return userId;
            }
            _logger.LogError("User ID claim not found or invalid in token.");
            throw new InvalidOperationException("User ID claim not found or invalid.");
        }
        public async Task<ServiceResponse<List<UserDto>>> GetAvailableHrUsersAsync()
        {
            try
            {
                var hrRole = await _context.Roles.FirstOrDefaultAsync(r => r.role_name.Equals("HR", StringComparison.OrdinalIgnoreCase));

                if (hrRole == null)
                {
                    _logger.LogError("Role definition for 'HR' not found in Roles table.");
                    return new ServiceResponse<List<UserDto>> { Success = false, Message = "HR role definition not found." };
                }

                var hrUsersFromDb = await _context.Users
                    .Where(u => u.role_id == hrRole.role_id)
                    .Select(u => new
                    {
                        u.user_id,
                        u.first_name,
                        u.last_name,
                        u.email
                    })
                    .ToListAsync();

                var hrUsers = hrUsersFromDb
                    .Select(u => new UserDto
                    {
                        UserId = u.user_id,
                        Name = $"{u.first_name} {u.last_name}",
                        Email = u.email
                    })
                    .OrderBy(u => u.Name)
                    .ToList();

                return new ServiceResponse<List<UserDto>> { Data = hrUsers };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An exception occurred while fetching available HR users.");
                return new ServiceResponse<List<UserDto>> { Success = false, Message = "An error occurred while fetching HR users." };
            }
        }

        #region Unchanged Methods
        public async Task<ServiceResponse<List<Application>>> GetApplicationsAsync() { return new ServiceResponse<List<Application>> { Data = await _context.Applications.Include(a => a.Candidate).ToListAsync() }; }
        public async Task<ServiceResponse<List<UserDto>>> GetAvailableReviewersAsync() { var reviewerRole = await _context.Roles.FirstOrDefaultAsync(r => r.role_name.Equals("Reviewer", StringComparison.OrdinalIgnoreCase)); if (reviewerRole == null) return new ServiceResponse<List<UserDto>> { Success = false, Message = "Reviewer role definition not found." }; var reviewers = await _context.Users.Where(u => u.role_id == reviewerRole.role_id).Select(u => new UserDto { UserId = u.user_id, Name = $"{u.first_name} {u.last_name}", Email = u.email }).ToListAsync(); return new ServiceResponse<List<UserDto>> { Data = reviewers }; }
        public async Task<ServiceResponse<JobReviewer>> AssignReviewerToJobAsync(int jobId, int reviewerUserId) { var jobExists = await _context.Jobs.AnyAsync(j => j.job_id == jobId); if (!jobExists) { return new ServiceResponse<JobReviewer> { Success = false, Message = "Job not found." }; } var reviewerUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.user_id == reviewerUserId); if (reviewerUser == null || !reviewerUser.Role?.role_name?.Equals("Reviewer", StringComparison.OrdinalIgnoreCase) == true) { return new ServiceResponse<JobReviewer> { Success = false, Message = "The selected user is not a valid reviewer." }; } var alreadyAssigned = await _context.Job_Reviewers.AnyAsync(jr => jr.job_id == jobId && jr.reviewer_user_id == reviewerUserId); if (alreadyAssigned) { return new ServiceResponse<JobReviewer> { Success = false, Message = "Reviewer already assigned." }; } var assignment = new JobReviewer { job_id = jobId, reviewer_user_id = reviewerUserId }; _context.Job_Reviewers.Add(assignment); await _context.SaveChangesAsync(); return new ServiceResponse<JobReviewer> { Data = assignment, Message = "Reviewer assigned successfully." }; }
        public async Task<ServiceResponse<List<UserDto>>> GetAvailableInterviewersAsync() { try { var interviewerRole = await _context.Roles.FirstOrDefaultAsync(r => r.role_name.Equals("Interviewer", StringComparison.OrdinalIgnoreCase)); if (interviewerRole == null) return new ServiceResponse<List<UserDto>> { Success = false, Message = "Interviewer role not found." }; var interviewersFromDb = await _context.Users.Where(u => u.role_id == interviewerRole.role_id).Select(u => new { u.user_id, u.first_name, u.last_name, u.email }).ToListAsync(); var interviewers = interviewersFromDb.Select(u => new UserDto { UserId = u.user_id, Name = $"{u.first_name} {u.last_name}", Email = u.email }).OrderBy(u => u.Name).ToList(); return new ServiceResponse<List<UserDto>> { Data = interviewers }; } catch (Exception ex) { _logger.LogError(ex, "Error fetching interviewers."); return new ServiceResponse<List<UserDto>> { Success = false, Message = "Error fetching interviewers." }; } }
        public async Task<ServiceResponse<JobInterviewer>> AssignInterviewerToJobAsync(int jobId, int interviewerUserId) { if (!await _context.Jobs.AnyAsync(j => j.job_id == jobId)) return new ServiceResponse<JobInterviewer> { Success = false, Message = "Job not found." }; var interviewerUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.user_id == interviewerUserId); if (interviewerUser == null || !interviewerUser.Role?.role_name?.Equals("Interviewer", StringComparison.OrdinalIgnoreCase) == true) return new ServiceResponse<JobInterviewer> { Success = false, Message = "User is not a valid interviewer." }; if (await _context.Job_Interviewers.AnyAsync(ji => ji.job_id == jobId && ji.interviewer_user_id == interviewerUserId)) return new ServiceResponse<JobInterviewer> { Success = false, Message = "Interviewer already assigned." }; var assignment = new JobInterviewer { job_id = jobId, interviewer_user_id = interviewerUserId }; _context.Job_Interviewers.Add(assignment); await _context.SaveChangesAsync(); return new ServiceResponse<JobInterviewer> { Data = assignment, Message = "Interviewer assigned." }; }
        public async Task<ServiceResponse<Job>> CreateJobAsync(JobCreateDto jobDto) { var job = new Job { title = jobDto.Title, description = jobDto.Description, status = "Open", created_by_user_id = GetUserId() }; _context.Jobs.Add(job); await _context.SaveChangesAsync(); var addedSkillIds = new HashSet<int>(); if (jobDto.RequiredSkillIds != null) { foreach (var skillId in jobDto.RequiredSkillIds) { if (addedSkillIds.Add(skillId)) { _context.Job_Skills.Add(new JobSkill { job_id = job.job_id, skill_id = skillId, is_required = true }); } } } if (jobDto.PreferredSkillIds != null) { foreach (var skillId in jobDto.PreferredSkillIds) { if (addedSkillIds.Add(skillId)) { _context.Job_Skills.Add(new JobSkill { job_id = job.job_id, skill_id = skillId, is_required = false }); } } } await _context.SaveChangesAsync(); return new ServiceResponse<Job> { Data = job, Message = "Job created." }; }
        public async Task<ServiceResponse<Candidate>> CreateCandidateAsync(CandidateCreateDto candidateDto, IFormFile cvFile) { if (await _context.Users.AnyAsync(u => u.email == candidateDto.Email)) return new ServiceResponse<Candidate> { Success = false, Message = "User exists." }; var candidate = new Candidate { first_name = candidateDto.FirstName, last_name = candidateDto.LastName, email = candidateDto.Email, phone = candidateDto.Phone, college_name = candidateDto.CollegeName, created_by_user_id = GetUserId(), cv_path = "" }; var newUser = CreateUserForCandidate(candidate); _context.Candidates.Add(candidate); _context.Users.Add(newUser); await _context.SaveChangesAsync(); candidate.user_id = newUser.user_id; await _context.SaveChangesAsync(); return new ServiceResponse<Candidate> { Data = candidate, Message = "Candidate created." }; }
        public async Task<ServiceResponse<int>> BulkCreateCandidatesAsync(IFormFile file) { var newCandidates = new List<Candidate>(); var existingUserEmails = new HashSet<string>(await _context.Users.Select(u => u.email).ToListAsync()); int createdCount = 0; using (var stream = new MemoryStream()) { await file.CopyToAsync(stream); using (var workbook = new XLWorkbook(stream)) { var worksheet = workbook.Worksheet(1); if (worksheet == null) return new ServiceResponse<int> { Success = false, Message = "Excel sheet empty." }; var rows = worksheet.RowsUsed().Skip(1); foreach (var row in rows) { var email = row.Cell(3).Value.ToString().Trim(); if (string.IsNullOrEmpty(email) || existingUserEmails.Contains(email) || newCandidates.Any(c => c.email == email)) { continue; } var candidate = new Candidate { first_name = row.Cell(1).Value.ToString().Trim(), last_name = row.Cell(2).Value.ToString().Trim(), email = email, phone = row.Cell(4).Value.ToString().Trim(), college_name = row.Cell(5).Value.ToString().Trim(), created_by_user_id = GetUserId() }; newCandidates.Add(candidate); } } } if (newCandidates.Any()) { using (var transaction = await _context.Database.BeginTransactionAsync()) { try { _context.Candidates.AddRange(newCandidates); await _context.SaveChangesAsync(); foreach (var candidate in newCandidates) { var newUser = CreateUserForCandidate(candidate); _context.Users.Add(newUser); await _context.SaveChangesAsync(); candidate.user_id = newUser.user_id; } await _context.SaveChangesAsync(); await transaction.CommitAsync(); createdCount = newCandidates.Count; } catch (Exception ex) { await transaction.RollbackAsync(); _logger.LogError(ex, "Error during bulk."); return new ServiceResponse<int> { Success = false, Message = "Bulk error." }; } } } return new ServiceResponse<int> { Data = createdCount, Message = $"{createdCount} candidates created." }; }
        public async Task<ServiceResponse<List<Job>>> GetJobsAsync() { return new ServiceResponse<List<Job>> { Data = await _context.Jobs.Where(j => j.status == "Open").ToListAsync() }; }
        public async Task<ServiceResponse<List<Candidate>>> GetCandidatesAsync() { return new ServiceResponse<List<Candidate>> { Data = await _context.Candidates.OrderByDescending(c => c.created_at).Take(20).ToListAsync() }; }
        public async Task<ServiceResponse<List<Skill>>> GetSkillsAsync() { return new ServiceResponse<List<Skill>> { Data = await _context.Skills.OrderBy(s => s.skill_name).ToListAsync() }; }
        public async Task<ServiceResponse<Skill>> CreateSkillAsync(SkillCreateDto skillDto) { if (await _context.Skills.AnyAsync(s => s.skill_name.ToLower() == skillDto.SkillName.ToLower())) { return new ServiceResponse<Skill> { Success = false, Message = "Skill exists." }; } var skill = new Skill { skill_name = skillDto.SkillName }; _context.Skills.Add(skill); await _context.SaveChangesAsync(); return new ServiceResponse<Skill> { Data = skill, Message = "Skill created." }; }
        public async Task<ServiceResponse<Application>> LinkCandidateToJobAsync(int jobId, ApplicationCreateDto appDto) { if (await _context.Applications.AnyAsync(a => a.job_id == jobId && a.candidate_id == appDto.CandidateId)) { return new ServiceResponse<Application> { Success = false, Message = "Candidate already linked." }; } var application = new Application { job_id = jobId, candidate_id = appDto.CandidateId, status = "Applied" }; _context.Applications.Add(application); await _context.SaveChangesAsync(); return new ServiceResponse<Application> { Data = application, Message = "Candidate linked." }; }
        public async Task<ServiceResponse<Interview>> ScheduleInterviewAsync(InterviewScheduleDto scheduleDto) { var application = await _context.Applications.Include(a => a.Candidate).Include(a => a.Job).FirstOrDefaultAsync(a => a.application_id == scheduleDto.ApplicationId); if (application == null) return new ServiceResponse<Interview> { Success = false, Message = "Application not found." }; if (string.IsNullOrEmpty(scheduleDto.InterviewType) || scheduleDto.InterviewerIds == null || !scheduleDto.InterviewerIds.Any()) { return new ServiceResponse<Interview> { Success = false, Message = "Interview type required." }; } var existingCount = await _context.Interviews.CountAsync(i => i.application_id == scheduleDto.ApplicationId); var nextRound = existingCount + 1; var uniqueMeetingId = Guid.NewGuid().ToString().Substring(0, 8); var meetingLink = $"https://meet.jit.si/RoimaInterview-{uniqueMeetingId}"; var interview = new Interview { application_id = scheduleDto.ApplicationId, round_number = nextRound, interview_type = scheduleDto.InterviewType, scheduled_at = scheduleDto.ScheduledAt, status = "Scheduled", meeting_link = meetingLink }; _context.Interviews.Add(interview); await _context.SaveChangesAsync(); var interviewersList = new List<User>(); foreach (var interviewerId in scheduleDto.InterviewerIds) { var isValidInterviewer = await _context.Users.Include(u => u.Role).AnyAsync(u => u.user_id == interviewerId && (u.Role.role_name.Equals("Interviewer", StringComparison.OrdinalIgnoreCase) || u.Role.role_name.Equals("HR", StringComparison.OrdinalIgnoreCase))); if (!isValidInterviewer) { _logger.LogWarning($"Warning: User ID {interviewerId} is not a valid interviewer/HR."); } var interviewer = await _context.Users.FindAsync(interviewerId); if (interviewer != null) { _context.Interview_Panel.Add(new InterviewPanel { interview_id = interview.interview_id, interviewer_user_id = interviewerId }); interviewersList.Add(interviewer); } } application.status = "Interview"; await _context.SaveChangesAsync(); try { string timeString = scheduleDto.ScheduledAt.ToString("f"); string candidateSubject = $"Interview Scheduled: {application.Job.title}"; string candidateBody = $@"<h3>Interview Invitation</h3><p>Position: {application.Job.title}</p><p>Round: {nextRound}</p><p>Time: {timeString}</p><p>Link: <a href='{meetingLink}'>{meetingLink}</a></p>"; await _emailService.SendEmailAsync(application.Candidate.email, candidateSubject, candidateBody); foreach (var interviewer in interviewersList) { string interviewerSubject = $"New Interview Assigned"; string interviewerBody = $@"<h3>New Assignment</h3><p>Candidate: {application.Candidate.first_name}</p><p>Time: {timeString}</p><p>Link: <a href='{meetingLink}'>{meetingLink}</a></p>"; await _emailService.SendEmailAsync(interviewer.email, interviewerSubject, interviewerBody); } } catch (Exception ex) { _logger.LogError(ex, "Failed to send emails."); } return new ServiceResponse<Interview> { Data = interview, Message = $"Round {nextRound} interview scheduled." }; }
        private User CreateUserForCandidate(Candidate candidate) { string defaultPassword = $"{candidate.first_name}@{candidate.last_name}"; string passwordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword); return new User { first_name = candidate.first_name, last_name = candidate.last_name, email = candidate.email, password_hash = passwordHash, role_id = 6 }; }
        #endregion
    }
}