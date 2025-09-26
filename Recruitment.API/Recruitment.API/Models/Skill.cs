using System.ComponentModel.DataAnnotations;

namespace Recruitment.API.Models
{
    public class Skill
    {
        [Key]
        public int skill_id { get; set; }
        public string skill_name { get; set; }
    }
}
