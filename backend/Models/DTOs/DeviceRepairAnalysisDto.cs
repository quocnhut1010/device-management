namespace backend.Models.Dtos
{
    public class DeviceRepairAnalysisDto
    {
        public Guid DeviceId { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public decimal DeviceValue { get; set; }  // Giá mua ban đầu (PurchasePrice)
        public decimal? CurrentValue { get; set; }  // Giá trị hiện tại sau khấu hao
        public int RepairCount { get; set; }
        public decimal TotalCost { get; set; }
        public DateTime? LastRepairDate { get; set; }
        public List<string> Warnings { get; set; } = new();
        public string Suggestion { get; set; } = string.Empty;
        
        // Thông tin khấu hao
        public DepreciationInfoDto? DepreciationInfo { get; set; }
    }

    public class DepreciationInfoDto
    {
        public double YearsUsed { get; set; }
        public int? UsefulLifeYears { get; set; }
        public decimal DepreciationRate { get; set; }  // 0.0 - 1.0
        public decimal RemainingValue { get; set; }  // Alias của CurrentValue
    }
}
