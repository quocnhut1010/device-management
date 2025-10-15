namespace backend.Models.Dtos.IncidentReports
{
    public class RejectIncidentDto
    {
        public string Reason { get; set; } = string.Empty;
        public string Decision { get; set; } = "Keep";
    }
}