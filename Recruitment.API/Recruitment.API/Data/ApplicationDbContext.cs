using Microsoft.EntityFrameworkCore;
using Recruitment.API.Models; 

namespace Recruitment.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; }

    }
}
