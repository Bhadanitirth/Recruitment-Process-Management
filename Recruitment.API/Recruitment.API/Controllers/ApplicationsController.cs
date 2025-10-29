using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Recruiter,Reviewer")]
    public class ApplicationsController : ControllerBase
    {
        private readonly IRecruiterRepository _recruiterRepo;
        private readonly IReviewerRepository _reviewerRepo;

        public ApplicationsController(IRecruiterRepository recruiterRepo, IReviewerRepository reviewerRepo)
        {
            _recruiterRepo = recruiterRepo;
            _reviewerRepo = reviewerRepo;
        }

        [HttpGet]
        [Authorize(Roles = "Recruiter")] 
        public async Task<IActionResult> GetApplications()
        {
            var response = await _recruiterRepo.GetApplicationsAsync();
            return Ok(response);
        }

        [HttpGet("{applicationId}")]
        public async Task<IActionResult> GetApplicationDetails(int applicationId)
        {
            var response = await _reviewerRepo.GetApplicationDetailsAsync(applicationId);
            if (!response.Success)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpPost("{applicationId}/comments")]
        public async Task<IActionResult> AddComment(int applicationId, CommentCreateDto commentDto)
        {
            var response = await _reviewerRepo.AddCommentAsync(applicationId, commentDto.CommentText);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPut("{applicationId}/status")]
        public async Task<IActionResult> UpdateStatus(int applicationId, StatusUpdateDto statusDto)
        {
            var response = await _reviewerRepo.UpdateApplicationStatusAsync(applicationId, statusDto.NewStatus);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
    }
}

