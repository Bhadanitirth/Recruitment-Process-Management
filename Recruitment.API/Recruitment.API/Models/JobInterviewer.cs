using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    [Table("Job_Interviewers")] 
    public class JobInterviewer
    {
        [Key]
        public int job_interviewer_id { get; set; }
        public int job_id { get; set; }
        public int interviewer_user_id { get; set; }

        [ForeignKey("job_id")]
        public virtual Job Job { get; set; }

        [ForeignKey("interviewer_user_id")]
        public virtual User Interviewer { get; set; }
    }
}
