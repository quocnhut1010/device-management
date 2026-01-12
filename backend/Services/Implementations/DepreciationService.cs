using backend.Models.Entities;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
    public class DepreciationService : IDepreciationService
    {
        private const int DefaultUsefulLifeYears = 5;  // Giá trị mặc định nếu không có UsefulLifeYears

        public DepreciationInfo? CalculateDepreciation(Device device, DateTime? asOfDate = null)
        {
            // Kiểm tra dữ liệu cần thiết
            if (device == null || !device.PurchasePrice.HasValue || !device.PurchaseDate.HasValue)
            {
                return null;
            }

            var purchasePrice = device.PurchasePrice.Value;
            var purchaseDate = device.PurchaseDate.Value;
            var calculationDate = asOfDate ?? DateTime.UtcNow;

            // Nếu ngày tính toán trước ngày mua, không có khấu hao
            if (calculationDate < purchaseDate)
            {
                return new DepreciationInfo
                {
                    YearsUsed = 0,
                    UsefulLifeYears = device.UsefulLifeYears ?? DefaultUsefulLifeYears,
                    DepreciationRate = 0,
                    CurrentValue = purchasePrice,
                    PurchasePrice = purchasePrice,
                    PurchaseDate = purchaseDate
                };
            }

            // Tính số năm đã sử dụng
            var timeSpan = calculationDate - purchaseDate;
            var yearsUsed = timeSpan.TotalDays / 365.25;  // Sử dụng 365.25 để tính năm nhuận chính xác

            // Xác định tuổi thọ hữu ích
            var usefulLifeYears = device.UsefulLifeYears ?? DefaultUsefulLifeYears;

            // Tính tỷ lệ khấu hao (không vượt quá 100%)
            var depreciationRate = Math.Min((decimal)(yearsUsed / usefulLifeYears), 1.0m);

            // Tính giá trị hiện tại
            var currentValue = purchasePrice * (1 - depreciationRate);

            return new DepreciationInfo
            {
                YearsUsed = yearsUsed,
                UsefulLifeYears = device.UsefulLifeYears,
                DepreciationRate = depreciationRate,
                CurrentValue = currentValue,
                PurchasePrice = purchasePrice,
                PurchaseDate = purchaseDate
            };
        }
    }
}

