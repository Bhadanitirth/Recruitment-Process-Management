using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Recruitment.API.Services
{
    public interface IInterviewerRepository
    {
        Task<ServiceResponse<List<InterviewerDashboardItemDto>>> GetAssignedInterviewsAsync();
        Task<ServiceResponse<InterviewDetailsDto>> GetInterviewDetailsAsync(int interviewId);
        Task<ServiceResponse<InterviewFeedback>> SubmitFeedbackAsync(int interviewId, FeedbackSubmitDto feedbackDto);
    }
}

