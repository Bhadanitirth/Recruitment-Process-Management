using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/candidate")]
    [ApiController]
    [Authorize(Roles = "Candidate")]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateRepository _candidateRepo;

        public CandidateController(ICandidateRepository candidateRepo)
        {
            _candidateRepo = candidateRepo;
        }

        // --- ADD THIS NEW ENDPOINT ---
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var response = await _candidateRepo.GetMyProfileAsync();
            if (!response.Success)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        // ... (The rest of your endpoints: GetOpenJobs, GetMyApplications, UploadCv remain the same)
        #region Unchanged Endpoints
        [HttpGet("jobs")]
        public async Task<IActionResult> GetOpenJobs()
        {
            var response = await _candidateRepo.GetOpenJobsAsync();
            return Ok(response);
        }
        [HttpGet("my-applications")]
        public async Task<IActionResult> GetMyApplications()
        {
            var response = await _candidateRepo.GetMyApplicationsAsync();
            return Ok(response);
        }
        [HttpPost("cv-upload")]
        public async Task<IActionResult> UploadCv(IFormFile file)
        {
            var response = await _candidateRepo.UpdateCvAsync(file);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
        #endregion
    }
}

