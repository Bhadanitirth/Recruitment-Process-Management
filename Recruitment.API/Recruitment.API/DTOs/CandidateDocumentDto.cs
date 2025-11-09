using System;

namespace Recruitment.API.DTOs
{
    public class CandidateDocumentDto
    {
        public int DocumentId { get; set; }
        public string DocumentType { get; set; }
        public string FilePath { get; set; }
        public string VerificationStatus { get; set; }
        public string UploaderName { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}