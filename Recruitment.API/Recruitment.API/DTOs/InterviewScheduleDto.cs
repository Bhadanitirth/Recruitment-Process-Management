using System;
using System.Collections.Generic;

namespace Recruitment.API.DTOs
{
    public class InterviewScheduleDto
    {
        public int ApplicationId { get; set; }
        public int RoundNumber { get; set; }
        public string InterviewType { get; set; } 
        public DateTime ScheduledAt { get; set; }
        public List<int> InterviewerIds { get; set; } 
    }    
}
