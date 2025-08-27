// Updated DeviceDto.cs
namespace backend.Models.DTOs
{
    public class DeviceDto
    {
        public Guid Id { get; set; }

        public string? DeviceCode { get; set; }
        public string? DeviceName { get; set; }

        // Foreign Keys
        public Guid? ModelId { get; set; }
        public Guid? SupplierId { get; set; }
        public Guid? CurrentUserId { get; set; }
        public Guid? CurrentDepartmentId { get; set; }

        // Optional display fields (auto-mapped from navigation properties)
        public string? ModelName { get; set; }
        public string? DepartmentName { get; set; }
        public string? CurrentUserName { get; set; }

        // Additional fields from DB
        public string? Status { get; set; }
        public string? Barcode { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? SerialNumber { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime? WarrantyExpiry { get; set; }
        public string? WarrantyProvider { get; set; }
        public string? DeviceImageUrl { get; set; }

        // Audit fields (optional for display/logging)
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}
