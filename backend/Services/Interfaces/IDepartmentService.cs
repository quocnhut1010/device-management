using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentDto>> GetAllAsync();
        Task<DepartmentDto?> GetByIdAsync(Guid id);
        Task<DepartmentDto> CreateAsync(DepartmentDto dto);
        Task<DepartmentDto?> UpdateAsync(Guid id, DepartmentDto dto);
        Task<bool> DeleteAsync(Guid id);
         Task<bool> RestoreAsync(Guid id); 
    }
}
