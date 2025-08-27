// Models/UserDto.cs
public class UserDto
{
    public Guid Id { get; set; }                     // Mã định danh
    public string? FullName { get; set; }            // Họ tên đầy đủ
    public string? Email { get; set; }               // Email (duy nhất)
    public string? Role { get; set; }                // Vai trò (Admin, User,...)
    public Guid? DepartmentId { get; set; }          // Phòng ban
    public string? Position { get; set; }            // Vị trí
    public DateTime? CreatedAt { get; set; }         // Ngày tạo
    public bool? IsActive { get; set; }              // Có đang hoạt động
    public bool? IsDeleted { get; set; }             // Cờ xóa mềm
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }

    public string? DepartmentName { get; set; } // ánh xạ từ entity.Department.DepartmentName
}
