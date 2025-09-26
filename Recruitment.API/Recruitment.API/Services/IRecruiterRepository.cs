using Microsoft.AspNetCore.Http;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Recruitment.API.Services
{
    public interface IRecruiterRepository
    {
        Task<ServiceResponse<Job>> CreateJobAsync(JobCreateDto jobDto);
        Task<ServiceResponse<List<Job>>> GetJobsAsync();
        Task<ServiceResponse<Candidate>> CreateCandidateAsync(CandidateCreateDto candidateDto, IFormFile cvFile);

        Task<ServiceResponse<List<Candidate>>> GetCandidatesAsync();
        Task<ServiceResponse<int>> BulkCreateCandidatesAsync(IFormFile file);
        Task<ServiceResponse<List<Skill>>> GetSkillsAsync();
        Task<ServiceResponse<Skill>> CreateSkillAsync(SkillCreateDto skillDto);
        Task<ServiceResponse<Application>> LinkCandidateToJobAsync(int jobId, ApplicationCreateDto appDto);
        Task<ServiceResponse<List<Application>>> GetApplicationsAsync();
    }
}

