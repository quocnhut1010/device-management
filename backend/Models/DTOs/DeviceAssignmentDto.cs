using System;

namespace backend.Models.DTOs
{
    public class DeviceAssignmentDto
    {
        public Guid Id { get; set; }

        public Guid DeviceId { get; set; }
        public string? DeviceCode { get; set; }
        public string? DeviceName { get; set; }

        public Guid AssignedToUserId { get; set; }
        public string? AssignedToUserName { get; set; }

        public Guid AssignedToDepartmentId { get; set; }
        public string? AssignedToDepartmentName { get; set; }

        public DateTime AssignedDate { get; set; }
        public string? Note { get; set; }

        public DateTime? ReturnedDate { get; set; }

        public Guid AssignedByUserId { get; set; }
        public string? AssignedByUserName { get; set; }

        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedBy { get; set; }
    }
}
