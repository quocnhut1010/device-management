using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models.Entities;

namespace backend.Services.Interfaces
{
    public interface IDeviceHistoryService
    {
        Task LogActionAsync(Guid deviceId, string action, Guid actionBy, string? details = null);
        Task<IEnumerable<DeviceHistory>> GetDeviceHistoryAsync(Guid deviceId);
        Task<IEnumerable<DeviceHistory>> GetUserHistoryAsync(Guid userId);
    }
}