using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class IncidentReport
{
    public Guid Id { get; set; }

    public Guid? DeviceId { get; set; }

    public Guid? ReportedByUserId { get; set; }

    public string? ReportType { get; set; }

    public string? Description { get; set; }

    public DateTime? ReportDate { get; set; }

    public int Status { get; set; }

    public string? ImageUrl { get; set; }

    public Guid? RejectedBy { get; set; }

    public string? RejectedReason { get; set; }

    public DateTime? RejectedAt { get; set; }

    public virtual Device? Device { get; set; }

    public virtual User? RejectedByNavigation { get; set; }

    public virtual ICollection<Repair> Repairs { get; set; } = new List<Repair>();

    public virtual User? ReportedByUser { get; set; }
}
