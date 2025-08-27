using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class DeviceStatusLog
{
    public Guid Id { get; set; }

    public Guid? DeviceId { get; set; }

    public string? OldStatus { get; set; }

    public string? NewStatus { get; set; }

    public DateTime? ChangedAt { get; set; }

    public Guid? ChangedBy { get; set; }

    public string? Note { get; set; }

    public virtual User? ChangedByNavigation { get; set; }

    public virtual Device? Device { get; set; }
}
