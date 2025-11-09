using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;

[Route("api/hr")]
[ApiController]
[Authorize(Roles = "Recruiter,HR")]
public class HRController : ControllerBase
{
    private readonly IDocumentRepository _docRepo;
    public HRController(IDocumentRepository docRepo) { _docRepo = docRepo; }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var response = await _docRepo.GetHrDashboardAsync();
        return Ok(response);
    }

    [HttpPut("documents/{documentId}/verify")]
    public async Task<IActionResult> VerifyDocument(int documentId)
    {
        var response = await _docRepo.VerifyDocumentAsync(documentId, true);
        return Ok(response);
    }

    [HttpPut("documents/{documentId}/reject")]
    public async Task<IActionResult> RejectDocument(int documentId)
    {
        var response = await _docRepo.VerifyDocumentAsync(documentId, false);
        return Ok(response);
    }

    [HttpPut("applications/{applicationId}/select")]
    public async Task<IActionResult> FinalizeSelection(int applicationId, FinalSelectionDto selectionDto)
    {
        var response = await _docRepo.FinalizeSelectionAsync(applicationId, selectionDto);
        if (!response.Success) return BadRequest(response);
        return Ok(response);
    }
}