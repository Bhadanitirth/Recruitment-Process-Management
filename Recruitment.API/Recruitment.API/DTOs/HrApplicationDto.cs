using System;
using System.Collections.Generic;

namespace Recruitment.API.DTOs
{
    public class HrApplicationDto
    {
        public int ApplicationId { get; set; }
        public string CandidateName { get; set; }
        public string JobTitle { get; set; }
        public string Status { get; set; } 
        public DateTime? JoiningDate { get; set; }
    }
}