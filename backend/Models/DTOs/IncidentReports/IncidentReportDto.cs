using System;
using backend.Models.Entities;

namespace backend.Models.Dtos.IncidentReports
{
    public class IncidentReportDto
    {
        public Guid Id { get; set; }
        public Guid DeviceId { get; set; }
        public Guid ReportedByUserId { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        
        public DateTime ReportDate { get; set; }
        public int Status { get; set; } // Use enum values: 0=ChoDuyet, 1=DaTaoLenhSua, 2=DaTuChoi, etc.
        
        // Rejection info
        public string? RejectedReason { get; set; }
        public string? RejectedBy { get; set; }
        public DateTime? RejectedAt { get; set; }
        
        // Update info
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }

        // Navigation properties
        public IncidentDeviceDto? Device { get; set; }
        public IncidentUserDto? ReportedByUser { get; set; }
    }

    public class IncidentDeviceDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
    }

    public class IncidentUserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
