using System.ComponentModel.DataAnnotations;

public class DepartmentDto
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Tên phòng ban là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên phòng ban không được vượt quá 100 ký tự")]
    public string DepartmentName { get; set; } = null!;

    [StringLength(50, ErrorMessage = "Mã phòng ban không được vượt quá 50 ký tự")]
    public string? DepartmentCode { get; set; }

    [StringLength(100, ErrorMessage = "Vị trí không được vượt quá 100 ký tự")]
    public string? Location { get; set; }

    public bool? IsDeleted { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
    public string? DeletedByName { get; set; }

    public int DeviceCount { get; set; }
    public int UserCount { get; set; }
}
