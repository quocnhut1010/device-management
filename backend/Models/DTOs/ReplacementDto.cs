using System;

namespace backend.Models.DTOs
{
    public class ReplacementDto
    {
        public Guid Id { get; set; }
        public Guid? OldDeviceId { get; set; }
        public Guid? NewDeviceId { get; set; }
        public DateTime? ReplacementDate { get; set; }
        public string? Reason { get; set; }

        // Thông tin thiết bị cũ
        public string? OldDeviceCode { get; set; }
        public string? OldDeviceName { get; set; }

        // Thông tin thiết bị mới
        public string? NewDeviceCode { get; set; }
        public string? NewDeviceName { get; set; }

        // Thông tin người dùng hiện tại được gán thiết bị cũ
        public Guid? UserId { get; set; }
        public string? UserFullName { get; set; }
        public string? UserEmail { get; set; }
        public UserDto? OldDeviceUser { get; set; }

    }
}