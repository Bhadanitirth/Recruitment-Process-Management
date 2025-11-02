using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    [Table("Interview_Feedback")] 
    public class InterviewFeedback
    {
        [Key]
        public int feedback_id { get; set; }
        public int interview_id { get; set; }
        public int interviewer_user_id { get; set; }
        public int? rating { get; set; }
        public string comments { get; set; }
        public string recommendation { get; set; } 
        public DateTime submitted_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("interview_id")]
        public virtual Interview Interview { get; set; }

        [ForeignKey("interviewer_user_id")]
        public virtual User Interviewer { get; set; }
    }
}
