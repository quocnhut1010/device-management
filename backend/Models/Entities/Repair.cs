using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class Repair
{
    public Guid Id { get; set; }

    public Guid? DeviceId { get; set; }

    public Guid? IncidentReportId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public DateTime? RepairDate { get; set; }

    public string? Description { get; set; }

    public decimal? Cost { get; set; }

    public decimal? LaborHours { get; set; }

    public string? RepairCompany { get; set; }

    public int Status { get; set; }

    public Guid? RejectedBy { get; set; }

    public string? RejectedReason { get; set; }

    public DateTime? RejectedAt { get; set; }
       // ✅ Người được giao sửa chữa
    public Guid? AssignedToTechnicianId { get; set; }
    public virtual User? AssignedToTechnician { get; set; }

    // ✅ Người duyệt hoàn tất sửa chữa (temporarily commented out until DB schema is updated)
    // public Guid? ApprovedBy { get; set; }
    // public DateTime? ApprovedAt { get; set; }

    public virtual Device? Device { get; set; }

    public virtual IncidentReport? IncidentReport { get; set; }

    public virtual User? RejectedByNavigation { get; set; }

    public virtual ICollection<RepairFeedback> RepairFeedbacks { get; set; } = new List<RepairFeedback>();

    public virtual ICollection<RepairImage> RepairImages { get; set; } = new List<RepairImage>();
}
