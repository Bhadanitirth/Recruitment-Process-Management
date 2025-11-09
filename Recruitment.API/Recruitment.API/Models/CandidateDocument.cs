using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    [Table("Candidate_Documents")] 
    public class CandidateDocument
    {
        [Key]
        public int document_id { get; set; }
        public int application_id { get; set; }
        public string document_type { get; set; }
        public string file_path { get; set; }
        public string verification_status { get; set; } = "Pending";
        public int uploaded_by_user_id { get; set; }
        public DateTime uploaded_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("application_id")]
        public virtual Application Application { get; set; }

        [ForeignKey("uploaded_by_user_id")]
        public virtual User Uploader { get; set; }
    }
}