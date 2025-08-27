using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
   public interface IDeviceRepository
    {
        Task<IEnumerable<Device>> GetAllAsync();
        Task<Device?> GetByIdAsync(Guid id);
        Task AddAsync(Device device);
        void Update(Device device);
        void Delete(Device device);         // ← yêu cầu hàm này
        Task DeleteAsync(Device device);    // ← và hàm này
        Task SaveChangesAsync();
    }
}
