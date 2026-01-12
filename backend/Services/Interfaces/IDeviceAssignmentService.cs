using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IDeviceAssignmentService
    {
        Task<List<DeviceAssignmentDto>> GetAllAsync();
        Task<object> GetAllPagedAsync(int page, int pageSize, string? status = null);
        Task<DeviceAssignmentDto?> GetByIdAsync(Guid id);
        Task<DeviceAssignmentDto?> CreateAsync(CreateDeviceAssignmentDto createDto, Guid currentUserId);
        Task<bool> SoftDeleteAsync(Guid id, Guid currentUserId);
        Task<bool> RevokeAsync(Guid id, Guid currentUserId);
        Task<DeviceAssignmentDto?> TransferAsync(Guid id, CreateDeviceAssignmentDto transferDto, Guid currentUserId);
        Task<List<DeviceAssignmentDto>> GetAssignmentsByUserIdAsync(Guid userId);
        Task<List<DeviceAssignmentDto>> GetAssignmentsByDeviceIdAsync(Guid deviceId);

        /// <summary>
        /// Nhân viên xác nhận nhận thiết bị (accept hoặc reject).
        /// </summary>
        /// <param name="id">Id của DeviceAssignment</param>
        /// <param name="currentUserId">Id người đang đăng nhập (nhân viên)</param>
        /// <param name="action">\"accept\" hoặc \"reject\"</param>
        /// <param name="rejectionReason">Lý do từ chối (chỉ cần khi action = \"reject\")</param>
        Task<DeviceAssignmentDto?> ConfirmAsync(Guid id, Guid currentUserId, string action, string? rejectionReason = null);
    }
}
