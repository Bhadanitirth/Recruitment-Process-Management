using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Recruitment.API.Data;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Recruitment.API.Services
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DocumentRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetCurrentUserId() => int.Parse(_httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier));

        public async Task<ServiceResponse<List<CandidateDocumentDto>>> GetDocumentsForApplicationAsync(int applicationId)
        {
            var documents = await _context.Candidate_Documents
                .Where(d => d.application_id == applicationId)
                .Include(d => d.Uploader)
                .Select(d => new CandidateDocumentDto
                {
                    DocumentId = d.document_id,
                    DocumentType = d.document_type,
                    FilePath = d.file_path,
                    VerificationStatus = d.verification_status,
                    UploaderName = d.Uploader != null ? $"{d.Uploader.first_name} {d.Uploader.last_name}" : "System",
                    UploadedAt = d.uploaded_at
                })
                .OrderBy(d => d.UploadedAt)
                .ToListAsync();

            return new ServiceResponse<List<CandidateDocumentDto>> { Data = documents };
        }

        public async Task<ServiceResponse<CandidateDocumentDto>> UploadDocumentAsync(int applicationId, string documentType, IFormFile file)
        {
            var userId = GetCurrentUserId();
            if (file == null || file.Length == 0)
                return new ServiceResponse<CandidateDocumentDto> { Success = false, Message = "No file uploaded." };

            var (filePath, success, message) = await SaveFileAsync(file, "documents");
            if (!success)
                return new ServiceResponse<CandidateDocumentDto> { Success = false, Message = message };

            var document = new CandidateDocument
            {
                application_id = applicationId,
                document_type = documentType,
                file_path = filePath,
                verification_status = "Pending",
                uploaded_by_user_id = userId
            };

            _context.Candidate_Documents.Add(document);
            await _context.SaveChangesAsync();

            var documentDto = new CandidateDocumentDto { FilePath = document.file_path, DocumentType = document.document_type };
            return new ServiceResponse<CandidateDocumentDto> { Data = documentDto, Message = $"{documentType} uploaded successfully." };
        }

        public async Task<ServiceResponse<CandidateDocumentDto>> UploadOfferLetterAsync(int applicationId, IFormFile file)
        {
            var response = await UploadDocumentAsync(applicationId, "Offer Letter", file);
            if (response.Success)
                response.Message = "Offer Letter uploaded successfully.";

            return response;
        }

        public async Task<ServiceResponse<CandidateDocumentDto>> VerifyDocumentAsync(int documentId, bool isVerified)
        {
            var document = await _context.Candidate_Documents.FindAsync(documentId);
            if (document == null)
                return new ServiceResponse<CandidateDocumentDto> { Success = false, Message = "Document not found." };

            document.verification_status = isVerified ? "Verified" : "Rejected";
            await _context.SaveChangesAsync();

            var dto = new CandidateDocumentDto { DocumentId = document.document_id, VerificationStatus = document.verification_status };
            return new ServiceResponse<CandidateDocumentDto> { Data = dto, Message = $"Document status updated to {document.verification_status}." };
        }

        public async Task<ServiceResponse<Application>> FinalizeSelectionAsync(int applicationId, FinalSelectionDto selectionDto)
        {
            var application = await _context.Applications.FindAsync(applicationId);
            if (application == null)
                return new ServiceResponse<Application> { Success = false, Message = "Application not found." };

            application.status = "Hired";
            application.joining_date = selectionDto.JoiningDate;

            await _context.SaveChangesAsync();
            return new ServiceResponse<Application> { Data = application, Message = "Candidate has been marked as Hired!" };
        }

        private async Task<(string FilePath, bool Success, string Message)> SaveFileAsync(IFormFile file, string subfolder)
        {
            try
            {
                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var folderPath = Path.Combine("wwwroot", subfolder);
                var filePath = Path.Combine(folderPath, fileName);

                Directory.CreateDirectory(folderPath);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return (Path.Combine(subfolder, fileName), true, "File saved.");
            }
            catch (Exception ex)
            {
                return (null, false, $"File save error: {ex.Message}");
            }
        }
        public async Task<ServiceResponse<List<HrApplicationDto>>> GetHrDashboardAsync()
        {
            var relevantStatuses = new List<string> { "Shortlisted", "Offered", "Hired", "On-Hold" };

            var applications = await _context.Applications
                .Where(a => relevantStatuses.Contains(a.status))
                .Include(a => a.Candidate)
                .Include(a => a.Job)
                .OrderByDescending(a => a.applied_at)
                .Select(a => new HrApplicationDto
                {
                    ApplicationId = a.application_id,
                    CandidateName = a.Candidate != null ? $"{a.Candidate.first_name} {a.Candidate.last_name}" : "N/A",
                    JobTitle = a.Job != null ? a.Job.title : "N/A",
                    Status = a.status,
                    JoiningDate = a.joining_date
                })
                .ToListAsync();

            return new ServiceResponse<List<HrApplicationDto>> { Data = applications };
        }

    }
}