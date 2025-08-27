using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class DeviceModel
{
    public Guid Id { get; set; }

    public string ModelName { get; set; } = null!;

    public Guid? DeviceTypeId { get; set; }

    public string? Manufacturer { get; set; }

    public string? Specifications { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public Guid? DeletedBy { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual DeviceType? DeviceType { get; set; }

    public virtual ICollection<Device> Devices { get; set; } = new List<Device>();

    public virtual User? UpdatedByNavigation { get; set; }
}
