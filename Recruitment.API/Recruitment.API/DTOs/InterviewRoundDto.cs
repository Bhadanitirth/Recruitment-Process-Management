using System;

namespace Recruitment.API.DTOs
{
    public class InterviewRoundDto
    {
        public int RoundNumber { get; set; }
        public string InterviewType { get; set; } // e.g. "Technical"
        public DateTime? ScheduledAt { get; set; }
        public string Status { get; set; } // e.g. "Completed", "Scheduled"
        public string MeetingLink { get; set; }
    }
}