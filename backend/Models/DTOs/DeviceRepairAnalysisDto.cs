namespace backend.Models.Dtos
{
    public class DeviceRepairAnalysisDto
    {
        public Guid DeviceId { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public decimal DeviceValue { get; set; }
        public int RepairCount { get; set; }
        public decimal TotalCost { get; set; }
        public DateTime? LastRepairDate { get; set; }
        public List<string> Warnings { get; set; } = new();
        public string Suggestion { get; set; } = string.Empty;
    }
}
