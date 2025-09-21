using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Recruitment.API.Data;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Recruitment.API.Services
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthRepository(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<ServiceResponse<string>> Login(LoginDto request)
        {
            var response = new ServiceResponse<string>();
            var user = await _context.Users.Include(u => u.Role)
                           .FirstOrDefaultAsync(u => u.email.ToLower().Equals(request.Email.ToLower()));

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.password_hash))
            {
                response.Success = false;
                response.Message = "Invalid credentials.";
                return response;
            }

            if (!string.Equals(user.Role.role_name, request.UserType, StringComparison.OrdinalIgnoreCase))
            {
                response.Success = false;
                response.Message = "Invalid credentials for this user type.";
                return response;
            }

            response.Data = CreateToken(user);
            response.Message = "Login successful!";
            return response;
        }

        public async Task<ServiceResponse<int>> Register(RegisterDto request)
        {
            if (await UserExists(request.Email))
            {
                return new ServiceResponse<int> { Success = false, Message = "User already exists." };
            }

            if (request.Role != "Recruiter" && request.Role != "Interviewer")
            {
                return new ServiceResponse<int> { Success = false, Message = "Registration only available for Recruiters and Interviewers." };
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.role_name == request.Role);
            if (role == null)
            {
                return new ServiceResponse<int> { Success = false, Message = "Invalid role specified." };
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                first_name = request.FirstName,
                last_name = request.LastName,
                email = request.Email,
                password_hash = passwordHash,
                role_id = role.role_id
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new ServiceResponse<int> { Data = user.user_id, Message = "Registration successful!" };
        }

        public async Task<bool> UserExists(string email)
        {
            return await _context.Users.AnyAsync(user => user.email.ToLower() == email.ToLower());
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.user_id.ToString()),
                new Claim(ClaimTypes.Name, user.email),
                new Claim(ClaimTypes.Role, user.Role.role_name)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(_configuration.GetSection("Jwt:Key").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds,
                Issuer = _configuration.GetSection("Jwt:Issuer").Value,
                Audience = _configuration.GetSection("Jwt:Audience").Value
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}