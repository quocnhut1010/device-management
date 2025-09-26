namespace backend.Models.DTOs
{
    public class CreateDeviceDto
    {
        public string DeviceName { get; set; } = null!;
        public Guid? ModelId { get; set; }
        public Guid? SupplierId { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? SerialNumber { get; set; }
        public string? Status { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime? WarrantyExpiry { get; set; }
        public Guid? CurrentDepartmentId { get; set; }
        public Guid? CurrentUserId { get; set; }
        public string? Barcode { get; set; }
        public string? DeviceImageUrl { get; set; }
        public string? WarrantyProvider { get; set; }
    }
}
