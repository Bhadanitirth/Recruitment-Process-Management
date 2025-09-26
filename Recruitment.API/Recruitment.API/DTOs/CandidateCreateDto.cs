namespace Recruitment.API.DTOs
{
    public class CandidateCreateDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string? Phone { get; set; }

        public IFormFile? CvFile { get; set; }
    }
}
