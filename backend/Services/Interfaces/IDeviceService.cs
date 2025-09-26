using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IDeviceService
    {
        Task<IEnumerable<DeviceDto>> GetAllDevicesAsync();
        Task<IEnumerable<DeviceDto>> GetAllDevicesAsync(bool includeDeleted);
        Task<IEnumerable<DeviceDto>> GetDevicesByUserAsync(Guid userId);
        Task<DeviceDto?> GetDeviceByIdAsync(Guid id, Guid? currentUserId, bool isAdmin);
        Task<bool> CreateDeviceAsync(CreateDeviceDto dto);
        Task<DeviceDto> CreateDeviceWithReturnAsync(CreateDeviceDto dto);
        Task<bool> UpdateDeviceAsync(Guid id, UpdateDeviceDto dto);
        Task<bool> DeleteDeviceAsync(Guid id, Guid userId);
        
        // Additional methods needed by controller
        Task<object> GetPagedDevicesAsync(int page, int pageSize, string? search, string? status, Guid? modelId);
        Task<IEnumerable<DeviceDto>> GetDeletedDevicesAsync();
        Task<bool> RestoreDeviceAsync(Guid id);
        Task<IEnumerable<DeviceDto>> GetDevicesByManagedDepartmentAsync(Guid userId);
        Task<DeviceDto?> ScanDeviceAsync(string qrCode);
    }
}
