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
    public class SupplierService : ISupplierService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SupplierService(
            DeviceManagementDbContext context,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
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

       public async Task<IEnumerable<SupplierDto>> GetAllAsync(bool? isDeleted = null)
        {
            var query = _context.Suppliers
                .Include(s => s.Devices) // ✅ load danh sách thiết bị
                .AsQueryable();

            if (isDeleted != null)
                query = query.Where(s => s.IsDeleted == isDeleted);

            var suppliers = await query.ToListAsync();
            return _mapper.Map<IEnumerable<SupplierDto>>(suppliers);
        }

        public async Task<SupplierDto?> GetByIdAsync(Guid id)
        {
            var supplier = await _context.Suppliers
                .Include(s => s.Devices) // ✅ load thiết bị
                .FirstOrDefaultAsync(s => s.Id == id);

            if (supplier is null || supplier.IsDeleted == true) return null;

            return _mapper.Map<SupplierDto>(supplier);
        }


        public async Task<SupplierDto> CreateAsync(SupplierDto dto)
        {
            var entity = _mapper.Map<Supplier>(dto);
            entity.Id = Guid.NewGuid();

            _context.Suppliers.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<SupplierDto>(entity);
        }

        public async Task<SupplierDto?> UpdateAsync(Guid id, SupplierDto dto)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier is null || supplier.IsDeleted == true) return null;

            _mapper.Map(dto, supplier);
            supplier.UpdatedAt = DateTime.UtcNow;
            supplier.UpdatedBy = GetCurrentUserId();

            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();

            return _mapper.Map<SupplierDto>(supplier);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier is null || supplier.IsDeleted == true) return false;

            supplier.IsDeleted = true;
            supplier.DeletedAt = DateTime.UtcNow;
            supplier.DeletedBy = GetCurrentUserId();

            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> RestoreAsync(Guid id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier is null || supplier.IsDeleted != true)
                return false;

            supplier.IsDeleted = false;
            supplier.DeletedAt = null;
            supplier.DeletedBy = null;

            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
