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
        public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
        {
            var departments = await _context.Departments
                .ToListAsync();

            return _mapper.Map<IEnumerable<DepartmentDto>>(departments);
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
            var department = await _context.Departments.FindAsync(id);
            if (department is null || department.IsDeleted == true) return false;

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

    }
}
