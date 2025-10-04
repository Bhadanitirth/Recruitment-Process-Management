namespace Recruitment.API.DTOs
{
    public class MyApplicationDto
    {
        public int ApplicationId { get; set; }
        public string JobTitle { get; set; }
        public string ApplicationStatus { get; set; }
        public DateTime AppliedAt { get; set; }
    }
}
