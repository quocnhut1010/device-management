using backend.Data;
using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly DeviceManagementDbContext _context;

        public DashboardService(DeviceManagementDbContext context)
        {
            _context = context;
        }

        public async Task<AdminStatsDto> GetAdminStatsAsync()
        {
            var now = DateTime.UtcNow;
            var startOfWeek = now.AddDays(-(int)now.DayOfWeek);
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var devices = await _context.Devices.Where(d => d.IsDeleted != true).ToListAsync();
            var incidents = await _context.IncidentReports.ToListAsync();
            var repairs = await _context.Repairs.ToListAsync();
            var replacements = await _context.Replacements.ToListAsync();
            var liquidations = await _context.Liquidations.ToListAsync();

            return new AdminStatsDto
            {
                TotalDevices = devices.Count,
                DevicesInUse = devices.Count(d => d.Status == "Đang sử dụng"),
                DevicesAvailable = devices.Count(d => d.Status == "Sẵn sàng" || d.Status == "Chưa cấp phát"),
                DevicesRepairing = devices.Count(d => d.Status == "Đang sửa"),
                DevicesPendingLiquidation = devices.Count(d => d.Status == "Chờ thanh lý"),
                OpenIncidents = incidents.Count(i => i.Status == 0 || i.Status == 1), // ChoDuyet, DaTaoLenhSua
                ActiveRepairs = repairs.Count(r => r.Status == 0 || r.Status == 1), // ChoThucHien, DangSua
                ReplacementsThisWeek = replacements.Count(r => r.ReplacementDate >= startOfWeek),
                LiquidationsThisMonth = liquidations.Count(l => l.LiquidationDate >= startOfMonth),
                UnreadNotifications = 0 // Will be calculated per user
            };
        }

        public async Task<object> GetAdminChartsAsync()
        {
            var devices = await _context.Devices
                .Include(d => d.CurrentDepartment)
                .Where(d => d.IsDeleted != true)
                .ToListAsync();

            var devicesByDept = devices
                .Where(d => d.CurrentDepartment != null)
                .GroupBy(d => d.CurrentDepartment!.DepartmentName)
                .Select(g => new DevicesByDepartmentDto { DepartmentName = g.Key!, DeviceCount = g.Count() })
                .OrderByDescending(x => x.DeviceCount)
                .Take(10)
                .ToList();

            var devicesByStatus = devices
                .GroupBy(d => d.Status ?? "Không xác định")
                .Select(g => new DevicesByStatusDto { Status = g.Key, Count = g.Count() })
                .ToList();

            return new
            {
                devicesByDepartment = devicesByDept,
                devicesByStatus = devicesByStatus
            };
        }

        public async Task<object> GetAdminTablesAsync()
        {
            var recentIncidents = await _context.IncidentReports
                .Include(i => i.Device)
                .Include(i => i.ReportedByUser)
                .OrderByDescending(i => i.ReportDate)
                .Take(10)
                .Select(i => new
                {
                    i.Id,
                    DeviceCode = i.Device!.DeviceCode,
                    DeviceName = i.Device.DeviceName,
                    ReportedBy = i.ReportedByUser!.FullName,
                    i.ReportDate,
                    i.Status,
                    i.Description
                })
                .ToListAsync();

            var activeRepairs = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.AssignedToTechnician)
                .Where(r => r.Status == 0 || r.Status == 1)
                .Select(r => new
                {
                    r.Id,
                    DeviceCode = r.Device!.DeviceCode,
                    DeviceName = r.Device.DeviceName,
                    Technician = r.AssignedToTechnician!.FullName,
                    r.StartDate,
                    r.Status
                })
                .ToListAsync();

            return new
            {
                recentIncidents,
                activeRepairs
            };
        }

        public async Task<ManagerStatsDto> GetManagerStatsAsync(Guid departmentId)
        {
            var deptDevices = await _context.Devices
                .Where(d => d.CurrentDepartmentId == departmentId && d.IsDeleted != true)
                .ToListAsync();

            var deptIncidents = await _context.IncidentReports
                .Include(i => i.Device)
                .Where(i => i.Device!.CurrentDepartmentId == departmentId)
                .ToListAsync();

            return new ManagerStatsDto
            {
                DepartmentDevices = deptDevices.Count,
                DevicesInUse = deptDevices.Count(d => d.Status == "Đang sử dụng"),
                DevicesRepairing = deptDevices.Count(d => d.Status == "Đang sửa"),
                OpenIncidents = deptIncidents.Count(i => i.Status == 0 || i.Status == 1)
            };
        }

        public async Task<object> GetManagerChartsAsync(Guid departmentId)
        {
            var deptDevices = await _context.Devices
                .Where(d => d.CurrentDepartmentId == departmentId && d.IsDeleted != true)
                .ToListAsync();

            var devicesByStatus = deptDevices
                .GroupBy(d => d.Status ?? "Không xác định")
                .Select(g => new DevicesByStatusDto { Status = g.Key, Count = g.Count() })
                .ToList();

            return new { devicesByStatus };
        }

        public async Task<TechnicianStatsDto> GetTechnicianStatsAsync(Guid technicianId)
        {
            var myRepairs = await _context.Repairs
                .Where(r => r.AssignedToTechnicianId == technicianId)
                .ToListAsync();

            var now = DateTime.UtcNow;
            var startOfWeek = now.AddDays(-(int)now.DayOfWeek);

            return new TechnicianStatsDto
            {
                RepairsPending = myRepairs.Count(r => r.Status == 0), // ChoThucHien
                RepairsInProgress = myRepairs.Count(r => r.Status == 1), // DangSua
                RepairsAwaitingApproval = myRepairs.Count(r => r.Status == 2), // ChoDuyetHoanTat
                RepairsCompletedThisWeek = myRepairs.Count(r => r.Status == 3 && r.EndDate >= startOfWeek)
            };
        }

        public async Task<object> GetTechnicianChartsAsync(Guid technicianId)
        {
            // Placeholder for charts data
            return new { message = "Charts data for technician" };
        }

        public async Task<EmployeeStatsDto> GetEmployeeStatsAsync(Guid userId)
        {
            var myDevices = await _context.Devices
                .Where(d => d.CurrentUserId == userId && d.IsDeleted != true)
                .ToListAsync();

            var myIncidents = await _context.IncidentReports
                .Where(i => i.ReportedByUserId == userId)
                .ToListAsync();

            return new EmployeeStatsDto
            {
                MyDevices = myDevices.Count,
                DevicesActive = myDevices.Count(d => d.Status == "Đang sử dụng"),
                DevicesRepairing = myDevices.Count(d => d.Status == "Đang sửa"),
                MyIncidentsOpen = myIncidents.Count(i => i.Status == 0), // ChoDuyet
                MyIncidentsPending = myIncidents.Count(i => i.Status == 1) // DaTaoLenhSua
            };
        }

        public async Task<object> GetEmployeeChartsAsync(Guid userId)
        {
            var myDevices = await _context.Devices
                .Where(d => d.CurrentUserId == userId && d.IsDeleted != true)
                .ToListAsync();

            var devicesByStatus = myDevices
                .GroupBy(d => d.Status ?? "Không xác định")
                .Select(g => new DevicesByStatusDto { Status = g.Key, Count = g.Count() })
                .ToList();

            return new { devicesByStatus };
        }
    }
}

