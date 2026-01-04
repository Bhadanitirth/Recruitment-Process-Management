using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Recruitment.API.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Dashboard Stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetSystemStats()
        {
            var stats = new
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalJobs = await _context.Jobs.CountAsync(),
                ActiveJobs = await _context.Jobs.CountAsync(j => j.status == "Open"),
                TotalCandidates = await _context.Candidates.CountAsync(),
                TotalApplications = await _context.Applications.CountAsync(),
                HiredCandidates = await _context.Applications.CountAsync(a => a.status == "Hired")
            };
            return Ok(new { Success = true, Data = stats });
        }

        // 2. User Management
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new
                {
                    u.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    Role = u.Role.role_name
                })
                .ToListAsync();

            return Ok(new { Success = true, Data = users });
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { Success = false, Message = "User not found" });

            // Optional: Prevent deleting self (needs HTTP context check) or the last Admin
            if (user.role_id == 1) // Assuming 1 is Admin
            {
                // Logic to prevent deleting the last admin could go here
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { Success = true, Message = "User deleted successfully" });
        }
    }
}