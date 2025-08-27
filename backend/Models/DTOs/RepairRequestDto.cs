namespace backend.Models.DTOs
{
    public class RepairRequestDto
    {
        public Guid DeviceId { get; set; }
        public Guid? IncidentReportId { get; set; }
        public DateTime RepairDate { get; set; }
        public string? Description { get; set; }
        public decimal Cost { get; set; }
        public string? RepairCompany { get; set; }
    }
}
