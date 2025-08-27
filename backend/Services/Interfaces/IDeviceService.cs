using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IDeviceService
    {
        Task<IEnumerable<DeviceDto>> GetAllDevicesAsync();
        Task<IEnumerable<DeviceDto>> GetDevicesByUserAsync(Guid userId);
        Task<DeviceDto?> GetDeviceByIdAsync(Guid id, Guid? currentUserId, bool isAdmin);
        Task<bool> CreateDeviceAsync(DeviceDto dto);
        Task<bool> UpdateDeviceAsync(Guid id, DeviceDto dto);
        Task<bool> DeleteDeviceAsync(Guid id, Guid userId);
    }
}
