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
    public class ReviewerRepository : IReviewerRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ReviewerRepository> _logger;

        public ReviewerRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, ILogger<ReviewerRepository> logger)
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
-
        public async Task<ServiceResponse<ApplicationDetailsDto>> GetApplicationDetailsAsync(int applicationId)
        {
            _logger.LogInformation("Fetching details for application ID {ApplicationId}", applicationId);
            try
            {
                var currentUserId = GetCurrentUserId();

                var application = await _context.Applications
                    .Include(a => a.Candidate)
                    .Include(a => a.Job)
                    .FirstOrDefaultAsync(a => a.application_id == applicationId);

                if (application == null || application.Candidate == null)
                    return new ServiceResponse<ApplicationDetailsDto> { Success = false, Message = "Application or associated candidate not found." };

                var userRole = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Role);
                var isRecruiter = userRole == "Recruiter";
                 var isAssigned = await _context.Job_Reviewers.AnyAsync(jr => jr.job_id == application.job_id && jr.reviewer_user_id == currentUserId);

                if (!isRecruiter && !isAssigned)
                {
                    _logger.LogWarning("Security Breach: User {UserId} (role: {UserRole}) tried to access application {ApplicationId} they are not assigned to.", currentUserId, userRole, applicationId);
                    return new ServiceResponse<ApplicationDetailsDto> { Success = false, Message = "You are not authorized to view this application." };
                }

                var latestInterview = await _context.Interviews
                    .Where(i => i.application_id == applicationId)
                    .OrderByDescending(i => i.scheduled_at) 
                    .FirstOrDefaultAsync();

                var comments = await _context.Application_Comments
                                    .Where(c => c.application_id == applicationId)
                                    .Include(c => c.User)
                                    .OrderByDescending(c => c.created_at)
                                    .Select(c => new CommentDto
                                    {
                                        CommentText = c.comment,
                                        AuthorName = c.User != null ? $"{c.User.first_name} {c.User.last_name}" : "Unknown",
                                        CreatedAt = c.created_at
                                    })
                                    .ToListAsync();

                var interviewIdsForApp = await _context.Interviews
                    .Where(i => i.application_id == applicationId)
                    .Select(i => i.interview_id)
                    .ToListAsync();

                var submittedFeedback = await _context.Interview_Feedback
                    .Where(f => interviewIdsForApp.Contains(f.interview_id)) 
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

                var pastApplications = await _context.Applications
                    .Where(a => a.candidate_id == application.candidate_id && a.application_id != applicationId)
                    .Include(a => a.Job)
                    .Select(a => new PastApplicationDto
                    {
                        JobTitle = a.Job != null ? a.Job.title : "Unknown Job",
                        FinalStatus = a.status,
                        AppliedAt = a.applied_at
                    })
                    .ToListAsync();

                var detailsDto = new ApplicationDetailsDto
                {
                    ApplicationId = application.application_id,
                    ApplicationStatus = application.status,
                    CandidateName = $"{application.Candidate.first_name} {application.Candidate.last_name}",
                    CandidateEmail = application.Candidate.email,
                    CandidateCvPath = application.Candidate.cv_path,
                    Comments = comments, 
                    PastApplications = pastApplications,
                    SubmittedFeedback = submittedFeedback, 
                    CurrentUserId = currentUserId,
                    JobId = application.job_id,

                    LatestInterviewType = latestInterview?.interview_type,
                    LatestInterviewScheduledAt = latestInterview?.scheduled_at,
                    LatestInterviewStatus = latestInterview?.status
                };

                return new ServiceResponse<ApplicationDetailsDto> { Data = detailsDto };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching application details for ID {ApplicationId}", applicationId);
                return new ServiceResponse<ApplicationDetailsDto> { Success = false, Message = "An error occurred while fetching details." };
            }
        }

       #region Unchanged Methods
        public async Task<ServiceResponse<List<ReviewerApplicationDto>>> GetAssignedApplicationsAsync()
        {
            var reviewerId = GetCurrentUserId();
            var assignedJobIds = await _context.Job_Reviewers.Where(jr => jr.reviewer_user_id == reviewerId).Select(jr => jr.job_id).ToListAsync();
            if (!assignedJobIds.Any()) { return new ServiceResponse<List<ReviewerApplicationDto>> { Data = new List<ReviewerApplicationDto>() }; }
            var applications = await _context.Applications.Where(a => assignedJobIds.Contains(a.job_id)).Include(a => a.Candidate).Include(a => a.Job)
                .Select(a => new ReviewerApplicationDto
                {
                    ApplicationId = a.application_id,
                    CandidateName = (a.Candidate != null) ? $"{a.Candidate.first_name} {a.Candidate.last_name}" : "Unknown Candidate",
                    JobTitle = (a.Job != null) ? a.Job.title : "Unknown Job",
                    Status = a.status
                }).ToListAsync();
            return new ServiceResponse<List<ReviewerApplicationDto>> { Data = applications };
        }
        public async Task<ServiceResponse<ApplicationComment>> AddCommentAsync(int applicationId, string commentText)
        {
            var comment = new ApplicationComment { application_id = applicationId, comment = commentText, user_id = GetCurrentUserId() };
            _context.Application_Comments.Add(comment);
            await _context.SaveChangesAsync();
            return new ServiceResponse<ApplicationComment> { Data = comment, Message = "Comment added." };
        }
        public async Task<ServiceResponse<bool>> UpdateApplicationStatusAsync(int applicationId, string newStatus)
        {
            var application = await _context.Applications.FindAsync(applicationId);
            if (application == null) return new ServiceResponse<bool> { Success = false, Message = "Application not found." };
            application.status = newStatus;
            await _context.SaveChangesAsync();
            return new ServiceResponse<bool> { Data = true, Message = $"Status updated to {newStatus}." };
        }
        #endregion
    }
}