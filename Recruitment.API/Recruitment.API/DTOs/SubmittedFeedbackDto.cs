namespace Recruitment.API.DTOs
{
    public class SubmittedFeedbackDto
    {
        public string InterviewerName { get; set; }
        public int? Rating { get; set; }
        public string Comments { get; set; }
        public string Recommendation { get; set; }
        public DateTime SubmittedAt { get; set; }
        public int InterviewerId { get; set; }
    }
}
