using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class DeviceHistory
{
    public Guid Id { get; set; }

    public Guid? DeviceId { get; set; }

    public string? Action { get; set; }

    public string? Description { get; set; }

    public string? ActionType { get; set; }

    public Guid? ActionBy { get; set; }

    public DateTime? ActionDate { get; set; }

    public virtual User? ActionByNavigation { get; set; }

    public virtual Device? Device { get; set; }
}
