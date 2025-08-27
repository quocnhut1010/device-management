using System;
using System.Collections.Generic;
using backend.Models.Entities;


namespace backend.Models.Entities;

public partial class Department
{
    public Guid Id { get; set; }

    public string DepartmentName { get; set; } = null!;

    public string? DepartmentCode { get; set; }

    public string? Location { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public Guid? DeletedBy { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual ICollection<DeviceAssignment> DeviceAssignments { get; set; } = new List<DeviceAssignment>();

    public virtual ICollection<Device> Devices { get; set; } = new List<Device>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
