using backend.Models.Entities;

namespace backend.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(Guid id);
        Task AddAsync(User user);
        Task<IEnumerable<User>> GetAllAsync();
        Task SaveChangesAsync();
    }
}
