using System;
using System.ComponentModel.DataAnnotations;

namespace Recruitment.API.DTOs
{
    public class FinalSelectionDto
    {
        [Required]
        public DateTime JoiningDate { get; set; }
    }
}