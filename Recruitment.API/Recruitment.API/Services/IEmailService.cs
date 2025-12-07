using System.Threading.Tasks;

namespace Recruitment.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
    }
}