namespace backend.Models.DTOs
{
    public class AssignTechnicianDto
    {
        public Guid TechnicianId { get; set; }
        public string? Note { get; set; }
    }
}