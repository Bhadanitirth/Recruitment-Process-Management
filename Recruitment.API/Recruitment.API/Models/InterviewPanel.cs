using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    [Table("Interview_Panel")] 
    public class InterviewPanel
    {
        [Key]
        public int interview_panel_id { get; set; }
        public int interview_id { get; set; }
        public int interviewer_user_id { get; set; }

        [ForeignKey("interview_id")]
        public virtual Interview Interview { get; set; }

        [ForeignKey("interviewer_user_id")]
        public virtual User Interviewer { get; set; }
    }
}
