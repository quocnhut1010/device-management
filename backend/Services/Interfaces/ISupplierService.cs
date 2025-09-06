using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface ISupplierService
    {
        Task<IEnumerable<SupplierDto>> GetAllAsync(bool? isDeleted = null);
        Task<SupplierDto?> GetByIdAsync(Guid id);
        Task<SupplierDto> CreateAsync(SupplierDto dto);
        Task<SupplierDto?> UpdateAsync(Guid id, SupplierDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> RestoreAsync(Guid id);
    }
}
