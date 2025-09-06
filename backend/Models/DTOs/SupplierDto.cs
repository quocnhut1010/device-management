using System.ComponentModel.DataAnnotations;

public class SupplierDto
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Tên nhà cung cấp là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên nhà cung cấp không vượt quá 100 ký tự")]
    public string SupplierName { get; set; } = null!;

    [StringLength(100, ErrorMessage = "Tên người liên hệ không vượt quá 100 ký tự")]
    public string? ContactPerson { get; set; }

    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(100)]
    public string? Email { get; set; }

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20)]
    public string? Phone { get; set; }

    public bool? IsDeleted { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
    public int DeviceCount { get; set; }
}
