namespace Recruitment.API.DTOs
{
    public class ReportChartDataDto
    {
        public string Label { get; set; }
        public int Value { get; set; }
    }

    public class DashboardSummaryDto
    {
        public int TotalJobs { get; set; }
        public int TotalCandidates { get; set; }
        public int InterviewsScheduled { get; set; }
        public int HiredCount { get; set; }
    }
}