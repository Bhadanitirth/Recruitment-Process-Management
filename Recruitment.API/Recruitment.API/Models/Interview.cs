using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    public class Interview
    {
        [Key]
        public int interview_id { get; set; }
        public int application_id { get; set; }
        public int round_number { get; set; }
        public string interview_type { get; set; } 
        public DateTime? scheduled_at { get; set; }
        public string status { get; set; } = "Scheduled"; 

        [ForeignKey("application_id")]
        public virtual Application Application { get; set; }
        public virtual ICollection<InterviewPanel> PanelMembers { get; set; }
    }
}
