using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Recruitment.API.Data;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Recruitment.API.Services
{
    public class CandidateRepository : ICandidateRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CandidateRepository> _logger; 

        public CandidateRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, ILogger<CandidateRepository> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger; 
        }

        private int GetCurrentUserId()
        {
            if (int.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            {
                return userId;
            }
            _logger.LogError("User ID claim not found or invalid in token for CandidateRepository.");
            throw new InvalidOperationException("User ID claim not found or invalid.");
        }
        public async Task<ServiceResponse<List<MyApplicationDto>>> GetMyApplicationsAsync()
        {
            _logger.LogInformation("Fetching applications for user ID {UserId}", GetCurrentUserId());
            try
            {
                var userId = GetCurrentUserId();
                var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.user_id == userId);

                if (candidate == null)
                {
                    _logger.LogWarning("No candidate profile found linked to user ID {UserId}", userId);
                    return new ServiceResponse<List<MyApplicationDto>> { Data = new List<MyApplicationDto>(), Message = "No candidate profile linked to this account." };
                }
                _logger.LogInformation("Found candidate profile ID {CandidateId} for user ID {UserId}", candidate.candidate_id, userId);

                var applicationsWithInterviews = await _context.Applications
                    .Where(a => a.candidate_id == candidate.candidate_id)
                    .Include(a => a.Job)
                    .Include(a => a.Interviews)
                    .OrderByDescending(a => a.applied_at)
                    .ToListAsync();
                
                var applicationDtos = applicationsWithInterviews.Select(a => {
                    var latestInterview = a.Interviews?
                                           .OrderByDescending(i => i.scheduled_at ?? DateTime.MinValue)
                                           .FirstOrDefault();

                    return new MyApplicationDto
                    {
                        ApplicationId = a.application_id,
                        JobTitle = a.Job?.title ?? "N/A",
                        ApplicationStatus = a.status,
                        AppliedAt = a.applied_at,
                        NextStepType = latestInterview?.interview_type,
                        NextStepScheduledAt = latestInterview?.scheduled_at,
                        NextStepStatus = latestInterview?.status,

                        JoiningDate = a.joining_date
                    };
                }).ToList();


                _logger.LogInformation("Successfully fetched {Count} applications for candidate ID {CandidateId}", applicationDtos.Count, candidate.candidate_id);
                return new ServiceResponse<List<MyApplicationDto>> { Data = applicationDtos };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching applications for user ID {UserId}", GetCurrentUserId());
                return new ServiceResponse<List<MyApplicationDto>> { Success = false, Message = "An error occurred fetching applications." };
            }
        }

        #region Unchanged Methods
        public async Task<ServiceResponse<List<JobListingDto>>> GetOpenJobsAsync()
        {
            var jobs = await _context.Jobs
                .Where(j => j.status == "Open")
                .Select(j => new JobListingDto
                {
                    JobId = j.job_id,
                    Title = j.title,
                    Description = j.description,
                    Status = j.status
                }).ToListAsync();
            return new ServiceResponse<List<JobListingDto>> { Data = jobs };
        }
        public async Task<ServiceResponse<CandidateProfileDto>> GetMyProfileAsync()
        {
            var userId = GetCurrentUserId();
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.user_id == userId);
            if (candidate == null) return new ServiceResponse<CandidateProfileDto> { Success = false, Message = "Candidate profile not found." };
            var profileDto = new CandidateProfileDto { FirstName = candidate.first_name, LastName = candidate.last_name, Email = candidate.email, Phone = candidate.phone, CvPath = candidate.cv_path };
            return new ServiceResponse<CandidateProfileDto> { Data = profileDto };
        }
        public async Task<ServiceResponse<string>> UpdateCvAsync(IFormFile cvFile)
        {
            var userId = GetCurrentUserId();
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.user_id == userId);
            if (candidate == null) return new ServiceResponse<string> { Success = false, Message = "Candidate profile not found." };
            if (cvFile == null || cvFile.Length == 0) return new ServiceResponse<string> { Success = false, Message = "No file was uploaded." };
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(cvFile.FileName)}";
            var folderPath = Path.Combine("wwwroot", "cvs");
            var filePath = Path.Combine(folderPath, fileName);
            Directory.CreateDirectory(folderPath);
            using (var stream = new FileStream(filePath, FileMode.Create)) { await cvFile.CopyToAsync(stream); }
            candidate.cv_path = Path.Combine("cvs", fileName);
            await _context.SaveChangesAsync();
            return new ServiceResponse<string> { Data = candidate.cv_path, Message = "CV updated successfully." };
        }
        #endregion
    }
}