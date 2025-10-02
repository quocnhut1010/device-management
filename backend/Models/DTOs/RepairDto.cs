using backend.Models;

public class RepairDto
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public string DeviceCode { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;

    public Guid TechnicianId { get; set; }
    public string TechnicianName { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? RepairDate { get; set; }

    public string? Description { get; set; }
    public int Status { get; set; }
    public string StatusText { get; set; } = string.Empty;

    public string? RepairCompany { get; set; }

    public decimal? Cost { get; set; }
    public decimal? LaborHours { get; set; }

    public DateTime? RejectedAt { get; set; }
    public string? RejectedReason { get; set; }
     public List<RepairImageDto> RepairImages { get; set; } = new();


}
