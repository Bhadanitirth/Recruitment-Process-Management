using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    public class ApplicationComment
    {
        [Key]
        public int comment_id { get; set; }
        public int application_id { get; set; }
        public int user_id { get; set; }
        public string comment { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("user_id")]
        public virtual User User { get; set; }
    }
}
