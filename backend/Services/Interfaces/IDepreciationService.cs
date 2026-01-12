using backend.Models.Entities;

namespace backend.Services.Interfaces
{
    /// <summary>
    /// Service tính toán khấu hao thiết bị dựa trên thời gian sử dụng và tuổi thọ hữu ích.
    /// </summary>
    public interface IDepreciationService
    {
        /// <summary>
        /// Tính toán thông tin khấu hao cho thiết bị.
        /// </summary>
        /// <param name="device">Thiết bị cần tính khấu hao</param>
        /// <param name="asOfDate">Ngày tính toán (mặc định là ngày hiện tại)</param>
        /// <returns>Thông tin khấu hao hoặc null nếu không đủ dữ liệu</returns>
        DepreciationInfo? CalculateDepreciation(Device device, DateTime? asOfDate = null);
    }

    /// <summary>
    /// Thông tin khấu hao của thiết bị.
    /// </summary>
    public class DepreciationInfo
    {
        public double YearsUsed { get; set; }
        public int? UsefulLifeYears { get; set; }
        public decimal DepreciationRate { get; set; }  // 0.0 - 1.0
        public decimal CurrentValue { get; set; }
        public decimal RemainingValue => CurrentValue;  // Alias cho CurrentValue
        public decimal PurchasePrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
    }
}

