using Recruitment.API.DTOs;
using Recruitment.API.Models;

namespace Recruitment.API.Services
{
    public interface IAuthRepository
    {
        Task<ServiceResponse<int>> Register(RegisterDto request);
        Task<ServiceResponse<string>> Login(LoginDto request);
    }
}