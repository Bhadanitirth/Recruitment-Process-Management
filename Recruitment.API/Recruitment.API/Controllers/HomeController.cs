using Microsoft.AspNetCore.Mvc;

namespace Recruitment.API.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
