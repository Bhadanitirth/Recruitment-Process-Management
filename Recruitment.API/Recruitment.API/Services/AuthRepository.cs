using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Recruitment.API.Data;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using Microsoft.Extensions.Configuration;

namespace Recruitment.API.Services
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthRepository(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<ServiceResponse<string>> Login(LoginDto request)
        {
            var response = new ServiceResponse<string>();
            var user = await _context.Users.Include(u => u.Role)
                           .FirstOrDefaultAsync(u => u.email.ToLower().Equals(request.Email.ToLower()));

            // 1. Check if user exists
            if (user == null)
            {
                response.Success = false;
                response.Message = "User not found.";
                return response;
            }

            // 2. Check Password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.password_hash))
            {
                response.Success = false;
                response.Message = "Invalid password.";
                return response;
            }

            // 3. Check Role (With enhanced logic for HR/Interviewer)
            bool isRoleMatch = string.Equals(user.Role.role_name, request.UserType, StringComparison.OrdinalIgnoreCase);

            // Allow HR or Technical Interviewer to login via "Interviewer" tab
            if (!isRoleMatch && request.UserType.Equals("Interviewer", StringComparison.OrdinalIgnoreCase))
            {
                if (user.Role.role_name.Equals("HR", StringComparison.OrdinalIgnoreCase) ||
                    user.Role.role_name.Equals("Technical Interviewer", StringComparison.OrdinalIgnoreCase))
                {
                    isRoleMatch = true;
                }
            }

            if (!isRoleMatch)
            {
                response.Success = false;
                // Detailed error message for debugging
                response.Message = $"Access denied. Your account is registered as '{user.Role.role_name}', but you are trying to login as '{request.UserType}'. Please switch tabs.";
                return response;
            }

            response.Data = CreateToken(user);
            return response;
        }

        public async Task<ServiceResponse<int>> Register(RegisterDto request)
        {
            if (await UserExists(request.Email))
            {
                return new ServiceResponse<int> { Success = false, Message = "User already exists." };
            }

            // Ensure we handle "Technical Interviewer" mapping if the frontend sends that specific string
            string roleToFind = request.Role;
            if (roleToFind == "Technical Interviewer") roleToFind = "Interviewer"; // Map if needed based on your DB seed

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.role_name == roleToFind);
            if (role == null)
            {
                // Fallback: Try exact match if mapping didn't work
                role = await _context.Roles.FirstOrDefaultAsync(r => r.role_name == request.Role);
                if (role == null)
                    return new ServiceResponse<int> { Success = false, Message = $"Invalid Role: {request.Role}. Role does not exist in DB." };
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            User user = new User
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

        public async Task<ServiceResponse<string>> ForgotPassword(ForgotPasswordDto request)
        {
            var user = await _context.Users.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.email.ToLower() == request.Email.ToLower());

            if (user == null)
            {
                return new ServiceResponse<string> { Success = false, Message = "User not found." };
            }

            // Generate 6 digit OTP
            var otp = new Random().Next(100000, 999999).ToString();

            user.otp_code = otp;
            user.otp_expiry = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();

            string subject = "Password Reset OTP - ROIMA";
            string body = $@"<h3>Password Reset Request</h3>
                             <p>Your OTP code is: <strong>{otp}</strong></p>
                             <p>This code expires in 15 minutes.</p>";

            try
            {
                await _emailService.SendEmailAsync(user.email, subject, body);
            }
            catch (Exception ex)
            {
                return new ServiceResponse<string> { Success = false, Message = "Failed to send email: " + ex.Message };
            }

            return new ServiceResponse<string> { Data = "OTP Sent", Message = "OTP sent to your email." };
        }

        public async Task<ServiceResponse<bool>> VerifyOtp(VerifyOtpDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.email.ToLower() == request.Email.ToLower());

            if (user == null || user.otp_code != request.Otp)
            {
                return new ServiceResponse<bool> { Success = false, Message = "Invalid OTP." };
            }

            if (user.otp_expiry < DateTime.UtcNow)
            {
                return new ServiceResponse<bool> { Success = false, Message = "OTP has expired." };
            }

            return new ServiceResponse<bool> { Data = true, Message = "OTP Verified." };
        }

        public async Task<ServiceResponse<bool>> ResetPassword(ResetPasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.email.ToLower() == request.Email.ToLower());

            if (user == null || user.otp_code != request.Otp)
            {
                return new ServiceResponse<bool> { Success = false, Message = "Invalid request." };
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.password_hash = passwordHash;

            // Clear OTP
            user.otp_code = null;
            user.otp_expiry = null;

            await _context.SaveChangesAsync();

            return new ServiceResponse<bool> { Data = true, Message = "Password reset successfully." };
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.user_id.ToString()),
                new Claim("email", user.email),
                new Claim(ClaimTypes.Role, user.Role.role_name)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("Jwt:Key").Value));
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