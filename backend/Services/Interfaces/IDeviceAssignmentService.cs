using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IDeviceAssignmentService
    {
        Task<List<DeviceAssignmentDto>> GetAllAsync();
        Task<DeviceAssignmentDto?> GetByIdAsync(Guid id);
        Task<DeviceAssignmentDto?> CreateAsync(CreateDeviceAssignmentDto createDto, Guid currentUserId);
        Task<bool> SoftDeleteAsync(Guid id, Guid currentUserId);
        Task<bool> RevokeAsync(Guid id, Guid currentUserId);
        Task<DeviceAssignmentDto?> TransferAsync(Guid id, CreateDeviceAssignmentDto transferDto, Guid currentUserId);
        Task<List<DeviceAssignmentDto>> GetAssignmentsByUserIdAsync(Guid userId);
        Task<List<DeviceAssignmentDto>> GetAssignmentsByDeviceIdAsync(Guid deviceId);
    }
}
