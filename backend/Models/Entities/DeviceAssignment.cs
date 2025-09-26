using System;

namespace backend.Models.Entities;

public partial class DeviceAssignment
{
    public Guid Id { get; set; }

    // ======== Dữ liệu chính ========
    public Guid? DeviceId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public Guid? AssignedToDepartmentId { get; set; }
    public DateTime? AssignedDate { get; set; }
    public string? Note { get; set; }
    public DateTime? ReturnedDate { get; set; }

    // ======== Trường mới bổ sung ========
    public Guid AssignedByUserId { get; set; }      // ✅ Ai là người thực hiện cấp phát

    public DateTime CreatedAt { get; set; }         // ✅ Ngày tạo
    public Guid CreatedBy { get; set; }             // ✅ Người tạo

    public DateTime? UpdatedAt { get; set; }        // ✅ Ngày cập nhật gần nhất
    public Guid? UpdatedBy { get; set; }            // ✅ Người cập nhật

    public bool IsDeleted { get; set; } = false;    // ✅ Soft delete
    public DateTime? DeletedAt { get; set; }        // ✅ Thời điểm xóa
    public Guid? DeletedBy { get; set; }            // ✅ Người xóa

    // ======== Navigation properties ========
    public virtual Department? AssignedToDepartment { get; set; }
    public virtual User? AssignedToUser { get; set; }
    public virtual Device? Device { get; set; }

    public virtual User? AssignedByUser { get; set; }
    public virtual User? CreatedByUser { get; set; }
    public virtual User? UpdatedByUser { get; set; }
    public virtual User? DeletedByUser { get; set; }
}
