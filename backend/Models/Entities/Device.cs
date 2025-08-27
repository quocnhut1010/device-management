using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class Device
{
    public Guid Id { get; set; }

    public string? DeviceCode { get; set; }

    public string? DeviceName { get; set; }

    public Guid? ModelId { get; set; }

    public Guid? SupplierId { get; set; }

    public decimal? PurchasePrice { get; set; }

    public string? SerialNumber { get; set; }

    public string? Status { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public DateTime? WarrantyExpiry { get; set; }

    public Guid? CurrentDepartmentId { get; set; }

    public Guid? CurrentUserId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }

    public string? Barcode { get; set; }

    public string? DeviceImageUrl { get; set; }

    public string? WarrantyProvider { get; set; }

    public DateTime? DeletedAt { get; set; }

    public Guid? DeletedBy { get; set; }

    public virtual Department? CurrentDepartment { get; set; }

    public virtual User? CurrentUser { get; set; }

    public virtual ICollection<DeviceAssignment> DeviceAssignments { get; set; } = new List<DeviceAssignment>();

    public virtual ICollection<DeviceHistory> DeviceHistories { get; set; } = new List<DeviceHistory>();

    public virtual ICollection<DeviceStatusLog> DeviceStatusLogs { get; set; } = new List<DeviceStatusLog>();

    public virtual ICollection<IncidentReport> IncidentReports { get; set; } = new List<IncidentReport>();

    public virtual ICollection<Liquidation> Liquidations { get; set; } = new List<Liquidation>();

    public virtual DeviceModel? Model { get; set; }

    public virtual ICollection<Repair> Repairs { get; set; } = new List<Repair>();

    public virtual ICollection<Replacement> ReplacementNewDevices { get; set; } = new List<Replacement>();

    public virtual ICollection<Replacement> ReplacementOldDevices { get; set; } = new List<Replacement>();

    public virtual Supplier? Supplier { get; set; }

    public virtual User? UpdatedByNavigation { get; set; }
}
