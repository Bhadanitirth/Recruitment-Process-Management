using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepo;

        public AuthController(IAuthRepository authRepo)
        {
            _authRepo = authRepo;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var response = await _authRepo.Register(registerDto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var response = await _authRepo.Login(loginDto);
            if (!response.Success) return Unauthorized(response);
            return Ok(response);
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto request)
        {
            var response = await _authRepo.ForgotPassword(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpDto request)
        {
            var response = await _authRepo.VerifyOtp(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto request)
        {
            var response = await _authRepo.ResetPassword(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}