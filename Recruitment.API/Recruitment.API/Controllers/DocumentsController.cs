using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.DTOs;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/applications/{applicationId}/documents")]
    [ApiController]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentRepository _docRepo;

        public DocumentsController(IDocumentRepository docRepo)
        {
            _docRepo = docRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetDocuments(int applicationId)
        {
            var response = await _docRepo.GetDocumentsForApplicationAsync(applicationId);
            return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UploadDocument(int applicationId, [FromForm] DocumentUploadDto uploadDto)
        {
            var response = await _docRepo.UploadDocumentAsync(applicationId, uploadDto.DocumentType, uploadDto.File);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
        [HttpPost("offer-letter")]
        [Authorize(Roles = "Recruiter,HR")]
        public async Task<IActionResult> UploadOfferLetter(int applicationId, IFormFile file)
        {
            var response = await _docRepo.UploadOfferLetterAsync(applicationId, file);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }

}