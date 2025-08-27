// Services/Interfaces/IDeviceModelService.cs
public interface IDeviceModelService
{
    Task<IEnumerable<DeviceModelDto>> GetAllAsync();
    Task<DeviceModelDto?> GetByIdAsync(Guid id);
    Task<DeviceModelDto> CreateAsync(DeviceModelDto dto);
    Task<DeviceModelDto?> UpdateAsync(Guid id, DeviceModelDto dto);
    Task<bool> DeleteAsync(Guid id);
}
