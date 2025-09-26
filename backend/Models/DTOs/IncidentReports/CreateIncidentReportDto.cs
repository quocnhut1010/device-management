using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dtos.IncidentReports
{
    public class CreateIncidentReportDto
    {
        [Required]
        public Guid DeviceId { get; set; }

        [Required]
        public string? ReportType { get; set; }

        [Required]
        public string? Description { get; set; }

        public string? ImageUrl { get; set; }
    }
}
