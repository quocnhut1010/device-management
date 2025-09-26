using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IDeviceModelService
    {
        Task<IEnumerable<DeviceModelDto>> GetAllAsync();
        Task<IEnumerable<DeviceModelDto>> GetAllAsync(bool includeDeleted);
        Task<DeviceModelDto?> GetByIdAsync(Guid id);
        Task<DeviceModelDto> CreateAsync(DeviceModelDto dto);
        Task<DeviceModelDto?> UpdateAsync(Guid id, DeviceModelDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> RestoreAsync(Guid id);
    }
}
