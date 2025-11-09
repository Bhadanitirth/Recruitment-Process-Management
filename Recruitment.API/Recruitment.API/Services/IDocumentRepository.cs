using Microsoft.AspNetCore.Http;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Recruitment.API.Services
{
    public interface IDocumentRepository
    {
        Task<ServiceResponse<List<HrApplicationDto>>> GetHrDashboardAsync();
        Task<ServiceResponse<List<CandidateDocumentDto>>> GetDocumentsForApplicationAsync(int applicationId);

        Task<ServiceResponse<CandidateDocumentDto>> UploadDocumentAsync(int applicationId, string documentType, IFormFile file);

        Task<ServiceResponse<CandidateDocumentDto>> UploadOfferLetterAsync(int applicationId, IFormFile file);
        Task<ServiceResponse<CandidateDocumentDto>> VerifyDocumentAsync(int documentId, bool isVerified);
        Task<ServiceResponse<Application>> FinalizeSelectionAsync(int applicationId, FinalSelectionDto selectionDto);
    }
}