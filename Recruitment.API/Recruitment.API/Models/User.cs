using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recruitment.API.Models
{
    public class User
    {
        [Key]
        public int user_id { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string email { get; set; }
        public string password_hash { get; set; }
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public Role Role { get; set; }
    }
}