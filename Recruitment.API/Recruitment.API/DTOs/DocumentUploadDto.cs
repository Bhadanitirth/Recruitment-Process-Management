using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Recruitment.API.DTOs
{
    public class DocumentUploadDto
    {
        [Required]
        public string DocumentType { get; set; }

        [Required]
        public IFormFile File { get; set; }
    }
}