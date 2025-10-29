using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Threading.Tasks;

namespace Recruitment.API.Services
{
    public interface IReviewerRepository
    {
        Task<ServiceResponse<ApplicationDetailsDto>> GetApplicationDetailsAsync(int applicationId);
        Task<ServiceResponse<ApplicationComment>> AddCommentAsync(int applicationId, string commentText);
        Task<ServiceResponse<bool>> UpdateApplicationStatusAsync(int applicationId, string newStatus);
        Task<ServiceResponse<List<ReviewerApplicationDto>>> GetAssignedApplicationsAsync();
    }
}

