using AutoMapper;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class SupplierService : ISupplierService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IMapper _mapper;

        public SupplierService(DeviceManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SupplierDto>> GetAllAsync()
        {
            var suppliers = await _context.Suppliers
                .Where(s => s.IsDeleted != true)
                .ToListAsync();

            return _mapper.Map<IEnumerable<SupplierDto>>(suppliers);
        }

        public async Task<SupplierDto?> GetByIdAsync(Guid id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
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
            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
