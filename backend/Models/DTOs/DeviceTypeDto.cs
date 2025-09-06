// DTOs/DeviceTypeDto.cs
using System.ComponentModel.DataAnnotations;

public class DeviceTypeDto
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Tên loại thiết bị không được để trống")]
    public string TypeName { get; set; } = null!;

    public string? Description { get; set; }
}
