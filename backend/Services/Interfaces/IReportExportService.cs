using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IReportExportService
    {
        Task<byte[]> ExportDevicesAsync(ExportRequestDto request);
        Task<byte[]> ExportRepairsAsync(ExportRequestDto request);
        Task<byte[]> ExportIncidentsAsync(ExportRequestDto request);
        Task<byte[]> ExportLiquidationsAsync(ExportRequestDto request);
        Task<int> GetDevicesCountAsync(ExportRequestDto request);
        Task<int> GetIncidentsCountAsync(ExportRequestDto request);
        Task<int> GetRepairsCountAsync(ExportRequestDto request);
        Task<int> GetLiquidationsCountAsync(ExportRequestDto request);
        Task<ReportExportDto> SaveExportHistoryAsync(string reportType, string format, Guid userId, string? fileUrl);
        Task<IEnumerable<ReportExportDto>> GetExportHistoryAsync();
    }
}
