using System;
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

        [ForeignKey("candidate_id")]
        public Candidate Candidate { get; set; }

        [ForeignKey("job_id")]
        public Job Job { get; set; }
    }
}
