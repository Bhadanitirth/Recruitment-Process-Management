using Microsoft.AspNetCore.Http;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Recruitment.API.Services
{
    public interface ICandidateRepository
    {
        Task<ServiceResponse<List<JobListingDto>>> GetOpenJobsAsync();
        Task<ServiceResponse<List<MyApplicationDto>>> GetMyApplicationsAsync();
        Task<ServiceResponse<string>> UpdateCvAsync(IFormFile cvFile);
        Task<ServiceResponse<CandidateProfileDto>> GetMyProfileAsync();
    }
}