using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class DeviceType
{
    public Guid Id { get; set; }

    public string TypeName { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<DeviceModel> DeviceModels { get; set; } = new List<DeviceModel>();
}
