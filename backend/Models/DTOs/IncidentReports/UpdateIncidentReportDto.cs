using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dtos.IncidentReports
{
    public class UpdateIncidentReportDto
    {
        [Required]
        public string? Status { get; set; } // Ví dụ: "Đang xử lý", "Đã xử lý"

        public string? Note { get; set; } // Ghi chú từ kỹ thuật viên

        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
