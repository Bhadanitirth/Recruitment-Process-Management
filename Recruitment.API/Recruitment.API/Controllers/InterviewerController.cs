using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.Services;
using System.Threading.Tasks;

[Route("api/interviewer")]
[ApiController]
[Authorize(Roles = "Interviewer")]
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

