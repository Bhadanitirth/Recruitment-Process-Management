using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;
using System.Threading.Tasks;
using System;

namespace Recruitment.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Recruiter,Reviewer")]
    public class ApplicationsController : ControllerBase
    {
        private readonly IRecruiterRepository _recruiterRepo;
        private readonly IReviewerRepository _reviewerRepo;

        // --- THIS IS THE CRITICAL FIX ---
        // You must assign BOTH repositories here.
        public ApplicationsController(IRecruiterRepository recruiterRepo, IReviewerRepository reviewerRepo)
        {
            _recruiterRepo = recruiterRepo;
            _reviewerRepo = reviewerRepo; // <--- If this line is missing, the code crashes later!
        }
        // --- END OF FIX ---

        [HttpGet]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> GetApplications()
        {
            if (_recruiterRepo == null) return StatusCode(500, "Internal Server Error: Recruiter Repository not initialized.");
            var response = await _recruiterRepo.GetApplicationsAsync();
            return Ok(response);
        }

        [HttpGet("{applicationId}")]
        public async Task<IActionResult> GetApplicationDetails(int applicationId)
        {
            if (_reviewerRepo == null) return StatusCode(500, "Internal Server Error: Reviewer Repository not initialized.");
            var response = await _reviewerRepo.GetApplicationDetailsAsync(applicationId);

            if (response == null) return StatusCode(500, "Repository returned null response.");

            if (!response.Success)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpPost("{applicationId}/comments")]
        public async Task<IActionResult> AddComment(int applicationId, CommentCreateDto commentDto)
        {
            if (commentDto == null) return BadRequest("Comment data is missing.");
            if (_reviewerRepo == null) return StatusCode(500, "Internal Server Error: Reviewer Repository not initialized.");

            var response = await _reviewerRepo.AddCommentAsync(applicationId, commentDto.CommentText);

            // Guard clause for null response
            if (response == null) return StatusCode(500, "Repository returned null response.");

            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPut("{applicationId}/status")]
        public async Task<IActionResult> UpdateStatus(int applicationId, [FromBody] StatusUpdateDto statusDto)
        {
            // Safety Checks to prevent crashes
            if (statusDto == null) return BadRequest("Invalid request: No status data received.");

            // This check confirms if the fix above worked
            if (_reviewerRepo == null) return StatusCode(500, "Internal Server Error: Reviewer Repository not initialized.");

            try
            {
                var response = await _reviewerRepo.UpdateApplicationStatusAsync(applicationId, statusDto.NewStatus);

                // --- ADDED NULL CHECK HERE ---
                if (response == null)
                {
                    return StatusCode(500, "Internal Server Error: Repository returned null.");
                }

                if (!response.Success)
                {
                    return BadRequest(response);
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Error: {ex.Message}");
            }
        }
    }
}