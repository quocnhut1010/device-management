using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class Replacement
{
    public Guid Id { get; set; }

    public Guid? OldDeviceId { get; set; }

    public Guid? NewDeviceId { get; set; }

    public DateTime? ReplacementDate { get; set; }

    public string? Reason { get; set; }

    public virtual Device? NewDevice { get; set; }

    public virtual Device? OldDevice { get; set; }
}
