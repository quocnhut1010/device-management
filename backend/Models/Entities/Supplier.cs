using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class Supplier
{
    public Guid Id { get; set; }

    public string SupplierName { get; set; } = null!;

    public string? ContactPerson { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public Guid? DeletedBy { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual ICollection<Device> Devices { get; set; } = new List<Device>();
}
