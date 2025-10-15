using backend.Models.DTOs;

namespace backend.Services.Interfaces
{
    public interface ILiquidationService
    {
        /// <summary>
        /// Lấy danh sách thiết bị đủ điều kiện thanh lý theo use case
        /// </summary>
        Task<IEnumerable<LiquidationEligibleDeviceDto>> GetEligibleDevicesAsync();
        
        /// <summary>
        /// Thanh lý một thiết bị
        /// </summary>
        Task<LiquidationDto> LiquidateDeviceAsync(CreateLiquidationDto dto, Guid approvedBy);
        
        /// <summary>
        /// Thanh lý nhiều thiết bị cùng lúc
        /// </summary>
        Task<IEnumerable<LiquidationDto>> LiquidateBatchAsync(BatchLiquidationDto dto, Guid approvedBy);
        
        /// <summary>
        /// Lấy lịch sử thanh lý
        /// </summary>
        Task<IEnumerable<LiquidationDto>> GetLiquidationHistoryAsync();
        
        /// <summary>
        /// Kiểm tra thiết bị có đủ điều kiện thanh lý không
        /// </summary>
        Task<bool> IsDeviceEligibleForLiquidationAsync(Guid deviceId);
        
        /// <summary>
        /// Lấy chi tiết một bản ghi thanh lý
        /// </summary>
        Task<LiquidationDto?> GetLiquidationByIdAsync(Guid id);
    }
}