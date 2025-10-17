using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models.Entities;
using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Services.Implementations
{
    public class DeviceHistoryService : IDeviceHistoryService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly ILogger<DeviceHistoryService> _logger;

        public DeviceHistoryService(DeviceManagementDbContext context, ILogger<DeviceHistoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Basic logging methods
        public async Task LogActionAsync(Guid deviceId, string action, Guid actionBy, string? details = null, string? actionType = null)
        {
            try
            {
                _logger.LogInformation("Logging action for device {DeviceId}: {Action} by {UserId}", deviceId, action, actionBy);

                var history = new DeviceHistory
                {
                    Id = Guid.NewGuid(),
                    DeviceId = deviceId,
                    Action = action,
                    ActionBy = actionBy,
                    ActionDate = DateTime.Now,
                    Description = details,
                    ActionType = actionType ?? "SYSTEM"
                };

                _context.DeviceHistories.Add(history);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully logged action {Action} for device {DeviceId}", action, deviceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging action {Action} for device {DeviceId}", action, deviceId);
                throw;
            }
        }

        public async Task LogBulkActionsAsync(List<CreateDeviceHistoryDto> histories, Guid actionBy)
        {
            try
            {
                _logger.LogInformation("Logging {Count} bulk actions by {UserId}", histories.Count, actionBy);

                var historyEntities = histories.Select(h => new DeviceHistory
                {
                    Id = Guid.NewGuid(),
                    DeviceId = h.DeviceId,
                    Action = h.Action,
                    ActionBy = actionBy,
                    ActionDate = DateTime.Now,
                    Description = h.Description,
                    ActionType = h.ActionType
                }).ToList();

                _context.DeviceHistories.AddRange(historyEntities);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully logged {Count} bulk actions", histories.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging bulk actions");
                throw;
            }
        }

        // Enhanced query methods
        public async Task<IEnumerable<DeviceHistoryDto>> GetDeviceHistoryAsync(Guid deviceId, DeviceHistoryFilterDto? filter = null)
        {
            try
            {
                _logger.LogInformation("Getting history for device {DeviceId}", deviceId);

                var query = _context.DeviceHistories
                    .Include(h => h.ActionByNavigation)
                    .Include(h => h.Device)
                    .Where(h => h.DeviceId == deviceId);

                query = ApplyFilters(query, filter);

                var histories = await query
                    .OrderByDescending(h => h.ActionDate)
                    .Skip(((filter?.Page ?? 1) - 1) * (filter?.PageSize ?? 20))
                    .Take(filter?.PageSize ?? 20)
                    .Select(h => new DeviceHistoryDto
                    {
                        Id = h.Id,
                        DeviceId = h.DeviceId ?? Guid.Empty,
                        DeviceName = h.Device != null ? h.Device.DeviceName : "Unknown Device",
                        Action = h.Action ?? string.Empty,
                        Description = h.Description ?? string.Empty,
                        ActionBy = h.ActionBy ?? Guid.Empty,
                        ActionByName = h.ActionByNavigation != null ? h.ActionByNavigation.FullName : "Unknown User",
                        ActionDate = h.ActionDate ?? DateTime.Now,
                        ActionType = h.ActionType ?? "SYSTEM"
                    })
                    .ToListAsync();

                _logger.LogInformation("Found {Count} history records for device {DeviceId}", histories.Count, deviceId);
                return histories;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for device {DeviceId}", deviceId);
                throw;
            }
        }

        public async Task<IEnumerable<DeviceHistoryDto>> GetUserHistoryAsync(Guid userId, DeviceHistoryFilterDto? filter = null)
        {
            try
            {
                _logger.LogInformation("Getting history for user {UserId}", userId);

                var query = _context.DeviceHistories
                    .Include(h => h.ActionByNavigation)
                    .Include(h => h.Device)
                    .Where(h => h.ActionBy == userId);

                query = ApplyFilters(query, filter);

                var histories = await query
                    .OrderByDescending(h => h.ActionDate)
                    .Skip(((filter?.Page ?? 1) - 1) * (filter?.PageSize ?? 20))
                    .Take(filter?.PageSize ?? 20)
                    .Select(h => new DeviceHistoryDto
                    {
                        Id = h.Id,
                        DeviceId = h.DeviceId ?? Guid.Empty,
                        DeviceName = h.Device != null ? h.Device.DeviceName : "Unknown Device",
                        Action = h.Action ?? string.Empty,
                        Description = h.Description ?? string.Empty,
                        ActionBy = h.ActionBy ?? Guid.Empty,
                        ActionByName = h.ActionByNavigation != null ? h.ActionByNavigation.FullName : "Unknown User",
                        ActionDate = h.ActionDate ?? DateTime.Now,
                        ActionType = h.ActionType ?? "SYSTEM"
                    })
                    .ToListAsync();

                _logger.LogInformation("Found {Count} history records for user {UserId}", histories.Count, userId);
                return histories;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for user {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<DeviceHistoryDto>> GetAllHistoryAsync(DeviceHistoryFilterDto filter)
        {
            try
            {
                _logger.LogInformation("Getting all device history with filters");

                var query = _context.DeviceHistories
                    .Include(h => h.ActionByNavigation)
                    .Include(h => h.Device)
                    .AsQueryable();

                query = ApplyFilters(query, filter);

                var sortBy = filter.SortBy.ToLowerInvariant();
                var isDescending = filter.SortOrder.ToLowerInvariant() == "desc";

                query = sortBy switch
                {
                    "action" => isDescending ? query.OrderByDescending(h => h.Action) : query.OrderBy(h => h.Action),
                    "actiontype" => isDescending ? query.OrderByDescending(h => h.ActionType) : query.OrderBy(h => h.ActionType),
                    "devicename" => isDescending ? query.OrderByDescending(h => h.Device!.DeviceName) : query.OrderBy(h => h.Device!.DeviceName),
                    _ => isDescending ? query.OrderByDescending(h => h.ActionDate) : query.OrderBy(h => h.ActionDate)
                };

                var histories = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .Select(h => new DeviceHistoryDto
                    {
                        Id = h.Id,
                        DeviceId = h.DeviceId ?? Guid.Empty,
                        DeviceName = h.Device != null ? h.Device.DeviceName : "Unknown Device",
                        Action = h.Action ?? string.Empty,
                        Description = h.Description ?? string.Empty,
                        ActionBy = h.ActionBy ?? Guid.Empty,
                        ActionByName = h.ActionByNavigation != null ? h.ActionByNavigation.FullName : "Unknown User",
                        ActionDate = h.ActionDate ?? DateTime.Now,
                        ActionType = h.ActionType ?? "SYSTEM"
                    })
                    .ToListAsync();

                _logger.LogInformation("Found {Count} history records", histories.Count);
                return histories;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all device history");
                throw;
            }
        }

        // Timeline and aggregation methods
        public async Task<IEnumerable<DeviceHistoryTimelineDto>> GetHistoryTimelineAsync(DeviceHistoryFilterDto filter)
        {
            try
            {
                _logger.LogInformation("Getting device history timeline");

                var query = _context.DeviceHistories
                    .Include(h => h.ActionByNavigation)
                    .Include(h => h.Device)
                    .AsQueryable();

                query = ApplyFilters(query, filter);

                var histories = await query
                    .OrderByDescending(h => h.ActionDate)
                    .Select(h => new DeviceHistoryDto
                    {
                        Id = h.Id,
                        DeviceId = h.DeviceId ?? Guid.Empty,
                        DeviceName = h.Device != null ? h.Device.DeviceName : "Unknown Device",
                        Action = h.Action ?? string.Empty,
                        Description = h.Description ?? string.Empty,
                        ActionBy = h.ActionBy ?? Guid.Empty,
                        ActionByName = h.ActionByNavigation != null ? h.ActionByNavigation.FullName : "Unknown User",
                        ActionDate = h.ActionDate ?? DateTime.Now,
                        ActionType = h.ActionType ?? "SYSTEM"
                    })
                    .ToListAsync();

                // Group by date
                var timeline = histories
                    .GroupBy(h => h.ActionDate.Date)
                    .Select(g => new DeviceHistoryTimelineDto
                    {
                        Date = g.Key,
                        Events = g.OrderByDescending(h => h.ActionDate).ToList(),
                        EventCount = g.Count()
                    })
                    .OrderByDescending(t => t.Date)
                    .ToList();

                _logger.LogInformation("Generated timeline with {Count} days", timeline.Count);
                return timeline;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device history timeline");
                throw;
            }
        }

        public async Task<DeviceHistoryStatsDto> GetHistoryStatsAsync(Guid? deviceId = null, Guid? userId = null, DateTime? fromDate = null)
        {
            try
            {
                _logger.LogInformation("Getting device history statistics");

                var query = _context.DeviceHistories
                    .Include(h => h.ActionByNavigation)
                    .Include(h => h.Device)
                    .AsQueryable();

                if (deviceId.HasValue)
                    query = query.Where(h => h.DeviceId == deviceId);
                
                if (userId.HasValue)
                    query = query.Where(h => h.ActionBy == userId);
                
                if (fromDate.HasValue)
                    query = query.Where(h => h.ActionDate >= fromDate);

                var sevenDaysAgo = DateTime.Now.AddDays(-7);
                var totalEvents = await query.CountAsync();
                var recentEvents = await query.CountAsync(h => h.ActionDate >= sevenDaysAgo);

                var eventsByType = await query
                    .GroupBy(h => h.ActionType)
                    .Select(g => new { Type = g.Key ?? "Unknown", Count = g.Count() })
                    .ToDictionaryAsync(x => x.Type, x => x.Count);

                var eventsByAction = await query
                    .GroupBy(h => h.Action)
                    .Select(g => new { Action = g.Key ?? "Unknown", Count = g.Count() })
                    .ToDictionaryAsync(x => x.Action, x => x.Count);

                var recentActivities = await query
                    .Where(h => h.ActionDate >= sevenDaysAgo)
                    .OrderByDescending(h => h.ActionDate)
                    .Take(10)
                    .Select(h => new DeviceHistoryDto
                    {
                        Id = h.Id,
                        DeviceId = h.DeviceId ?? Guid.Empty,
                        DeviceName = h.Device != null ? h.Device.DeviceName : "Unknown Device",
                        Action = h.Action ?? string.Empty,
                        Description = h.Description ?? string.Empty,
                        ActionBy = h.ActionBy ?? Guid.Empty,
                        ActionByName = h.ActionByNavigation != null ? h.ActionByNavigation.FullName : "Unknown User",
                        ActionDate = h.ActionDate ?? DateTime.Now,
                        ActionType = h.ActionType ?? "SYSTEM"
                    })
                    .ToListAsync();

                var stats = new DeviceHistoryStatsDto
                {
                    TotalEvents = totalEvents,
                    RecentEvents = recentEvents,
                    EventsByType = eventsByType,
                    EventsByAction = eventsByAction,
                    RecentActivities = recentActivities
                };

                _logger.LogInformation("Generated statistics: {TotalEvents} total, {RecentEvents} recent", totalEvents, recentEvents);
                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device history statistics");
                throw;
            }
        }

        // Utility methods
        public async Task<DeviceHistoryDto?> GetHistoryByIdAsync(Guid id)
        {
            try
            {
                var history = await _context.DeviceHistories
                    .Include(h => h.ActionByNavigation)
                    .Include(h => h.Device)
                    .Where(h => h.Id == id)
                    .Select(h => new DeviceHistoryDto
                    {
                        Id = h.Id,
                        DeviceId = h.DeviceId ?? Guid.Empty,
                        DeviceName = h.Device != null ? h.Device.DeviceName : "Unknown Device",
                        Action = h.Action ?? string.Empty,
                        Description = h.Description ?? string.Empty,
                        ActionBy = h.ActionBy ?? Guid.Empty,
                        ActionByName = h.ActionByNavigation != null ? h.ActionByNavigation.FullName : "Unknown User",
                        ActionDate = h.ActionDate ?? DateTime.Now,
                        ActionType = h.ActionType ?? "SYSTEM"
                    })
                    .FirstOrDefaultAsync();

                return history;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history by ID {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<string>> GetAvailableActionsAsync()
        {
            try
            {
                var actions = await _context.DeviceHistories
                    .Where(h => !string.IsNullOrEmpty(h.Action))
                    .Select(h => h.Action!)
                    .Distinct()
                    .OrderBy(a => a)
                    .ToListAsync();

                return actions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available actions");
                throw;
            }
        }

        public async Task<IEnumerable<string>> GetAvailableActionTypesAsync()
        {
            try
            {
                var actionTypes = await _context.DeviceHistories
                    .Where(h => !string.IsNullOrEmpty(h.ActionType))
                    .Select(h => h.ActionType!)
                    .Distinct()
                    .OrderBy(a => a)
                    .ToListAsync();

                return actionTypes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available action types");
                throw;
            }
        }

        public async Task<bool> DeleteHistoryAsync(Guid id)
        {
            try
            {
                var history = await _context.DeviceHistories.FindAsync(id);
                if (history == null)
                    return false;

                _context.DeviceHistories.Remove(history);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted history record {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting history record {Id}", id);
                throw;
            }
        }

        public async Task<int> CleanupOldHistoryAsync(DateTime beforeDate)
        {
            try
            {
                var oldRecords = await _context.DeviceHistories
                    .Where(h => h.ActionDate < beforeDate)
                    .ToListAsync();

                _context.DeviceHistories.RemoveRange(oldRecords);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleaned up {Count} old history records before {Date}", oldRecords.Count, beforeDate);
                return oldRecords.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old history records");
                throw;
            }
        }

        // Helper method to apply filters
        private static IQueryable<DeviceHistory> ApplyFilters(IQueryable<DeviceHistory> query, DeviceHistoryFilterDto? filter)
        {
            if (filter == null) return query;

            if (filter.DeviceId.HasValue)
                query = query.Where(h => h.DeviceId == filter.DeviceId);

            if (filter.UserId.HasValue)
                query = query.Where(h => h.ActionBy == filter.UserId);

            if (!string.IsNullOrEmpty(filter.Action))
                query = query.Where(h => h.Action != null && h.Action.Contains(filter.Action));

            if (!string.IsNullOrEmpty(filter.ActionType))
                query = query.Where(h => h.ActionType == filter.ActionType);

            if (filter.FromDate.HasValue)
                query = query.Where(h => h.ActionDate >= filter.FromDate);

            if (filter.ToDate.HasValue)
                query = query.Where(h => h.ActionDate <= filter.ToDate);

            return query;
        }
    }
}
