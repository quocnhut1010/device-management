using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class RepairImage
{
    public Guid Id { get; set; }

    public Guid? RepairId { get; set; }

    public string? ImageUrl { get; set; }

    public bool? IsAfterRepair { get; set; }

    public DateTime? UploadedAt { get; set; }

    public Guid? UploadedBy { get; set; }

    public virtual Repair? Repair { get; set; }

    public virtual User? UploadedByNavigation { get; set; }
}
