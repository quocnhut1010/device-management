using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class CreateDeviceAssignmentDto
    {
        [Required]
        public Guid DeviceId { get; set; }

        [Required]
        public Guid AssignedToUserId { get; set; }

        [Required]
        public Guid AssignedToDepartmentId { get; set; }

        public DateTime? AssignedDate { get; set; } = DateTime.UtcNow;

        public string? Note { get; set; }
    }
}
