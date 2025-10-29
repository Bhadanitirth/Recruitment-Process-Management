using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; 

namespace Recruitment.API.Models
{
    [Table("Job_Reviewers")]
    public class JobReviewer
    {
        [Key]
        public int job_reviewer_id { get; set; }

        public int job_id { get; set; }
        [ForeignKey("job_id")] 
        public virtual Job Job { get; set; }

        public int reviewer_user_id { get; set; }
        [ForeignKey("reviewer_user_id")] 
        public virtual User Reviewer { get; set; }
    }
}

