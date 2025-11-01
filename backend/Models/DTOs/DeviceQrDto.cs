namespace backend.Models.DTOs
{
    public class DeviceQrDto
    {
        // Basic Information
        public Guid Id { get; set; }
        public string? DeviceCode { get; set; }
        public string? DeviceName { get; set; }
        public string? Status { get; set; }
        public string? Barcode { get; set; }
        public string? SerialNumber { get; set; }

        // Model Information
        public string? ModelName { get; set; }
        public string? DeviceTypeName { get; set; }
        public string? Manufacturer { get; set; }

        // Current User & Department
        public string? CurrentUserName { get; set; }
        public string? DepartmentName { get; set; }

        // History Information
        public DateTime? LastRepairDate { get; set; }
        public int RepairCount { get; set; }
        public int IncidentCount { get; set; }

        // Additional Info
        public DateTime? PurchaseDate { get; set; }
        public DateTime? WarrantyExpiry { get; set; }
        public string? DeviceImageUrl { get; set; }
    }
}

