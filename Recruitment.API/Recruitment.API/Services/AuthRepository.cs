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

            if (user == null)
            {
                response.Success = false;
                response.Message = "User not found.";
                return response;
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.password_hash))
            {
                response.Success = false;
                response.Message = "Invalid password.";
                return response;
            }

            // --- ADMIN BYPASS LOGIC ---
            // If user is Admin, we skip the tab check. They can login from anywhere.
            if (user.Role.role_name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                // Admin detected, allow access immediately
            }
            else
            {
                // Standard role check for non-admins
                bool isRoleMatch = string.Equals(user.Role.role_name, request.UserType, StringComparison.OrdinalIgnoreCase);

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
                    response.Message = $"Access denied. Account role is '{user.Role.role_name}', but you tried to login as '{request.UserType}'.";
                    return response;
                }
            }

            response.Data = CreateToken(user);
            response.Message = "Login successful!";
            return response;
        }

        // ... (Keep Register, ForgotPassword, VerifyOtp, ResetPassword, CreateToken, UserExists exactly as they were) ...
        #region Existing Methods
        public async Task<ServiceResponse<int>> Register(RegisterDto request)
        {
            if (await UserExists(request.Email)) return new ServiceResponse<int> { Success = false, Message = "User already exists." };

            var roleName = request.Role;
            if (roleName == "Technical Interviewer") roleName = "Interviewer";

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.role_name == roleName)
                       ?? await _context.Roles.FirstOrDefaultAsync(r => r.role_name == request.Role);

            if (role == null) return new ServiceResponse<int> { Success = false, Message = $"Invalid Role: {request.Role}" };

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            User user = new User { first_name = request.FirstName, last_name = request.LastName, email = request.Email, password_hash = passwordHash, role_id = role.role_id };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return new ServiceResponse<int> { Data = user.user_id, Message = "Registration successful!" };
        }

        public async Task<bool> UserExists(string email) => await _context.Users.AnyAsync(user => user.email.ToLower() == email.ToLower());

        public async Task<ServiceResponse<string>> ForgotPassword(ForgotPasswordDto request)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.email.ToLower() == request.Email.ToLower());
            if (user == null) return new ServiceResponse<string> { Success = false, Message = "User not found." };

            // Allow admin to use forgot password from any tab too? Preferably restricted, but for now standard logic:
            // We reuse the bypass logic or strict check. Let's keep strict check for security on reset, or relax for admin.
            // For simplicity in this update, keeping previous logic but you might want to relax it for Admin similar to Login.

            var otp = new Random().Next(100000, 999999).ToString();
            user.otp_code = otp;
            user.otp_expiry = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();
            try { await _emailService.SendEmailAsync(user.email, "Password Reset OTP", $"OTP: {otp}"); }
            catch (Exception ex) { return new ServiceResponse<string> { Success = false, Message = "Email failed: " + ex.Message }; }
            return new ServiceResponse<string> { Data = "OTP Sent", Message = "OTP sent." };
        }

        public async Task<ServiceResponse<bool>> VerifyOtp(VerifyOtpDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.email.ToLower() == request.Email.ToLower());
            if (user == null || user.otp_code != request.Otp) return new ServiceResponse<bool> { Success = false, Message = "Invalid OTP." };
            if (user.otp_expiry < DateTime.UtcNow) return new ServiceResponse<bool> { Success = false, Message = "OTP Expired." };
            return new ServiceResponse<bool> { Data = true, Message = "Verified." };
        }

        public async Task<ServiceResponse<bool>> ResetPassword(ResetPasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.email.ToLower() == request.Email.ToLower());
            if (user == null || user.otp_code != request.Otp) return new ServiceResponse<bool> { Success = false, Message = "Invalid request." };
            user.password_hash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.otp_code = null;
            user.otp_expiry = null;
            await _context.SaveChangesAsync();
            return new ServiceResponse<bool> { Data = true, Message = "Password reset." };
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.user_id.ToString()),
                new Claim("email", user.email),
                new Claim(ClaimTypes.Role, user.Role.role_name)
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("Jwt:Key").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            var token = new JwtSecurityToken(
                _configuration.GetSection("Jwt:Issuer").Value,
                _configuration.GetSection("Jwt:Audience").Value,
                claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        #endregion
    }
}