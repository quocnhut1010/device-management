using backend.Models.Dtos.IncidentReports;

namespace backend.Services.Interfaces
{
    public interface IIncidentReportService
    {
        Task<IEnumerable<IncidentReportDto>> GetAllAsync();
        Task<IEnumerable<IncidentReportDto>> GetMyReportsAsync(Guid userId);
        Task<IncidentReportDto?> GetByIdAsync(Guid id);
        Task<IncidentReportDto> CreateAsync(CreateIncidentReportDto dto, Guid userId);
        Task<IncidentReportDto?> UpdateStatusAsync(Guid id, UpdateIncidentReportDto dto, string updatedBy);

        Task<(bool Success, string Message, object? Data)> ApproveAndCreateRepairAsync(Guid reportId, string updatedBy);
        Task<bool> RejectAsync(Guid reportId, string reason, string rejectedBy);
    }
}
