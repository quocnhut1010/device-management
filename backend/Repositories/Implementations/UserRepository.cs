using backend.Data;
using backend.Models;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations
{
    public class UserRepository : IUserRepository
    {
        private readonly DeviceManagementDbContext _context;

        public UserRepository(DeviceManagementDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            // Trim email to remove any whitespace
            var trimmedEmail = email?.Trim();
            
            Console.WriteLine($"[UserRepository] ===== GetByEmailAsync Debug =====");
            Console.WriteLine($"[UserRepository] Searching for email: '{trimmedEmail}'");
            
            // Get total users count for debugging
            var totalUsers = await _context.Users.CountAsync();
            Console.WriteLine($"[UserRepository] Total users in database: {totalUsers}");
            
            // Get all users with matching email (case-insensitive) for debugging
            var allMatchingEmails = await _context.Users
                .Where(u => u.Email != null && u.Email.ToLower() == trimmedEmail.ToLower())
                .Select(u => new { 
                    u.Email, 
                    u.IsDeleted, 
                    u.IsActive,
                    u.Id,
                    u.FullName
                })
                .ToListAsync();
            
            Console.WriteLine($"[UserRepository] Users with matching email (case-insensitive): {allMatchingEmails.Count}");
            foreach (var match in allMatchingEmails)
            {
                Console.WriteLine($"[UserRepository]   - Email: '{match.Email}', IsDeleted: {match.IsDeleted}, IsActive: {match.IsActive}, ID: {match.Id}, Name: {match.FullName}");
            }
            
            // Query with proper nullable handling: IsDeleted != true (handles null and false)
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Email != null && 
                                         u.Email.ToLower() == trimmedEmail.ToLower() && 
                                         u.IsDeleted != true);
            
            if (user == null)
            {
                Console.WriteLine($"[UserRepository] ✗ User not found with email: '{trimmedEmail}'");
                Console.WriteLine($"[UserRepository] Query conditions: Email matches (case-insensitive) AND IsDeleted != true");
            }
            else
            {
                Console.WriteLine($"[UserRepository] ✓ User found: ID={user.Id}, Email='{user.Email}', IsDeleted={user.IsDeleted}, IsActive={user.IsActive}");
            }
            
            Console.WriteLine($"[UserRepository] ===== GetByEmailAsync Debug End =====");
            
            return user;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
           return await _context.Users
            .Include(u => u.Department)
            .Where(u => u.IsDeleted == false)
            .ToListAsync();

        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
