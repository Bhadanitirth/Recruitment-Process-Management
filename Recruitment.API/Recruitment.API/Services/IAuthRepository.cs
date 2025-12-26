using Recruitment.API.DTOs;
using Recruitment.API.Models;

namespace Recruitment.API.Services
{
    public interface IAuthRepository
    {
        Task<ServiceResponse<int>> Register(RegisterDto request);
        Task<ServiceResponse<string>> Login(LoginDto request);
        Task<ServiceResponse<string>> ForgotPassword(ForgotPasswordDto request);
        Task<ServiceResponse<bool>> VerifyOtp(VerifyOtpDto request);
        Task<ServiceResponse<bool>> ResetPassword(ResetPasswordDto request);
    }
}