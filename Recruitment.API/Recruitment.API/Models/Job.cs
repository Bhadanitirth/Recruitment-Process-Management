using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    public class Job
    {
        [Key]
        public int job_id { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string status { get; set; } = "Open";
        public string? status_reason { get; set; }
        public int created_by_user_id { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("created_by_user_id")]
        public virtual User CreatedBy { get; set; }
    }
}
