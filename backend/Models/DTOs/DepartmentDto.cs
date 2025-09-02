// Models/DepartmentDto.cs
public class DepartmentDto
{
    public Guid Id { get; set; }                     // Mã định danh
    public string DepartmentName { get; set; } = null!; // Tên phòng ban
    public string? DepartmentCode { get; set; }      // Mã phòng ban
    public string? Location { get; set; }            // Vị trí
    public bool? IsDeleted { get; set; }             // Cờ xóa mềm
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
    public string? DeletedByName { get; set; }
    public int DeviceCount { get; set; }
    public int UserCount { get; set; }  


}
