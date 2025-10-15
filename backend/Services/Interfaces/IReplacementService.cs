using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface IReplacementService
    {
        Task<IEnumerable<SuggestedDeviceDto>> GetSuggestedReplacementDevicesAsync(Guid oldDeviceId);
        Task<IEnumerable<SuggestedDeviceDto>> GetAllAvailableDevicesAsync();
        Task<ReplacementDto> CreateReplacementAsync(CreateReplacementDto createReplacementDto, Guid performedBy);
        Task<IEnumerable<ReplacementDto>> GetReplacementHistoryAsync(Guid? deviceId, Guid userId, string role);

        Task<ReplacementDto?> GetReplacementByIdAsync(Guid id);
    }
}