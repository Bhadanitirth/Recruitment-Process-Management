using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Recruiter")]
public class JobsController : ControllerBase
{
    private readonly IRecruiterRepository _recruiterRepo;

    public JobsController(IRecruiterRepository recruiterRepo)
    {
        _recruiterRepo = recruiterRepo;
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob(JobCreateDto jobDto)
    {
        var response = await _recruiterRepo.CreateJobAsync(jobDto);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs()
    {
        var response = await _recruiterRepo.GetJobsAsync();
        return Ok(response);
    }

    [HttpPost("{jobId}/apply")]
    public async Task<IActionResult> LinkCandidate(int jobId, ApplicationCreateDto appDto)
    {
        var response = await _recruiterRepo.LinkCandidateToJobAsync(jobId, appDto);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}


