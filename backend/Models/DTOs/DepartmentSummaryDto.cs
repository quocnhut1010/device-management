// Models/DTOs/DepartmentSummaryDto.cs
public class DepartmentSummaryDto
{
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int TotalDevices { get; set; }
    public int TotalUsers { get; set; }
    public int PersonalDeviceCount { get; set; } // thiết bị được user đang đăng nhập quản lý
}
