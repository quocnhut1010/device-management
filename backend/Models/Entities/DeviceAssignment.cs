using System;
using System.Collections.Generic;

using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class DeviceAssignment
{
    public Guid Id { get; set; }

    public Guid? DeviceId { get; set; }

    public Guid? AssignedToUserId { get; set; }

    public Guid? AssignedToDepartmentId { get; set; }

    public DateTime? AssignedDate { get; set; }

    public string? Note { get; set; }

    public DateTime? ReturnedDate { get; set; }

    public virtual Department? AssignedToDepartment { get; set; }

    public virtual User? AssignedToUser { get; set; }

    public virtual Device? Device { get; set; }
}
