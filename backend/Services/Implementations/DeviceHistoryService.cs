using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models.Entities;
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

        public async Task LogActionAsync(Guid deviceId, string action, Guid actionBy, string? details = null)
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
                    Description = details
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

        public async Task<IEnumerable<DeviceHistory>> GetDeviceHistoryAsync(Guid deviceId)
        {
            try
            {
                _logger.LogInformation("Getting history for device {DeviceId}", deviceId);

                var history = await _context.DeviceHistories
                    .Include(h => h.ActionByNavigation)
                    .Include(h => h.Device)
                    .Where(h => h.DeviceId == deviceId)
                    .OrderByDescending(h => h.ActionDate)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} history records for device {DeviceId}", history.Count, deviceId);
                return history;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for device {DeviceId}", deviceId);
                throw;
            }
        }

        public async Task<IEnumerable<DeviceHistory>> GetUserHistoryAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Getting history for user {UserId}", userId);

                var history = await _context.DeviceHistories
                    .Include(h => h.ActionByNavigation)
                    .Include(h => h.Device)
                    .Where(h => h.ActionBy == userId)
                    .OrderByDescending(h => h.ActionDate)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} history records for user {UserId}", history.Count, userId);
                return history;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for user {UserId}", userId);
                throw;
            }
        }
    }
}