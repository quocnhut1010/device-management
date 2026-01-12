using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class ConfirmAssignmentDto
    {
        [Required]
        public string Action { get; set; } = string.Empty; // "accept" or "reject"

        public string? RejectionReason { get; set; } // Lý do từ chối (chỉ cần khi Action = "reject")
    }
}

