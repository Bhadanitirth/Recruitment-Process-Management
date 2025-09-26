using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    public class JobSkill
    {
        [Key]
        public int job_skill_id { get; set; }
        public int job_id { get; set; }
        public int skill_id { get; set; }
        public bool is_required { get; set; }

        [ForeignKey("job_id")]
        public Job Job { get; set; }

        [ForeignKey("skill_id")]
        public Skill Skill { get; set; }
    }
}

