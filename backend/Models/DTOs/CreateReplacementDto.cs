using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class CreateReplacementDto
    {
        [Required]
        public Guid OldDeviceId { get; set; }
        
        [Required]
        public Guid NewDeviceId { get; set; }
        
        [Required]
        [StringLength(500, ErrorMessage = "Lý do thay thế không được vượt quá 500 ký tự.")]
        public string Reason { get; set; } = string.Empty;
        
        public Guid? IncidentReportId { get; set; } // Nếu thay thế từ incident report
    }
}