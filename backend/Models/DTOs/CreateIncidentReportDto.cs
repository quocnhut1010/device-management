namespace backend.Models.DTOs
{
    public class CreateIncidentReportDto
    {
        public Guid DeviceId { get; set; }
        public string? ReportType { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }
}
