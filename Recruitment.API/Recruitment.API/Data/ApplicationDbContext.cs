using Microsoft.EntityFrameworkCore;
using Recruitment.API.Models;

namespace Recruitment.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<JobSkill> Job_Skills { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<JobReviewer> Job_Reviewers { get; set; }
        public DbSet<ApplicationComment> Application_Comments { get; set; }
        public DbSet<JobInterviewer> Job_Interviewers { get; set; }
        public DbSet<Interview> Interviews { get; set; }
        public DbSet<InterviewPanel> Interview_Panel { get; set; }
        public DbSet<InterviewFeedback> Interview_Feedback { get; set; }
        public DbSet<CandidateDocument> Candidate_Documents { get; set; }
    }
}

