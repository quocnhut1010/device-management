using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class UpdateDeviceAssignmentDto
    {
        public Guid? AssignedToUserId { get; set; }

        public Guid? AssignedToDepartmentId { get; set; }

        public DateTime? AssignedDate { get; set; }

        public DateTime? ReturnedDate { get; set; }

        public string? Note { get; set; }

        public string? ReturnNote { get; set; }

        public bool? IsReturned { get; set; }
    }
}
