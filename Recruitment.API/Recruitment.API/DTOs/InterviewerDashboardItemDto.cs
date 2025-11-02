namespace Recruitment.API.DTOs
{
    public class InterviewerDashboardItemDto
    {
        public int InterviewId { get; set; }
        public string CandidateName { get; set; }
        public string JobTitle { get; set; }
        public string InterviewType { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string Status { get; set; }
    }
}
