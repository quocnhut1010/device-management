namespace backend.Models.DTOs
{
    public class DeviceDto
    {
        public Guid Id { get; set; }

        // Basic Fields
        public string? DeviceCode { get; set; }
        public string? DeviceName { get; set; }
        public string? Status { get; set; }
        public string? Barcode { get; set; }
        public string? SerialNumber { get; set; }
        public decimal? PurchasePrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime? WarrantyExpiry { get; set; }
        public string? WarrantyProvider { get; set; }
        public string? DeviceImageUrl { get; set; }

        // Foreign Keys
        public Guid? ModelId { get; set; }
        public Guid? SupplierId { get; set; }
        public Guid? CurrentUserId { get; set; }
        public Guid? CurrentDepartmentId { get; set; }

        // Display from navigation properties
        public string? ModelName { get; set; }
        public string? DeviceTypeName { get; set; } // From Model.DeviceType
        public string? SupplierName { get; set; }
        public string? CurrentUserName { get; set; }
        public string? DepartmentName { get; set; }

        // Audit
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
    }
}
