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

    // ======== Trạng thái & xác nhận của người nhận ========
    // Pending  : chờ nhân viên xác nhận
    // Accepted : nhân viên đã đồng ý, thiết bị chính thức đang sử dụng
    // Rejected : nhân viên từ chối nhận thiết bị
    public string Status { get; set; } = "Pending";

    public DateTime? UserConfirmedAt { get; set; }   // Thời điểm nhân viên xác nhận (accept/reject)
    public Guid? UserConfirmedBy { get; set; }       // Ai là người xác nhận (thường là chính nhân viên được gán)
    public string? RejectionReason { get; set; }      // Lý do từ chối nhận thiết bị (nếu action = reject)

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
