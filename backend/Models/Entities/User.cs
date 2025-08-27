using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class User
{
    public Guid Id { get; set; }

    public string? FullName { get; set; }

    public string? Email { get; set; }

    public string? PasswordHash { get; set; }

    public string? Role { get; set; }

    public Guid? DepartmentId { get; set; }

    public string? Position { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public Guid? DeletedBy { get; set; }

    public virtual Department? Department { get; set; }

    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();

    public virtual ICollection<DeviceAssignment> DeviceAssignments { get; set; } = new List<DeviceAssignment>();

    public virtual ICollection<Device> DeviceCurrentUsers { get; set; } = new List<Device>();

    public virtual ICollection<DeviceHistory> DeviceHistories { get; set; } = new List<DeviceHistory>();

    public virtual ICollection<DeviceModel> DeviceModelDeletedByNavigations { get; set; } = new List<DeviceModel>();

    public virtual ICollection<DeviceModel> DeviceModelUpdatedByNavigations { get; set; } = new List<DeviceModel>();

    public virtual ICollection<DeviceStatusLog> DeviceStatusLogs { get; set; } = new List<DeviceStatusLog>();

    public virtual ICollection<Device> DeviceUpdatedByNavigations { get; set; } = new List<Device>();

    public virtual ICollection<IncidentReport> IncidentReportRejectedByNavigations { get; set; } = new List<IncidentReport>();

    public virtual ICollection<IncidentReport> IncidentReportReportedByUsers { get; set; } = new List<IncidentReport>();

    public virtual ICollection<Liquidation> Liquidations { get; set; } = new List<Liquidation>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<RepairFeedback> RepairFeedbacks { get; set; } = new List<RepairFeedback>();

    public virtual ICollection<RepairImage> RepairImages { get; set; } = new List<RepairImage>();

    public virtual ICollection<Repair> Repairs { get; set; } = new List<Repair>();

    public virtual ICollection<ReportExport> ReportExports { get; set; } = new List<ReportExport>();

    public virtual ICollection<Supplier> Suppliers { get; set; } = new List<Supplier>();
}
