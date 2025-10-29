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

namespace Recruitment.API.Services
{
    public class ReviewerRepository : IReviewerRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ReviewerRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new InvalidOperationException("User ID claim not found or invalid in token.");
        }

        public async Task<ServiceResponse<List<ReviewerApplicationDto>>> GetAssignedApplicationsAsync()
        {
            try
            {
                var reviewerId = GetCurrentUserId();
                var assignedJobIds = await _context.Job_Reviewers
                    .Where(jr => jr.reviewer_user_id == reviewerId)
                    .Select(jr => jr.job_id)
                    .ToListAsync();

                if (!assignedJobIds.Any())
                {
                    return new ServiceResponse<List<ReviewerApplicationDto>> { Data = new List<ReviewerApplicationDto>() };
                }

                var applications = await _context.Applications
                    .Where(a => assignedJobIds.Contains(a.job_id))
                    .Include(a => a.Candidate)
                    .Include(a => a.Job)
                    .Select(a => new ReviewerApplicationDto
                    {
                        ApplicationId = a.application_id,
                        CandidateName = (a.Candidate != null) ? $"{a.Candidate.first_name} {a.Candidate.last_name}" : "Unknown Candidate",
                        JobTitle = (a.Job != null) ? a.Job.title : "Unknown Job",
                        Status = a.status
                    })
                    .ToListAsync();

                return new ServiceResponse<List<ReviewerApplicationDto>> { Data = applications };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching assigned applications: {ex.Message}"); 
                return new ServiceResponse<List<ReviewerApplicationDto>> { Success = false, Message = "An error occurred while fetching assigned applications." };
            }
        }

        public async Task<ServiceResponse<ApplicationDetailsDto>> GetApplicationDetailsAsync(int applicationId)
        {
            var application = await _context.Applications
                .Include(a => a.Candidate)
                .FirstOrDefaultAsync(a => a.application_id == applicationId);

            if (application == null || application.Candidate == null)
                return new ServiceResponse<ApplicationDetailsDto> { Success = false, Message = "Application or associated candidate not found." };

            var comments = await _context.Application_Comments
                .Where(c => c.application_id == applicationId)
                .Include(c => c.User)
                .OrderByDescending(c => c.created_at)
                .Select(c => new CommentDto
                {
                    CommentText = c.comment,
                    AuthorName = (c.User != null) ? $"{c.User.first_name} {c.User.last_name}" : "Unknown User",
                    CreatedAt = c.created_at
                }).ToListAsync();

            var pastApplications = await _context.Applications
                .Where(a => a.candidate_id == application.candidate_id && a.application_id != applicationId)
                .Include(a => a.Job)
                .Select(a => new PastApplicationDto
                {
                    JobTitle = (a.Job != null) ? a.Job.title : "Unknown Job",
                    FinalStatus = a.status,
                    AppliedAt = a.applied_at
                }).ToListAsync();

            var detailsDto = new ApplicationDetailsDto
            {
                ApplicationId = application.application_id,
                ApplicationStatus = application.status,
                CandidateName = $"{application.Candidate.first_name} {application.Candidate.last_name}",
                CandidateEmail = application.Candidate.email,
                CandidateCvPath = application.Candidate.cv_path,
                Comments = comments,
                PastApplications = pastApplications
            };

            return new ServiceResponse<ApplicationDetailsDto> { Data = detailsDto };
        }

        public async Task<ServiceResponse<ApplicationComment>> AddCommentAsync(int applicationId, string commentText)
        {
            var comment = new ApplicationComment
            {
                application_id = applicationId,
                comment = commentText,
                user_id = GetCurrentUserId()
            };
            _context.Application_Comments.Add(comment);
            await _context.SaveChangesAsync();
            return new ServiceResponse<ApplicationComment> { Data = comment, Message = "Comment added." };
        }

        public async Task<ServiceResponse<bool>> UpdateApplicationStatusAsync(int applicationId, string newStatus)
        {
            var application = await _context.Applications.FindAsync(applicationId);
            if (application == null)
                return new ServiceResponse<bool> { Success = false, Message = "Application not found." };

            application.status = newStatus;
            await _context.SaveChangesAsync();
            return new ServiceResponse<bool> { Data = true, Message = $"Status updated to {newStatus}." };
        }

        public async Task<ServiceResponse<List<UserDto>>> GetAvailableReviewersAsync()
        {
            var reviewerRole = await _context.Roles.FirstOrDefaultAsync(r => r.role_name == "Reviewer");
            if (reviewerRole == null)
            {
                return new ServiceResponse<List<UserDto>> { Success = false, Message = "Reviewer role not found in database." };
            }

            var reviewers = await _context.Users
                .Where(u => u.role_id == reviewerRole.role_id)
                .Select(u => new UserDto { UserId = u.user_id, Name = u.first_name + " " + u.last_name, Email = u.email })
                .ToListAsync();

            return new ServiceResponse<List<UserDto>> { Data = reviewers };
        }

        public async Task<ServiceResponse<JobReviewer>> AssignReviewerToJobAsync(int jobId, int reviewerUserId)
        {
            var jobExists = await _context.Jobs.AnyAsync(j => j.job_id == jobId);
            if (!jobExists)
                return new ServiceResponse<JobReviewer> { Success = false, Message = "Job not found." };

            var reviewerUser = await _context.Users
                                    .Include(u => u.Role)
                                    .FirstOrDefaultAsync(u => u.user_id == reviewerUserId);

            if (reviewerUser == null || reviewerUser.Role?.role_name != "Reviewer")
                return new ServiceResponse<JobReviewer> { Success = false, Message = "User is not a valid reviewer." };

            var existingAssignment = await _context.Job_Reviewers
                .AnyAsync(jr => jr.job_id == jobId && jr.reviewer_user_id == reviewerUserId);

            if (existingAssignment)
                return new ServiceResponse<JobReviewer> { Success = false, Message = "This reviewer is already assigned to this job." };

            var assignment = new JobReviewer
            {
                job_id = jobId,
                reviewer_user_id = reviewerUserId
            };

            _context.Job_Reviewers.Add(assignment);
            await _context.SaveChangesAsync();

            return new ServiceResponse<JobReviewer> { Data = assignment, Message = "Reviewer assigned successfully." };
        }
        
    }
}

