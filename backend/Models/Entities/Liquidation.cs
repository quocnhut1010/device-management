using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class Liquidation
{
    public Guid Id { get; set; }

    public Guid? DeviceId { get; set; }

    public string? Reason { get; set; }

    public DateTime? LiquidationDate { get; set; }

    public Guid? ApprovedBy { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual Device? Device { get; set; }
}
