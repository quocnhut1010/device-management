using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IAIReportService
    {
        Task<AIReportResponseDto> ProcessReportQueryAsync(string query, Guid userId);
    }
}

