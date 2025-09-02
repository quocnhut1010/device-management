using AutoMapper;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Implementations
{
    public class DepartmentService : IDepartmentService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DepartmentService(DeviceManagementDbContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid? GetCurrentUserId()
        {
            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdStr != null ? Guid.Parse(userIdStr) : null;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllAsync(bool? isDeleted = null)
        {
            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

            var query = _context.Departments
                .Include(d => d.Devices)
                .Include(d => d.Users)
                .AsQueryable();

            if (isDeleted != null)
                query = query.Where(d => d.IsDeleted == isDeleted);

            // Admin → thấy tất cả
            if (role == "Admin")
            {
                var departments = await query.ToListAsync();

                return departments.Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    DepartmentName = d.DepartmentName,
                    DepartmentCode = d.DepartmentCode,
                    Location = d.Location,
                    IsDeleted = d.IsDeleted,
                    UpdatedAt = d.UpdatedAt,
                    UpdatedBy = d.UpdatedBy,
                    DeletedAt = d.DeletedAt,
                    DeletedBy = d.DeletedBy,
                    DeviceCount = d.Devices.Count(dev => !dev.IsDeleted.GetValueOrDefault()),
                    UserCount = d.Users.Count(u => !u.IsDeleted.GetValueOrDefault())
                }).ToList();
            }

            // User → chỉ thấy phòng ban của mình
            if (Guid.TryParse(userIdStr, out var userId))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null && user.DepartmentId != null)
                {
                    query = query.Where(d => d.Id == user.DepartmentId);
                }
            }

            var userDepartments = await query.ToListAsync();

            return userDepartments.Select(d => new DepartmentDto
            {
                Id = d.Id,
                DepartmentName = d.DepartmentName,
                DepartmentCode = d.DepartmentCode,
                Location = d.Location,
                IsDeleted = d.IsDeleted,
                UpdatedAt = d.UpdatedAt,
                UpdatedBy = d.UpdatedBy,
                DeletedAt = d.DeletedAt,
                DeletedBy = d.DeletedBy,
                DeviceCount = d.Devices.Count(dev => !dev.IsDeleted.GetValueOrDefault()),
                UserCount = d.Users.Count(u => !u.IsDeleted.GetValueOrDefault())
            }).ToList();
        }

        public async Task<DepartmentDto?> GetByIdAsync(Guid id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department is null || department.IsDeleted == true) return null;

            return _mapper.Map<DepartmentDto>(department);
        }

        public async Task<DepartmentDto> CreateAsync(DepartmentDto dto)
        {
            var entity = _mapper.Map<Department>(dto);
            entity.Id = Guid.NewGuid();
            _context.Departments.Add(entity);
            await _context.SaveChangesAsync();
            return _mapper.Map<DepartmentDto>(entity);
        }

        public async Task<DepartmentDto?> UpdateAsync(Guid id, DepartmentDto dto)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department is null || department.IsDeleted == true) return null;

            department.DepartmentName = dto.DepartmentName;
            department.DepartmentCode = dto.DepartmentCode;
            department.Location = dto.Location;
            department.UpdatedAt = DateTime.UtcNow;
            department.UpdatedBy = GetCurrentUserId();

            await _context.SaveChangesAsync();
            return _mapper.Map<DepartmentDto>(department);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var department = await _context.Departments
                .Include(d => d.Devices)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department is null || department.IsDeleted == true)
                return false;

            if (department.Devices.Any())
                throw new InvalidOperationException("Không thể xoá phòng ban đang chứa thiết bị");

            department.IsDeleted = true;
            department.DeletedAt = DateTime.UtcNow;
            department.DeletedBy = GetCurrentUserId();

            _context.Departments.Update(department);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RestoreAsync(Guid id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department is null || department.IsDeleted != true) return false;

            department.IsDeleted = false;
            department.DeletedAt = null;
            department.DeletedBy = null;

            _context.Departments.Update(department);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<DepartmentSummaryDto>> GetDepartmentSummaryAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var userIdStr = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = httpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
            var position = httpContext?.User?.FindFirst("position")?.Value;

            if (!Guid.TryParse(userIdStr, out var userId))
                return Enumerable.Empty<DepartmentSummaryDto>();

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId && u.IsDeleted == false);

            if (user == null) return Enumerable.Empty<DepartmentSummaryDto>();

            IQueryable<Department> query = _context.Departments
                .Include(d => d.Users)
                .Include(d => d.Devices)
                .Where(d => !d.IsDeleted.GetValueOrDefault());

            if (role == "Admin")
            {
                return await query.Select(d => new DepartmentSummaryDto
                {
                    DepartmentId = d.Id,
                    DepartmentName = d.DepartmentName,
                    TotalDevices = d.Devices.Count(dev => !dev.IsDeleted.GetValueOrDefault()),
                    TotalUsers = d.Users.Count(u => !u.IsDeleted.GetValueOrDefault()),
                    PersonalDeviceCount = d.Devices.Count(dev => dev.CurrentUserId == userId && !dev.IsDeleted.GetValueOrDefault())
                }).ToListAsync();
            }

            if (position == "Trưởng phòng" && user.DepartmentId != null)
            {
                return await query
                    .Where(d => d.Id == user.DepartmentId)
                    .Select(d => new DepartmentSummaryDto
                    {
                        DepartmentId = d.Id,
                        DepartmentName = d.DepartmentName,
                        TotalDevices = d.Devices.Count(dev => !dev.IsDeleted.GetValueOrDefault()),
                        TotalUsers = d.Users.Count(u => !u.IsDeleted.GetValueOrDefault()),
                        PersonalDeviceCount = d.Devices.Count(dev => dev.CurrentUserId == userId && !dev.IsDeleted.GetValueOrDefault())
                    }).ToListAsync();
            }

            if (position == "Nhân viên" && user.DepartmentId != null)
            {
                var myDevices = await _context.Devices
                    .Where(d => d.CurrentUserId == userId && !d.IsDeleted.GetValueOrDefault())
                    .ToListAsync();

                var dept = await query.FirstOrDefaultAsync(d => d.Id == user.DepartmentId);

                if (dept == null) return Enumerable.Empty<DepartmentSummaryDto>();

                return new List<DepartmentSummaryDto>
                {
                    new DepartmentSummaryDto
                    {
                        DepartmentId = dept.Id,
                        DepartmentName = dept.DepartmentName,
                        TotalDevices = 0,
                        TotalUsers = 0,
                        PersonalDeviceCount = myDevices.Count
                    }
                };
            }

            return Enumerable.Empty<DepartmentSummaryDto>();
        }
    }
}
