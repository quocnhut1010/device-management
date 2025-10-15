using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class LiquidationDto
    {
        public Guid Id { get; set; }
        public Guid? DeviceId { get; set; }
        public string? Reason { get; set; }
        public DateTime? LiquidationDate { get; set; }
        public Guid? ApprovedBy { get; set; }
        
        // Navigation properties for display
        public string? DeviceCode { get; set; }
        public string? DeviceName { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class CreateLiquidationDto
    {
        [Required(ErrorMessage = "Device ID is required")]
        public Guid DeviceId { get; set; }
        
        [Required(ErrorMessage = "Reason is required")]
        [StringLength(500, ErrorMessage = "Reason must be less than 500 characters")]
        public string Reason { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Liquidation date is required")]
        public DateTime LiquidationDate { get; set; }
    }

    public class BatchLiquidationDto
    {
        [Required(ErrorMessage = "Device IDs are required")]
        [MinLength(1, ErrorMessage = "At least one device must be selected")]
        public List<Guid> DeviceIds { get; set; } = new List<Guid>();
        
        [Required(ErrorMessage = "Reason is required")]
        [StringLength(500, ErrorMessage = "Reason must be less than 500 characters")]
        public string Reason { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Liquidation date is required")]
        public DateTime LiquidationDate { get; set; }
    }

    public class LiquidationEligibleDeviceDto
    {
        public Guid Id { get; set; }
        public string? DeviceCode { get; set; }
        public string? DeviceName { get; set; }
        public string? Status { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? CurrentUserName { get; set; }
        public string? CurrentUserFullName { get; set; }
        public string? CurrentDepartmentName { get; set; }
        public string? EligibilityReason { get; set; } // Lý do đủ điều kiện thanh lý
        public bool HasActiveRepair { get; set; }
        public string? ModelName { get; set; }
        public string? TypeName { get; set; }
    }
}