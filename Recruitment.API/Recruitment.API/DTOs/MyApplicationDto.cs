using System;

namespace Recruitment.API.DTOs
{
    public class MyApplicationDto
    {
        public int ApplicationId { get; set; }
        public string JobTitle { get; set; }
        public string ApplicationStatus { get; set; } 
        public DateTime AppliedAt { get; set; }

        public string NextStepType { get; set; } 
        public DateTime? NextStepScheduledAt { get; set; }
        public string NextStepStatus { get; set; }

        public DateTime? JoiningDate { get; set; }
    }
}

