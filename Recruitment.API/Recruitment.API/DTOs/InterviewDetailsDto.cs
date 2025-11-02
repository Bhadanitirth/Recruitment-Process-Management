namespace Recruitment.API.DTOs
{
    public class InterviewDetailsDto
    {
        public int InterviewId { get; set; }
        public int ApplicationId { get; set; }
        public string CandidateName { get; set; }
        public string CandidateCvPath { get; set; }
        public string JobTitle { get; set; }
        public int RoundNumber { get; set; }
        public string InterviewType { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string Status { get; set; }
        public List<string> PanelInterviewerNames { get; set; }
        public int CurrentUserId { get; set; }
        public List<SubmittedFeedbackDto> SubmittedFeedback { get; set; }
    }
}
