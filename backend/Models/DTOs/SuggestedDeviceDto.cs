using System;

namespace backend.Models.DTOs
{
    public class SuggestedDeviceDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string ModelName { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? DeviceImageUrl { get; set; }
        public bool IsSameModel { get; set; } // Có cùng model với thiết bị cũ không
    }
}