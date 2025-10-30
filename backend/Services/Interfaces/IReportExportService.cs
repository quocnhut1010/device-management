using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IReportExportService
    {
        Task<byte[]> ExportDevicesAsync(ExportRequestDto request);
        Task<byte[]> ExportRepairsAsync(ExportRequestDto request);
        Task<byte[]> ExportIncidentsAsync(ExportRequestDto request);
        Task<byte[]> ExportLiquidationsAsync(ExportRequestDto request);
        Task<ReportExportDto> SaveExportHistoryAsync(string reportType, string format, Guid userId, string? fileUrl);
        Task<IEnumerable<ReportExportDto>> GetExportHistoryAsync();
    }
}
