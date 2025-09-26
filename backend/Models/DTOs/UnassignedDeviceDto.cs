using System;

namespace backend.Models.DTOs
{
    public class UnassignedDeviceDto
    {
        public Guid Id { get; set; }
        public Guid DeviceId { get; set; }
        public string? DeviceCode { get; set; }
        public string? DeviceName { get; set; }
        public string? Status { get; set; }
        public string? ModelName { get; set; }
        public string? DeviceTypeName { get; set; }
    }
}
