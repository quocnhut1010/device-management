using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models.Entities;
using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IDeviceHistoryService
    {
        // Basic logging methods
        Task LogActionAsync(Guid deviceId, string action, Guid actionBy, string? details = null, string? actionType = null);
        Task LogBulkActionsAsync(List<CreateDeviceHistoryDto> histories, Guid actionBy);
        
        // Enhanced query methods
        Task<IEnumerable<DeviceHistoryDto>> GetDeviceHistoryAsync(Guid deviceId, DeviceHistoryFilterDto? filter = null);
        Task<IEnumerable<DeviceHistoryDto>> GetUserHistoryAsync(Guid userId, DeviceHistoryFilterDto? filter = null);
        Task<IEnumerable<DeviceHistoryDto>> GetAllHistoryAsync(DeviceHistoryFilterDto filter);
        
        // Timeline and aggregation methods
        Task<IEnumerable<DeviceHistoryTimelineDto>> GetHistoryTimelineAsync(DeviceHistoryFilterDto filter);
        Task<DeviceHistoryStatsDto> GetHistoryStatsAsync(Guid? deviceId = null, Guid? userId = null, DateTime? fromDate = null);
        
        // Utility methods
        Task<DeviceHistoryDto?> GetHistoryByIdAsync(Guid id);
        Task<IEnumerable<string>> GetAvailableActionsAsync();
        Task<IEnumerable<string>> GetAvailableActionTypesAsync();
        Task<bool> DeleteHistoryAsync(Guid id);
        Task<int> CleanupOldHistoryAsync(DateTime beforeDate);
    }
}
