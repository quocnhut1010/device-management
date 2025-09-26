namespace backend.Models.DTOs
{
    public class RepairRequestDto
    {
        public string? Description { get; set; }
        public decimal? Cost { get; set; }
        public decimal? LaborHours { get; set; }
        public string? RepairCompany { get; set; }
        public List<string>? ImageUrls { get; set; }
    }
}
