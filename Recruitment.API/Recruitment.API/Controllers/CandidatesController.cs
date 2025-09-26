using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Recruiter")]
    public class CandidatesController : ControllerBase
    {
        private readonly IRecruiterRepository _recruiterRepo;

        public CandidatesController(IRecruiterRepository recruiterRepo)
        {
            _recruiterRepo = recruiterRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetCandidates()
        {
            var response = await _recruiterRepo.GetCandidatesAsync();
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCandidate([FromForm] CandidateCreateDto candidateDto)
        {
            var response = await _recruiterRepo.CreateCandidateAsync(candidateDto, candidateDto.CvFile);

            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPost("bulk-upload")]
        public async Task<IActionResult> BulkCreateCandidates(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var response = await _recruiterRepo.BulkCreateCandidatesAsync(file);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
    }
}

