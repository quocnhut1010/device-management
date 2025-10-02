using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IRepairService
    {
        Task<RepairDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<RepairDto>> GetAllAsync();
        Task<IEnumerable<RepairDto>> GetMyRepairsAsync(Guid technicianId);
        
        // Lấy danh sách kỹ thuật viên để phân công
        Task<IEnumerable<UserDto>> GetAvailableTechniciansAsync();

        // Admin tạo repair từ incident report (được gọi từ IncidentReportService)
        Task<RepairDto> CreateRepairFromIncidentAsync(Guid incidentReportId, Guid adminId);

        // Admin phân công kỹ thuật viên cho lệnh sửa chữa
        Task<bool> AssignTechnicianAsync(Guid repairId, Guid technicianId, Guid adminId, string? note = null);

        // Kỹ thuật viên chấp nhận lệnh sửa chữa
        Task<bool> AcceptRepairAsync(Guid repairId, Guid technicianId);
        
        // Kỹ thuật viên hoàn thành sửa chữa
        Task<bool> CompleteRepairAsync(Guid repairId, RepairRequestDto dto, Guid technicianId);
        
        // Admin xác nhận hoàn tất
        Task<bool> ConfirmCompletionAsync(Guid repairId, Guid adminId);

        // Kỹ thuật viên từ chối lệnh sửa
        Task<bool> RejectRepairAsync(Guid repairId, string reason, Guid technicianId);
        
        // Kỹ thuật viên đánh dấu "không cần sửa"
        Task<bool> MarkAsNotNeededAsync(Guid repairId, string note, Guid technicianId);
        
        // Kỹ thuật viên chọn từ chối hoặc không cần sửa (thống nhất)
        Task<bool> RejectOrMarkNotNeededAsync(Guid repairId, RejectOrNotNeededDto dto, Guid technicianId);
    }
}