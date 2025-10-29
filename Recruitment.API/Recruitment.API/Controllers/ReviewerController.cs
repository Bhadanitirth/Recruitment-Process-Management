using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/reviewer")]
    [ApiController]
    [Authorize(Roles = "Reviewer")] 
    public class ReviewerController : ControllerBase
    {
        private readonly IReviewerRepository _reviewerRepo;

        public ReviewerController(IReviewerRepository reviewerRepo)
        {
            _reviewerRepo = reviewerRepo;
        }

        [HttpGet("assigned-applications")]
        public async Task<IActionResult> GetAssignedApplications()
        {
            var response = await _reviewerRepo.GetAssignedApplicationsAsync();
            return Ok(response);
        }
    }
}
