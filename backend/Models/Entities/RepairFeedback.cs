using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class RepairFeedback
{
    public Guid Id { get; set; }

    public Guid? RepairId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Repair? Repair { get; set; }
}
