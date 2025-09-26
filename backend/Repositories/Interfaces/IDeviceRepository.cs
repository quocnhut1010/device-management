using backend.Models.Entities;
using backend.Models.DTOs;


namespace backend.Repositories.Interfaces
{
    public interface IDeviceRepository
    {
        Task<IEnumerable<Device>> GetAllAsync(bool? isDeleted = null);     // ✅ Thêm filter soft-delete
        Task<PaginatedResult<Device>> GetPagedAsync(int page, int pageSize);  // ✅ Phân trang
        Task<Device?> GetByIdAsync(Guid id);
        Task<IEnumerable<Device>> GetByUserIdAsync(Guid userId);           // ✅ Thiết bị theo người dùng
        Task<IEnumerable<Device>> GetByDepartmentIdAsync(Guid departmentId); // ✅ Thiết bị theo phòng ban
        Task AddAsync(Device device);
        void Update(Device device);
        Task SoftDeleteAsync(Guid id, Guid deletedBy);                     // ✅ Soft-delete
        Task RestoreAsync(Guid id);                                        // ✅ Khôi phục
        Task SaveChangesAsync();
    }
}
