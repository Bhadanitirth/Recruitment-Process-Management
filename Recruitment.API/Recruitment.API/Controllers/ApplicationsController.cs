using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.API.Services;
using System.Threading.Tasks;

namespace Recruitment.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Recruiter")]
    public class ApplicationsController : ControllerBase
    {
        private readonly IRecruiterRepository _recruiterRepo;

        public ApplicationsController(IRecruiterRepository recruiterRepo)
        {
            _recruiterRepo = recruiterRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetApplications()
        {
            var response = await _recruiterRepo.GetApplicationsAsync();
            return Ok(response);
        }
    }
}

