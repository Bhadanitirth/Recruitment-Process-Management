using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    public class Candidate
    {
        [Key]
        public int candidate_id { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string email { get; set; }
        public string? phone { get; set; }
        public string? cv_path { get; set; }
        public int created_by_user_id { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public int? user_id { get; set; }

        [ForeignKey("created_by_user_id")]
        public virtual User CreatedBy { get; set; }
    }
}
