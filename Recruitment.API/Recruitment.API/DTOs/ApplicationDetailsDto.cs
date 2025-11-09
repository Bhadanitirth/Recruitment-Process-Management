namespace Recruitment.API.DTOs
{
    public class ApplicationDetailsDto
    {
        public int ApplicationId { get; set; }
        public string ApplicationStatus { get; set; }
        public string CandidateName { get; set; }
        public string CandidateEmail { get; set; }
        public string CandidateCvPath { get; set; }
        public List<CommentDto> Comments { get; set; }
        public List<PastApplicationDto> PastApplications { get; set; }
        public int CurrentUserId { get; set; } 
        public List<SubmittedFeedbackDto> SubmittedFeedback { get; set; } 
        public int JobId { get; set; }
        public string LatestInterviewType { get; set; }
        public DateTime? LatestInterviewScheduledAt { get; set; }
        public string LatestInterviewStatus { get; set; }
    }
}
