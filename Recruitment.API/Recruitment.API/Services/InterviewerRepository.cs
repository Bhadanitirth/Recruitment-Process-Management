using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Recruitment.API.Data;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Recruitment.API.Services
{
    public class InterviewerRepository : IInterviewerRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<InterviewerRepository> _logger;

        public InterviewerRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, ILogger<InterviewerRepository> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            if (int.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
                return userId;

            _logger.LogError("User ID claim not found or invalid in token for InterviewerRepository.");
            throw new InvalidOperationException("User ID claim not found or invalid.");
        }

        public async Task<ServiceResponse<List<InterviewerDashboardItemDto>>> GetAssignedInterviewsAsync()
        {
            var interviewerId = GetCurrentUserId();
            var userRole = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);

            var query = _context.Interview_Panel
                .Where(ip => ip.interviewer_user_id == interviewerId);

            if (userRole == "Interviewer")
            {
                query = query.Where(ip => ip.Interview.interview_type == "Technical" || ip.Interview.interview_type == "Online Test");
            }
            else if (userRole == "HR")
            {
                query = query.Where(ip => ip.Interview.interview_type == "HR");
            }

            var interviews = await query
                .Include(ip => ip.Interview)
                    .ThenInclude(i => i.Application)
                        .ThenInclude(a => a.Candidate)
                .Include(ip => ip.Interview)
                    .ThenInclude(i => i.Application)
                        .ThenInclude(a => a.Job)
                .Select(ip => new InterviewerDashboardItemDto
                {
                    InterviewId = ip.interview_id,
                    CandidateName = ip.Interview.Application.Candidate != null ? $"{ip.Interview.Application.Candidate.first_name} {ip.Interview.Application.Candidate.last_name}" : "N/A",
                    JobTitle = ip.Interview.Application.Job != null ? ip.Interview.Application.Job.title : "N/A",
                    InterviewType = ip.Interview.interview_type,
                    ScheduledAt = ip.Interview.scheduled_at ?? default,
                    Status = ip.Interview.status
                })
                .OrderBy(i => i.ScheduledAt)
                .ToListAsync();

            return new ServiceResponse<List<InterviewerDashboardItemDto>> { Data = interviews };
        }

        public async Task<ServiceResponse<InterviewDetailsDto>> GetInterviewDetailsAsync(int interviewId)
        {
            _logger.LogInformation("Fetching details for interview ID {InterviewId}", interviewId);
            try
            {
                var currentUserId = GetCurrentUserId();
                var userRole = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Role);

                var interview = await _context.Interviews
                    .Include(i => i.Application).ThenInclude(a => a.Candidate)
                    .Include(i => i.Application).ThenInclude(a => a.Job)
                    .Include(i => i.PanelMembers).ThenInclude(pm => pm.Interviewer)
                    .FirstOrDefaultAsync(i => i.interview_id == interviewId);

                if (interview == null)
                    return new ServiceResponse<InterviewDetailsDto> { Success = false, Message = "Interview not found." };

                var isRecruiter = userRole == "Recruiter";
                var isAssigned = interview.PanelMembers.Any(pm => pm.interviewer_user_id == currentUserId);

                if (!isRecruiter && !isAssigned)
                {
                    _logger.LogWarning("Security Breach: User {UserId} tried to access interview {InterviewId}.", currentUserId, interviewId);
                    return new ServiceResponse<InterviewDetailsDto> { Success = false, Message = "You are not authorized to view this interview." };
                }

                if (!isRecruiter) 
                {
                    if (userRole == "Interviewer" && interview.interview_type == "HR")
                        return new ServiceResponse<InterviewDetailsDto> { Success = false, Message = "Access Denied: This is an HR interview." };

                    if (userRole == "HR" && (interview.interview_type == "Technical" || interview.interview_type == "Online Test"))
                        return new ServiceResponse<InterviewDetailsDto> { Success = false, Message = "Access Denied: This is a Technical interview." };
                }

                var submittedFeedback = await _context.Interview_Feedback
                    .Where(f => f.interview_id == interviewId)
                    .Include(f => f.Interviewer)
                    .OrderBy(f => f.submitted_at)
                    .Select(f => new SubmittedFeedbackDto
                    {
                        InterviewerName = f.Interviewer != null ? $"{f.Interviewer.first_name} {f.Interviewer.last_name}" : "Unknown",
                        Rating = f.rating,
                        Comments = f.comments,
                        Recommendation = f.recommendation,
                        SubmittedAt = f.submitted_at,
                        InterviewerId = f.interviewer_user_id
                    })
                    .ToListAsync();

                var details = new InterviewDetailsDto
                {
                    InterviewId = interview.interview_id,
                    ApplicationId = interview.application_id,
                    CandidateName = interview.Application?.Candidate != null ? $"{interview.Application.Candidate.first_name} {interview.Application.Candidate.last_name}" : "N/A",
                    CandidateCvPath = interview.Application?.Candidate?.cv_path,
                    JobTitle = interview.Application?.Job?.title,
                    RoundNumber = interview.round_number,
                    InterviewType = interview.interview_type,
                    ScheduledAt = interview.scheduled_at ?? default,
                    Status = interview.status,
                    PanelInterviewerNames = interview.PanelMembers.Select(pm => pm.Interviewer != null ? $"{pm.Interviewer.first_name} {pm.Interviewer.last_name}" : "Unknown").ToList(),
                    SubmittedFeedback = submittedFeedback,
                    CurrentUserId = currentUserId,
                    MeetingLink = interview.meeting_link
                };

                return new ServiceResponse<InterviewDetailsDto> { Data = details };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching interview details for ID {InterviewId}", interviewId);
                return new ServiceResponse<InterviewDetailsDto> { Success = false, Message = "An error occurred while fetching details." };
            }
        }

        public async Task<ServiceResponse<InterviewFeedback>> SubmitFeedbackAsync(int interviewId, FeedbackSubmitDto feedbackDto)
        {
            var interviewerId = GetCurrentUserId();
            var userRole = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Role);

            if (!await _context.Interview_Panel.AnyAsync(ip => ip.interview_id == interviewId && ip.interviewer_user_id == interviewerId))
                return new ServiceResponse<InterviewFeedback> { Success = false, Message = "You are not assigned to this interview." };

            var interviewType = await _context.Interviews.Where(i => i.interview_id == interviewId).Select(i => i.interview_type).FirstOrDefaultAsync();
            if (userRole == "Interviewer" && interviewType == "HR") return new ServiceResponse<InterviewFeedback> { Success = false, Message = "Technical Interviewers cannot submit HR feedback." };

            if (await _context.Interview_Feedback.AnyAsync(f => f.interview_id == interviewId && f.interviewer_user_id == interviewerId))
                return new ServiceResponse<InterviewFeedback> { Success = false, Message = "Feedback already submitted for this interview." };

            var feedback = new InterviewFeedback
            {
                interview_id = interviewId,
                interviewer_user_id = interviewerId,
                rating = feedbackDto.Rating,
                comments = feedbackDto.Comments,
                recommendation = feedbackDto.Recommendation
            };

            _context.Interview_Feedback.Add(feedback);

            var interview = await _context.Interviews.FindAsync(interviewId);
            if (interview != null)
            {
                interview.status = "Completed";
                //Console.WriteLine(feedback.recommendation);

                if (feedback.recommendation == "Hold" || feedback.recommendation == "Reject")
                {
                    var application = await _context.Applications.FindAsync(interview.application_id);
                    if (application != null)
                    {
                        application.status = (feedback.recommendation == "Hold") ? "On Hold" : "Rejected";
                    }
                }
                else if (feedback.recommendation == "Proceed")
                {
                    var application = await _context.Applications.FindAsync(interview.application_id);
                    //Console.WriteLine(application);
                    if (application != null) application.status = "Shortlisted";
                }
            }

            await _context.SaveChangesAsync();

            return new ServiceResponse<InterviewFeedback> { Data = feedback, Message = "Feedback submitted." };
        }
    }
}