// Services/Interfaces/IDeviceTypeService.cs
public interface IDeviceTypeService
{
    Task<IEnumerable<DeviceTypeDto>> GetAllAsync();
    Task<DeviceTypeDto?> GetByIdAsync(Guid id);
    Task<DeviceTypeDto> CreateAsync(DeviceTypeDto dto);
    Task<DeviceTypeDto?> UpdateAsync(Guid id, DeviceTypeDto dto);
    Task<bool> DeleteAsync(Guid id);
}
