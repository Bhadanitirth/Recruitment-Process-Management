using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Recruiter,Admin")] 
    public class ReportsController : ControllerBase
    {
        private readonly IReportRepository _repo;
        private readonly PdfReportService _pdfService;

        public ReportsController(IReportRepository repo, PdfReportService pdfService)
        {
            _repo = repo;
            _pdfService = pdfService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var response = await _repo.GetHeadlinesAsync();
            return Ok(response);
        }

        [HttpGet("position-stats")]
        public async Task<IActionResult> GetPositionStats()
        {
            var response = await _repo.GetPositionStatsAsync();
            return Ok(response);
        }

        [HttpGet("college-stats")]
        public async Task<IActionResult> GetCollegeStats()
        {
            var response = await _repo.GetCollegeStatsAsync();
            return Ok(response);
        }

        [HttpGet("funnel-stats")]
        public async Task<IActionResult> GetFunnelStats()
        {
            var response = await _repo.GetCandidateFunnelAsync();
            return Ok(response);
        }

        // --- PDF DOWNLOAD ENDPOINT ---
        [HttpGet("download-pdf/{type}")]
        public async Task<IActionResult> DownloadReport(string type)
        {
            var dataResponse = type switch
            {
                "position" => await _repo.GetPositionStatsAsync(),
                "college" => await _repo.GetCollegeStatsAsync(),
                "funnel" => await _repo.GetCandidateFunnelAsync(),
                _ => null
            };

            if (dataResponse == null || !dataResponse.Success) return BadRequest("Invalid report type.");

            var pdfBytes = _pdfService.GeneratePdfReport($"{type.ToUpper()} REPORT", dataResponse.Data);

            return File(pdfBytes, "application/pdf", $"{type}_report.pdf");
        }
    }
}