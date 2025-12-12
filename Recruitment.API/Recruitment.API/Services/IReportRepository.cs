using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Recruitment.API.Services
{
    public interface IReportRepository
    {
        Task<ServiceResponse<DashboardSummaryDto>> GetHeadlinesAsync();
        Task<ServiceResponse<List<ReportChartDataDto>>> GetPositionStatsAsync();
        Task<ServiceResponse<List<ReportChartDataDto>>> GetCollegeStatsAsync();
        Task<ServiceResponse<List<ReportChartDataDto>>> GetCandidateFunnelAsync();
        Task<ServiceResponse<List<ReportChartDataDto>>> GetTechnologyStatsAsync();
    }
}