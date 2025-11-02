using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class InterviewsController : ControllerBase
{
    private readonly IRecruiterRepository _recruiterRepo;
    private readonly IInterviewerRepository _interviewerRepo;

    public InterviewsController(IRecruiterRepository recruiterRepo, IInterviewerRepository interviewerRepo)
    {
        _recruiterRepo = recruiterRepo;
        _interviewerRepo = interviewerRepo;
    }

    [HttpPost]
    [Authorize(Roles = "Recruiter")]
    public async Task<IActionResult> ScheduleInterview(InterviewScheduleDto scheduleDto)
    {
        var response = await _recruiterRepo.ScheduleInterviewAsync(scheduleDto);
        if (!response.Success) return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("{interviewId}")]
    [Authorize(Roles = "Interviewer,Recruiter")] 
    public async Task<IActionResult> GetInterviewDetails(int interviewId)
    {
        var response = await _interviewerRepo.GetInterviewDetailsAsync(interviewId);
        if (!response.Success) return NotFound(response);
        return Ok(response);
    }

    [HttpPost("{interviewId}/feedback")]
    [Authorize(Roles = "Interviewer")]
    public async Task<IActionResult> SubmitFeedback(int interviewId, FeedbackSubmitDto feedbackDto)
    {
        var response = await _interviewerRepo.SubmitFeedbackAsync(interviewId, feedbackDto);
        if (!response.Success) return BadRequest(response);
        return Ok(response);
    }
}

