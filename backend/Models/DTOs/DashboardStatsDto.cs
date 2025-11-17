namespace backend.Models.DTOs
{
    public class AdminStatsDto
    {
        public int TotalDevices { get; set; }
        public int DevicesInUse { get; set; }
        public int DevicesAvailable { get; set; }
        public int DevicesRepairing { get; set; }
        public int DevicesPendingLiquidation { get; set; }
        public int OpenIncidents { get; set; }
        public int ActiveRepairs { get; set; }
        public int ReplacementsThisWeek { get; set; }
        public int LiquidationsThisMonth { get; set; }
        public int UnreadNotifications { get; set; }
    }

    public class ManagerStatsDto
    {
        public int DepartmentDevices { get; set; }
        public int DevicesInUse { get; set; }
        public int DevicesRepairing { get; set; }
        public int OpenIncidents { get; set; }
        public int AvailableDevices { get; set; }
        public int OngoingRepairs { get; set; }
    }

    public class TechnicianStatsDto
    {
        public int RepairsPending { get; set; }
        public int RepairsInProgress { get; set; }
        public int RepairsAwaitingApproval { get; set; }
        public int RepairsCompletedThisWeek { get; set; }
        public string AvgRepairTime { get; set; } = string.Empty; // e.g., "3.2h"
    }

    public class EmployeeStatsDto
    {
        public int MyDevices { get; set; }
        public int DevicesActive { get; set; }
        public int DevicesRepairing { get; set; }
        public int MyIncidentsOpen { get; set; }
        public int MyIncidentsPending { get; set; }
        public int ActiveIssues { get; set; }
        public int ResolvedIncidents { get; set; }
    }

    public class DevicesByDepartmentDto
    {
        public string DepartmentName { get; set; } = string.Empty;
        public int DeviceCount { get; set; }
    }

    public class DevicesByStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class IncidentTrendDto
    {
        public string Period { get; set; } = string.Empty; // "2024-W45" or "2024-11" or "Jul", "Aug", etc.
        public int Count { get; set; }
    }

    // Chart DTOs
    public class RepairTrendDto
    {
        public string Week { get; set; } = string.Empty; // "Week 1", "Week 2", etc.
        public int Assigned { get; set; }
        public int Completed { get; set; }
    }

    public class RepairMetricsDto
    {
        public string Category { get; set; } = string.Empty; // Device category/type
        public double MTTR { get; set; } // Mean Time To Repair in hours
        public double MTBF { get; set; } // Mean Time Between Failures in days
    }

    public class FrequentDevicesDto
    {
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceCode { get; set; } = string.Empty;
        public int RepairCount { get; set; }
    }

    public class DepartmentIncidentsTrendDto
    {
        public string Period { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    // Table DTOs
    public class RiskDeviceDto
    {
        public Guid Id { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceCode { get; set; } = string.Empty;
        public int IncidentCount { get; set; }
        public string Age { get; set; } = string.Empty; // e.g., "3 years"
        public string Recommendation { get; set; } = string.Empty; // e.g., "Replace", "Maintain"
    }

    public class ReplacementHistoryDto
    {
        public Guid Id { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceCode { get; set; } = string.Empty;
        public string ReplacedDeviceName { get; set; } = string.Empty;
        public string ReplacedDeviceCode { get; set; } = string.Empty;
        public DateTime ReplacementDate { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class WorkQueueDto
    {
        public Guid Id { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceCode { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty; // "low", "medium", "high", "critical"
        public string SLA { get; set; } = string.Empty; // e.g., "2 days"
        public DateTime CreatedDate { get; set; }
        public int Status { get; set; }
    }

    public class RecentIncidentDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string ReportedBy { get; set; } = string.Empty;
        public DateTime ReportDate { get; set; }
        public int Status { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty; // Priority/Type
    }

    public class ActiveRepairDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty;
        public string SLARemaining { get; set; } = string.Empty;
        public int Status { get; set; }
        public DateTime? StartDate { get; set; }
    }

    public class DepartmentDeviceDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string AssignedTo { get; set; } = string.Empty;
        public DateTime? WarrantyExpiry { get; set; }
    }

    public class DepartmentIncidentDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string ReportedBy { get; set; } = string.Empty;
        public DateTime ReportDate { get; set; }
        public int Status { get; set; }
        public string ReportType { get; set; } = string.Empty;
    }

    public class DepartmentRepairDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty;
        public int Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class MyDeviceDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? WarrantyExpiry { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }

    public class MyIncidentDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public DateTime ReportDate { get; set; }
        public int Status { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class RepairHistoryDto
    {
        public Guid Id { get; set; }
        public string DeviceCode { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public int Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double? Cost { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}

