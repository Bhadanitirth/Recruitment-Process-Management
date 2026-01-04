using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/interviewer")]
    [ApiController]
    [Authorize(Roles = "Interviewer,HR,Admin")]
    public class InterviewerController : ControllerBase
    {
        private readonly IInterviewerRepository _interviewerRepo;

        public InterviewerController(IInterviewerRepository interviewerRepo)
        {
            _interviewerRepo = interviewerRepo;
        }

        [HttpGet("assigned-interviews")]
        public async Task<IActionResult> GetAssignedInterviews()
        {
            var response = await _interviewerRepo.GetAssignedInterviewsAsync();
            return Ok(response);
        }
    }
}