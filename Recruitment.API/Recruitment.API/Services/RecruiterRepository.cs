using Microsoft.EntityFrameworkCore;
using Recruitment.API.Data;
using Recruitment.API.DTOs;
using Recruitment.API.Models;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel;
using System;

namespace Recruitment.API.Services
{
    public class RecruiterRepository : IRecruiterRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RecruiterRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetUserId() => int.Parse(_httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier));

        public async Task<ServiceResponse<Job>> CreateJobAsync(JobCreateDto jobDto)
        {
            var job = new Job
            {
                title = jobDto.Title,
                description = jobDto.Description,
                status = "Open",
                created_by_user_id = GetUserId()
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            if (jobDto.RequiredSkillIds != null)
            {
                foreach (var skillId in jobDto.RequiredSkillIds)
                {
                    _context.Job_Skills.Add(new JobSkill { job_id = job.job_id, skill_id = skillId, is_required = true });
                }
            }
            if (jobDto.PreferredSkillIds != null)
            {
                foreach (var skillId in jobDto.PreferredSkillIds)
                {
                    _context.Job_Skills.Add(new JobSkill { job_id = job.job_id, skill_id = skillId, is_required = false });
                }
            }

            await _context.SaveChangesAsync();
            return new ServiceResponse<Job> { Data = job, Message = "Job with skills created successfully." };
        }

        public async Task<ServiceResponse<Candidate>> CreateCandidateAsync(CandidateCreateDto candidateDto, IFormFile cvFile)
        {
            if (await _context.Users.AnyAsync(u => u.email == candidateDto.Email))
            {
                return new ServiceResponse<Candidate> { Success = false, Message = "A user with this email already exists in the system." };
            }

            var candidate = new Candidate
            {
                first_name = candidateDto.FirstName,
                last_name = candidateDto.LastName,
                email = candidateDto.Email,
                phone = candidateDto.Phone,
                created_by_user_id = GetUserId(),
                cv_path = "" 
            };
            _context.Candidates.Add(candidate);

            var newUser = CreateUserForCandidate(candidate);
            _context.Users.Add(newUser);

            await _context.SaveChangesAsync();
            return new ServiceResponse<Candidate> { Data = candidate, Message = "Candidate created successfully." };
        }

        public async Task<ServiceResponse<int>> BulkCreateCandidatesAsync(IFormFile file)
        {
            var response = new ServiceResponse<int>();
            var newCandidates = new List<Candidate>();
            var newUsers = new List<User>();
            var existingUserEmails = new HashSet<string>(await _context.Users.Select(u => u.email).ToListAsync());
            int createdCount = 0;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheet(1);
                    if (worksheet == null) return new ServiceResponse<int> { Success = false, Message = "Excel file is empty." };

                    var rows = worksheet.RowsUsed().Skip(1);
                    foreach (var row in rows)
                    {
                        var email = row.Cell(3).Value.ToString().Trim();
                        if (string.IsNullOrEmpty(email) || existingUserEmails.Contains(email) || newUsers.Any(u => u.email == email)) continue;

                        var candidate = new Candidate
                        {
                            first_name = row.Cell(1).Value.ToString().Trim(),
                            last_name = row.Cell(2).Value.ToString().Trim(),
                            email = email,
                            phone = row.Cell(4).Value.ToString().Trim(),
                            created_by_user_id = GetUserId()
                        };
                        newCandidates.Add(candidate);
                        newUsers.Add(CreateUserForCandidate(candidate));
                    }
                }
            }

            if (newCandidates.Any())
            {
                _context.Candidates.AddRange(newCandidates);
                _context.Users.AddRange(newUsers);
                await _context.SaveChangesAsync();
                createdCount = newCandidates.Count;
            }

            response.Data = createdCount;
            response.Message = $"{createdCount} new candidates were successfully added.";
            return response;
        }

        public async Task<ServiceResponse<List<Job>>> GetJobsAsync()
        {
            return new ServiceResponse<List<Job>> { Data = await _context.Jobs.ToListAsync() };
        }

        public async Task<ServiceResponse<List<Candidate>>> GetCandidatesAsync()
        {
            return new ServiceResponse<List<Candidate>> { Data = await _context.Candidates.ToListAsync() };
        }

        public async Task<ServiceResponse<List<Skill>>> GetSkillsAsync()
        {
            return new ServiceResponse<List<Skill>> { Data = await _context.Skills.OrderBy(s => s.skill_name).ToListAsync() };
        }

        public async Task<ServiceResponse<Skill>> CreateSkillAsync(SkillCreateDto skillDto)
        {
            if (await _context.Skills.AnyAsync(s => s.skill_name.ToLower() == skillDto.SkillName.ToLower()))
            {
                return new ServiceResponse<Skill> { Success = false, Message = "This skill already exists." };
            }
            var skill = new Skill { skill_name = skillDto.SkillName };
            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();
            return new ServiceResponse<Skill> { Data = skill, Message = "Skill created successfully." };
        }

        public async Task<ServiceResponse<Application>> LinkCandidateToJobAsync(int jobId, ApplicationCreateDto appDto)
        {
            if (await _context.Applications.AnyAsync(a => a.job_id == jobId && a.candidate_id == appDto.CandidateId))
            {
                return new ServiceResponse<Application> { Success = false, Message = "This candidate has already applied to this job." };
            }
            var application = new Application { job_id = jobId, candidate_id = appDto.CandidateId };
            _context.Applications.Add(application);
            await _context.SaveChangesAsync();
            return new ServiceResponse<Application> { Data = application, Message = "Candidate linked successfully." };
        }

        private User CreateUserForCandidate(Candidate candidate)
        {
            string defaultPassword = $"{candidate.first_name}@{candidate.last_name}";
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword);
            return new User
            {
                first_name = candidate.first_name,
                last_name = candidate.last_name,
                email = candidate.email,
                password_hash = passwordHash,
                role_id = 6
            };
        }

        public async Task<ServiceResponse<List<Application>>> GetApplicationsAsync()
        {
            var response = new ServiceResponse<List<Application>>
            {
                Data = await _context.Applications
                                    .Include(a => a.Candidate)
                                    .ToListAsync()
            };
            return response;
        }
    }
}

