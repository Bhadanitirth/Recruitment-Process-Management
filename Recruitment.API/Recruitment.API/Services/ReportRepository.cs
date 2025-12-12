using Microsoft.EntityFrameworkCore;
using Recruitment.API.Data;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System; // Required for DateTime

namespace Recruitment.API.Services
{
    public class ReportRepository : IReportRepository
    {
        private readonly ApplicationDbContext _context;

        public ReportRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- UPDATED METHOD: GetHeadlinesAsync ---
        public async Task<ServiceResponse<DashboardSummaryDto>> GetHeadlinesAsync()
        {
            var today = DateTime.UtcNow.Date; // Get today's date (UTC)
            var tomorrow = today.AddDays(1);

            var summary = new DashboardSummaryDto
            {
                TotalJobs = await _context.Jobs.CountAsync(j => j.status == "Open"),
                TotalCandidates = await _context.Candidates.CountAsync(),

                // Count interviews where scheduled_at is >= today AND < tomorrow
                InterviewsScheduled = await _context.Interviews
                    .CountAsync(i => i.status == "Scheduled" &&
                                     i.scheduled_at >= today &&
                                     i.scheduled_at < tomorrow),

                HiredCount = await _context.Applications.CountAsync(a => a.status == "Hired")
            };
            return new ServiceResponse<DashboardSummaryDto> { Data = summary };
        }
        // --- END OF UPDATE ---

        // ... (The rest of your methods: GetPositionStatsAsync, GetCollegeStatsAsync, etc. remain unchanged)
        #region Unchanged Methods
        public async Task<ServiceResponse<List<ReportChartDataDto>>> GetPositionStatsAsync() { var data = await _context.Applications.Include(a => a.Job).GroupBy(a => a.Job.title).Select(g => new ReportChartDataDto { Label = g.Key, Value = g.Count() }).ToListAsync(); return new ServiceResponse<List<ReportChartDataDto>> { Data = data }; }
        public async Task<ServiceResponse<List<ReportChartDataDto>>> GetCollegeStatsAsync() { var data = await _context.Candidates.Where(c => !string.IsNullOrEmpty(c.college_name)).GroupBy(c => c.college_name).Select(g => new ReportChartDataDto { Label = g.Key, Value = g.Count() }).ToListAsync(); return new ServiceResponse<List<ReportChartDataDto>> { Data = data }; }
        public async Task<ServiceResponse<List<ReportChartDataDto>>> GetCandidateFunnelAsync() { var data = await _context.Applications.GroupBy(a => a.status).Select(g => new ReportChartDataDto { Label = g.Key, Value = g.Count() }).ToListAsync(); return new ServiceResponse<List<ReportChartDataDto>> { Data = data }; }
        public async Task<ServiceResponse<List<ReportChartDataDto>>> GetTechnologyStatsAsync() { var skillCounts = await _context.Job_Skills.Include(js => js.Skill).GroupBy(js => js.Skill.skill_name).Select(g => new ReportChartDataDto { Label = g.Key, Value = g.Count() }).OrderByDescending(x => x.Value).Take(10).ToListAsync(); return new ServiceResponse<List<ReportChartDataDto>> { Data = skillCounts }; }
        #endregion
    }
}