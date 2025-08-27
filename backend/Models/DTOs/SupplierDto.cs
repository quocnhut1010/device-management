// Models/SupplierDto.cs
public class SupplierDto
{
    public Guid Id { get; set; }                     // Mã định danh
    public string SupplierName { get; set; } = null!;// Tên nhà cung cấp (bắt buộc)
    public string? ContactPerson { get; set; }       // Người liên hệ
    public string? Email { get; set; }               // Email liên hệ
    public string? Phone { get; set; }               // Số điện thoại
    public bool? IsDeleted { get; set; }             // Cờ xóa mềm
    public DateTime? UpdatedAt { get; set; }         // Thời điểm cập nhật
    public Guid? UpdatedBy { get; set; }             // Người cập nhật
    public DateTime? DeletedAt { get; set; }         // Thời điểm xóa
    public Guid? DeletedBy { get; set; }             // Người xóa
}
