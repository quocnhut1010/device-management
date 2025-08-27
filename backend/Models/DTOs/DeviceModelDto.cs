// DTOs/DeviceModelDto.cs
public class DeviceModelDto
{
    public Guid Id { get; set; }
    public string? ModelName { get; set; }
    public Guid? DeviceTypeId { get; set; }
    public string? Manufacturer { get; set; }
    public string? Specifications { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
}
