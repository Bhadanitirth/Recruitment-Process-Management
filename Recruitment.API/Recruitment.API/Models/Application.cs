using System;
using System.Collections.Generic; 
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    public class Application
    {
        [Key]
        public int application_id { get; set; }
        public int candidate_id { get; set; }
        public int job_id { get; set; }
        public string status { get; set; } = "Applied";
        public DateTime applied_at { get; set; } = DateTime.UtcNow;
        public DateTime? joining_date { get; set; } 
        public virtual ICollection<Interview> Interviews { get; set; }
        public virtual ICollection<CandidateDocument> Documents { get; set; }

        [ForeignKey("candidate_id")]
        public virtual Candidate Candidate { get; set; } 

        [ForeignKey("job_id")]
        public virtual Job Job { get; set; }


        
    }
}

