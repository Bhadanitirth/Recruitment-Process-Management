namespace Recruitment.API.DTOs
{
    public class FeedbackSubmitDto
    {
        public int? Rating { get; set; }
        public string Comments { get; set; }
        public string Recommendation { get; set; }
    }
}
