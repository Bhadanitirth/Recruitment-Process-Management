using Recruitment.API.Models;
using System.Linq;

namespace Recruitment.API.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context)
        {
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Role { role_name = "Admin" },
                    new Role { role_name = "Recruiter" },
                    new Role { role_name = "Interviewer" },
                    new Role { role_name = "Reviewer" },
                    new Role { role_name = "HR" },
                    new Role { role_name = "Candidate" },
                    new Role { role_name = "Technical Interviewer" }
                );
                context.SaveChanges();
            }

            if (!context.Skills.Any())
            {
                context.Skills.AddRange(
                    new Skill { skill_name = "C#" },
                    new Skill { skill_name = "Java" },
                    new Skill { skill_name = "Python" },
                    new Skill { skill_name = "React" },
                    new Skill { skill_name = "Angular" },
                    new Skill { skill_name = "Vue.js" },
                    new Skill { skill_name = "SQL" },
                    new Skill { skill_name = "Docker" },
                    new Skill { skill_name = "Kubernetes" },
                    new Skill { skill_name = "Azure" },
                    new Skill { skill_name = "AWS" },
                    new Skill { skill_name = "Node.js" }
                );
                context.SaveChanges();
            }
        }
    }
}