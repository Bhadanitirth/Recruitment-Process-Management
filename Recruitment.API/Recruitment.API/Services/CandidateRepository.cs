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

namespace Recruitment.API.Services
{
    public class CandidateRepository : ICandidateRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CandidateRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetCurrentUserId() => int.Parse(_httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier));

        // --- ADD THIS NEW METHOD ---
        public async Task<ServiceResponse<CandidateProfileDto>> GetMyProfileAsync()
        {
            var userId = GetCurrentUserId();
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.user_id == userId);

            if (candidate == null)
            {
                return new ServiceResponse<CandidateProfileDto> { Success = false, Message = "Candidate profile not found." };
            }

            var profileDto = new CandidateProfileDto
            {
                FirstName = candidate.first_name,
                LastName = candidate.last_name,
                Email = candidate.email,
                Phone = candidate.phone,
                CvPath = candidate.cv_path
            };

            return new ServiceResponse<CandidateProfileDto> { Data = profileDto };
        }

        // ... (The rest of your methods like GetOpenJobsAsync, GetMyApplicationsAsync, and UpdateCvAsync remain the same)
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
        public async Task<ServiceResponse<List<MyApplicationDto>>> GetMyApplicationsAsync()
        {
            var userId = GetCurrentUserId();
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.user_id == userId);
            if (candidate == null)
            {
                return new ServiceResponse<List<MyApplicationDto>> { Data = new List<MyApplicationDto>(), Message = "No candidate profile is linked to this user account." };
            }
            var applications = await _context.Applications
                .Where(a => a.candidate_id == candidate.candidate_id)
                .Include(a => a.Job)
                .Select(a => new MyApplicationDto
                {
                    ApplicationId = a.application_id,
                    JobTitle = a.Job.title,
                    ApplicationStatus = a.status,
                    AppliedAt = a.applied_at
                })
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();
            return new ServiceResponse<List<MyApplicationDto>> { Data = applications };
        }
        public async Task<ServiceResponse<string>> UpdateCvAsync(IFormFile cvFile)
        {
            var userId = GetCurrentUserId();
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.user_id == userId);
            if (candidate == null)
            {
                return new ServiceResponse<string> { Success = false, Message = "Candidate profile not found." };
            }
            if (cvFile == null || cvFile.Length == 0)
            {
                return new ServiceResponse<string> { Success = false, Message = "No file was uploaded." };
            }
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(cvFile.FileName)}";
            var folderPath = Path.Combine("wwwroot", "cvs");
            var filePath = Path.Combine(folderPath, fileName);
            Directory.CreateDirectory(folderPath);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await cvFile.CopyToAsync(stream);
            }
            candidate.cv_path = Path.Combine("cvs", fileName);
            await _context.SaveChangesAsync();
            return new ServiceResponse<string> { Data = candidate.cv_path, Message = "CV updated successfully." };
        }
        #endregion
    }
}


