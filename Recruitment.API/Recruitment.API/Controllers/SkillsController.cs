using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Recruiter")]
public class SkillsController : ControllerBase
{
    private readonly IRecruiterRepository _recruiterRepo;

    public SkillsController(IRecruiterRepository recruiterRepo)
    {
        _recruiterRepo = recruiterRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetSkills()
    {
        var response = await _recruiterRepo.GetSkillsAsync();
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSkill(SkillCreateDto skillDto)
    {
        var response = await _recruiterRepo.CreateSkillAsync(skillDto);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}

