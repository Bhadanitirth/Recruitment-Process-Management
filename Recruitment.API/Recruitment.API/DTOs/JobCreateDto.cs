namespace Recruitment.API.DTOs
{
    public class JobCreateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }

        public List<int> RequiredSkillIds { get; set; }
        public List<int> PreferredSkillIds { get; set; }
    }
}
