using AutoMapper;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class UserService : IUserService
{
    private readonly DeviceManagementDbContext _context;
    private readonly IMapper _mapper;
    private readonly PasswordHasher<User> _hasher = new();

    public UserService(DeviceManagementDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(bool? isDeleted = null)
    {
        var query = _context.Users
            .Include(u => u.Department)
            .AsQueryable();

        // ✅ Bỏ lọc isDeleted để trả về toàn bộ người dùng
        var users = await query.ToListAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id && u.IsDeleted != true);

        return user is null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> UpdateAsync(Guid id, UserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null || user.IsDeleted == true) return null;

        _mapper.Map(dto, user);
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null || user.IsDeleted == true) return false;

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto> CreateAsync(RegisterUserDto dto)
    {
        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existing is not null)
            throw new Exception("Email already exists.");

        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == dto.DepartmentId && d.IsDeleted != false);

        // if (department == null)
        //     throw new Exception("Phòng ban không hợp lệ hoặc đã bị xoá.");

        var user = _mapper.Map<User>(dto);
        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        user.IsActive = true;
        user.IsDeleted = false;
        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }


        public async Task<bool> RestoreAsync(Guid id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null || user.IsDeleted != true) return false;

            user.IsDeleted = false;
            user.DeletedAt = null;
            user.DeletedBy = null;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserDto>> GetByDepartmentAsync(Guid departmentId)
        {
            var users = await _context.Users
                .Include(u => u.Department)
                .Where(u => u.DepartmentId == departmentId && u.IsDeleted != true)
                .ToListAsync();
            
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }
    }
}
