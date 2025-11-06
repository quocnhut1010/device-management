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
    }

    public class TechnicianStatsDto
    {
        public int RepairsPending { get; set; }
        public int RepairsInProgress { get; set; }
        public int RepairsAwaitingApproval { get; set; }
        public int RepairsCompletedThisWeek { get; set; }
    }

    public class EmployeeStatsDto
    {
        public int MyDevices { get; set; }
        public int DevicesActive { get; set; }
        public int DevicesRepairing { get; set; }
        public int MyIncidentsOpen { get; set; }
        public int MyIncidentsPending { get; set; }
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
        public string Period { get; set; } = string.Empty; // "2024-W45" or "2024-11"
        public int Count { get; set; }
    }
}

