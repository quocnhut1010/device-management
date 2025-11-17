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
                .Include(d => d.Model)
                .ThenInclude(m => m!.DeviceType)
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

            // Incident Trend - Last 6 months
            var now = DateTime.UtcNow;
            var sixMonthsAgo = now.AddMonths(-6);
            var incidentTrend = await _context.IncidentReports
                .Where(i => i.ReportDate >= sixMonthsAgo)
                .ToListAsync();

            var monthlyIncidents = incidentTrend
                .Where(i => i.ReportDate.HasValue)
                .GroupBy(i => new { Year = i.ReportDate!.Value.Year, Month = i.ReportDate!.Value.Month })
                .Select(g => new IncidentTrendDto
                {
                    Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                    Count = g.Count()
                })
                .OrderBy(x => x.Period)
                .ToList();

            // Repair Metrics (MTTR/MTBF) by Device Type/Category
            var completedRepairs = await _context.Repairs
                .Include(r => r.Device)
                .ThenInclude(d => d!.Model)
                .ThenInclude(m => m!.DeviceType)
                .Where(r => r.Status == 3 && r.StartDate.HasValue && r.EndDate.HasValue) // DaHoanTat
                .ToListAsync();

            var repairMetrics = completedRepairs
                .Where(r => r.Device?.Model?.DeviceType != null)
                .GroupBy(r => r.Device!.Model!.DeviceType!.TypeName)
                .Select(g =>
                {
                    var repairs = g.ToList();
                    var totalRepairTime = repairs
                        .Where(r => r.StartDate.HasValue && r.EndDate.HasValue)
                        .Sum(r => (r.EndDate!.Value - r.StartDate!.Value).TotalHours);
                    var mttr = repairs.Count > 0 ? totalRepairTime / repairs.Count : 0;

                    // Calculate MTBF: Average time between failures for devices of this type
                    var deviceIds = repairs.Select(r => r.DeviceId).Distinct().ToList();
                    var deviceRepairDates = repairs
                        .Where(r => r.DeviceId.HasValue)
                        .GroupBy(r => r.DeviceId!.Value)
                        .Select(gr => gr.OrderBy(r => r.StartDate ?? DateTime.MaxValue).ToList())
                        .ToList();

                    double mtbf = 0;
                    if (deviceRepairDates.Any())
                    {
                        var timeBetweenFailures = new List<double>();
                        foreach (var deviceRepairs in deviceRepairDates)
                        {
                            for (int i = 1; i < deviceRepairs.Count; i++)
                            {
                                var timeDiff = (deviceRepairs[i].StartDate!.Value - deviceRepairs[i - 1].EndDate!.Value).TotalDays;
                                if (timeDiff > 0)
                                {
                                    timeBetweenFailures.Add(timeDiff);
                                }
                            }
                        }
                        mtbf = timeBetweenFailures.Any() ? timeBetweenFailures.Average() : 0;
                    }

                    return new RepairMetricsDto
                    {
                        Category = g.Key!,
                        MTTR = Math.Round(mttr, 2),
                        MTBF = Math.Round(mtbf, 2)
                    };
                })
                .Where(m => m.MTTR > 0 || m.MTBF > 0)
                .ToList();

            return new
            {
                devicesByDepartment = devicesByDept,
                devicesByStatus = devicesByStatus,
                incidentTrend = monthlyIncidents,
                repairMetrics = repairMetrics
            };
        }

        public async Task<object> GetAdminTablesAsync()
        {
            var recentIncidents = await _context.IncidentReports
                .Include(i => i.Device)
                .Include(i => i.ReportedByUser)
                .OrderByDescending(i => i.ReportDate)
                .Take(10)
                .Select(i => new RecentIncidentDto
                {
                    Id = i.Id,
                    DeviceCode = i.Device!.DeviceCode ?? string.Empty,
                    DeviceName = i.Device.DeviceName ?? string.Empty,
                    ReportedBy = i.ReportedByUser!.FullName ?? string.Empty,
                    ReportDate = i.ReportDate ?? DateTime.UtcNow,
                    Status = i.Status,
                    Description = i.Description ?? string.Empty,
                    ReportType = i.ReportType ?? string.Empty
                })
                .ToListAsync();

            var activeRepairs = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.AssignedToTechnician)
                .Where(r => r.Status == 0 || r.Status == 1)
                .Select(r => new ActiveRepairDto
                {
                    Id = r.Id,
                    DeviceCode = r.Device!.DeviceCode ?? string.Empty,
                    DeviceName = r.Device.DeviceName ?? string.Empty,
                    TechnicianName = r.AssignedToTechnician != null ? r.AssignedToTechnician.FullName ?? "Unassigned" : "Unassigned",
                    SLARemaining = CalculateSLARemaining(r.StartDate, r.Status),
                    Status = r.Status,
                    StartDate = r.StartDate
                })
                .ToListAsync();

            // Risk Devices - Devices with high incident count
            var riskDevices = await _context.Devices
                .Include(d => d.IncidentReports)
                .Where(d => d.IsDeleted != true)
                .Select(d => new
                {
                    Device = d,
                    IncidentCount = d.IncidentReports.Count
                })
                .Where(x => x.IncidentCount >= 3) // Devices with 3+ incidents
                .OrderByDescending(x => x.IncidentCount)
                .Take(10)
                .Select(x => new RiskDeviceDto
                {
                    Id = x.Device.Id,
                    DeviceName = x.Device.DeviceName ?? string.Empty,
                    DeviceCode = x.Device.DeviceCode ?? string.Empty,
                    IncidentCount = x.IncidentCount,
                    Age = CalculateDeviceAge(x.Device.PurchaseDate),
                    Recommendation = GetRiskRecommendation(x.IncidentCount, x.Device.PurchaseDate)
                })
                .ToListAsync();

            // Replacement History
            var replacementHistory = await _context.Replacements
                .Include(r => r.OldDevice)
                .Include(r => r.NewDevice)
                .OrderByDescending(r => r.ReplacementDate)
                .Take(20)
                .Select(r => new ReplacementHistoryDto
                {
                    Id = r.Id,
                    DeviceName = r.NewDevice != null ? r.NewDevice.DeviceName ?? string.Empty : string.Empty,
                    DeviceCode = r.NewDevice != null ? r.NewDevice.DeviceCode ?? string.Empty : string.Empty,
                    ReplacedDeviceName = r.OldDevice != null ? r.OldDevice.DeviceName ?? string.Empty : string.Empty,
                    ReplacedDeviceCode = r.OldDevice != null ? r.OldDevice.DeviceCode ?? string.Empty : string.Empty,
                    ReplacementDate = r.ReplacementDate ?? DateTime.UtcNow,
                    Reason = r.Reason ?? string.Empty
                })
                .ToListAsync();

            return new
            {
                recentIncidents,
                activeRepairs,
                riskDevices,
                replacementHistory
            };
        }

        private static string CalculateSLARemaining(DateTime? startDate, int status)
        {
            if (!startDate.HasValue || status == 3) return "N/A";
            var elapsed = DateTime.UtcNow - startDate.Value;
            var remaining = TimeSpan.FromDays(7) - elapsed; // Assuming 7-day SLA
            if (remaining.TotalDays < 0) return "Overdue";
            return $"{remaining.Days}d {remaining.Hours}h";
        }

        private static string CalculateDeviceAge(DateTime? purchaseDate)
        {
            if (!purchaseDate.HasValue) return "Unknown";
            var age = DateTime.UtcNow - purchaseDate.Value;
            var years = (int)(age.TotalDays / 365);
            var months = (int)((age.TotalDays % 365) / 30);
            if (years > 0)
                return $"{years} year{(years > 1 ? "s" : "")}";
            return $"{months} month{(months > 1 ? "s" : "")}";
        }

        private static string GetRiskRecommendation(int incidentCount, DateTime? purchaseDate)
        {
            var age = purchaseDate.HasValue ? (DateTime.UtcNow - purchaseDate.Value).TotalDays / 365 : 0;
            
            if (incidentCount >= 5 || age > 5)
                return "Replace";
            if (incidentCount >= 3 || age > 3)
                return "Maintain";
            return "Monitor";
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

            var deptRepairs = await _context.Repairs
                .Include(r => r.Device)
                .Where(r => r.Device!.CurrentDepartmentId == departmentId && (r.Status == 0 || r.Status == 1))
                .ToListAsync();

            return new ManagerStatsDto
            {
                DepartmentDevices = deptDevices.Count,
                DevicesInUse = deptDevices.Count(d => d.Status == "Đang sử dụng"),
                DevicesRepairing = deptDevices.Count(d => d.Status == "Đang sửa"),
                OpenIncidents = deptIncidents.Count(i => i.Status == 0 || i.Status == 1),
                AvailableDevices = deptDevices.Count(d => d.Status == "Chưa cấp phát" || d.Status == "Sẵn sàng"),
                OngoingRepairs = deptRepairs.Count
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

            // Department Incidents Trend - Last 6 months
            var now = DateTime.UtcNow;
            var sixMonthsAgo = now.AddMonths(-6);
            var deptIncidents = await _context.IncidentReports
                .Include(i => i.Device)
                .Where(i => i.Device!.CurrentDepartmentId == departmentId && i.ReportDate >= sixMonthsAgo)
                .ToListAsync();

            var monthlyIncidents = deptIncidents
                .Where(i => i.ReportDate.HasValue)
                .GroupBy(i => new { Year = i.ReportDate!.Value.Year, Month = i.ReportDate!.Value.Month })
                .Select(g => new DepartmentIncidentsTrendDto
                {
                    Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                    Count = g.Count()
                })
                .OrderBy(x => x.Period)
                .ToList();

            return new
            {
                devicesByStatus,
                departmentIncidentsTrend = monthlyIncidents
            };
        }

        public async Task<TechnicianStatsDto> GetTechnicianStatsAsync(Guid technicianId)
        {
            var myRepairs = await _context.Repairs
                .Where(r => r.AssignedToTechnicianId == technicianId)
                .ToListAsync();

            var now = DateTime.UtcNow;
            var startOfWeek = now.AddDays(-(int)now.DayOfWeek);

            // Calculate average repair time for completed repairs
            var completedRepairs = myRepairs
                .Where(r => r.Status == 3 && r.StartDate.HasValue && r.EndDate.HasValue)
                .ToList();

            var avgRepairTimeHours = 0.0;
            if (completedRepairs.Any())
            {
                var totalHours = completedRepairs
                    .Sum(r => (r.EndDate!.Value - r.StartDate!.Value).TotalHours);
                avgRepairTimeHours = totalHours / completedRepairs.Count;
            }

            var avgRepairTimeStr = avgRepairTimeHours > 0 
                ? $"{Math.Round(avgRepairTimeHours, 1)}h" 
                : "N/A";

            return new TechnicianStatsDto
            {
                RepairsPending = myRepairs.Count(r => r.Status == 0), // ChoThucHien
                RepairsInProgress = myRepairs.Count(r => r.Status == 1), // DangSua
                RepairsAwaitingApproval = myRepairs.Count(r => r.Status == 2), // ChoDuyetHoanTat
                RepairsCompletedThisWeek = myRepairs.Count(r => r.Status == 3 && r.EndDate >= startOfWeek),
                AvgRepairTime = avgRepairTimeStr
            };
        }

        public async Task<object> GetTechnicianChartsAsync(Guid technicianId)
        {
            var now = DateTime.UtcNow;
            var fourWeeksAgo = now.AddDays(-28);

            // Repair Trend - Last 4 weeks
            var myRepairs = await _context.Repairs
                .Where(r => r.AssignedToTechnicianId == technicianId && r.StartDate >= fourWeeksAgo)
                .ToListAsync();

            var repairTrend = new List<RepairTrendDto>();
            for (int i = 3; i >= 0; i--)
            {
                var weekStart = now.AddDays(-(int)now.DayOfWeek - (i * 7));
                var weekEnd = weekStart.AddDays(7);
                
                var weekRepairs = myRepairs
                    .Where(r => r.StartDate >= weekStart && r.StartDate < weekEnd)
                    .ToList();

                var assigned = weekRepairs.Count;
                var completed = weekRepairs.Count(r => r.Status == 3 && r.EndDate >= weekStart && r.EndDate < weekEnd);

                repairTrend.Add(new RepairTrendDto
                {
                    Week = $"Week {4 - i}",
                    Assigned = assigned,
                    Completed = completed
                });
            }

            // Frequent Devices - Top 5 devices repaired most often
            var allMyRepairs = await _context.Repairs
                .Include(r => r.Device)
                .Where(r => r.AssignedToTechnicianId == technicianId)
                .ToListAsync();

            var frequentDevices = allMyRepairs
                .Where(r => r.Device != null)
                .GroupBy(r => new { r.DeviceId, DeviceName = r.Device!.DeviceName, DeviceCode = r.Device.DeviceCode })
                .Select(g => new FrequentDevicesDto
                {
                    DeviceName = g.Key.DeviceName ?? string.Empty,
                    DeviceCode = g.Key.DeviceCode ?? string.Empty,
                    RepairCount = g.Count()
                })
                .OrderByDescending(d => d.RepairCount)
                .Take(5)
                .ToList();

            return new
            {
                repairTrend,
                frequentDevices
            };
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

            // My Incidents Trend - Last 6 months
            var now = DateTime.UtcNow;
            var sixMonthsAgo = now.AddMonths(-6);
            var myIncidents = await _context.IncidentReports
                .Where(i => i.ReportedByUserId == userId && i.ReportDate >= sixMonthsAgo)
                .ToListAsync();

            var monthlyIncidents = myIncidents
                .Where(i => i.ReportDate.HasValue)
                .GroupBy(i => new { Year = i.ReportDate!.Value.Year, Month = i.ReportDate!.Value.Month })
                .Select(g => new IncidentTrendDto
                {
                    Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                    Count = g.Count()
                })
                .OrderBy(x => x.Period)
                .ToList();

            return new
            {
                devicesByStatus,
                myIncidentsTrend = monthlyIncidents
            };
        }

        public async Task<object> GetManagerTablesAsync(Guid departmentId)
        {
            // Department Devices Table
            var departmentDevices = await _context.Devices
                .Include(d => d.CurrentUser)
                .Where(d => d.CurrentDepartmentId == departmentId && d.IsDeleted != true)
                .Select(d => new DepartmentDeviceDto
                {
                    Id = d.Id,
                    DeviceCode = d.DeviceCode ?? string.Empty,
                    DeviceName = d.DeviceName ?? string.Empty,
                    Status = d.Status ?? string.Empty,
                    AssignedTo = d.CurrentUser != null ? d.CurrentUser.FullName ?? string.Empty : "Unassigned",
                    WarrantyExpiry = d.WarrantyExpiry
                })
                .ToListAsync();

            // Department Incidents Table
            var departmentIncidents = await _context.IncidentReports
                .Include(i => i.Device)
                .Include(i => i.ReportedByUser)
                .Where(i => i.Device!.CurrentDepartmentId == departmentId)
                .OrderByDescending(i => i.ReportDate)
                .Take(20)
                .Select(i => new DepartmentIncidentDto
                {
                    Id = i.Id,
                    DeviceCode = i.Device!.DeviceCode ?? string.Empty,
                    DeviceName = i.Device.DeviceName ?? string.Empty,
                    ReportedBy = i.ReportedByUser!.FullName ?? string.Empty,
                    ReportDate = i.ReportDate ?? DateTime.UtcNow,
                    Status = i.Status,
                    ReportType = i.ReportType ?? string.Empty
                })
                .ToListAsync();

            // Department Repairs Table
            var departmentRepairs = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.AssignedToTechnician)
                .Where(r => r.Device!.CurrentDepartmentId == departmentId)
                .OrderByDescending(r => r.StartDate ?? r.RepairDate)
                .Take(20)
                .Select(r => new DepartmentRepairDto
                {
                    Id = r.Id,
                    DeviceCode = r.Device!.DeviceCode ?? string.Empty,
                    DeviceName = r.Device.DeviceName ?? string.Empty,
                    TechnicianName = r.AssignedToTechnician != null ? r.AssignedToTechnician.FullName ?? "Unassigned" : "Unassigned",
                    Status = r.Status,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate
                })
                .ToListAsync();

            return new
            {
                departmentDevices,
                departmentIncidents,
                departmentRepairs
            };
        }

        public async Task<object> GetTechnicianTablesAsync(Guid technicianId)
        {
            var now = DateTime.UtcNow;

            // Work Queue - Repairs assigned to this technician that are not yet completed (status 0, 1, 2)
            // Materialize query first to avoid EF translation issues with helper methods
            var workQueueRaw = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.IncidentReport)
                .Where(r => r.AssignedToTechnicianId == technicianId && (r.Status == 0 || r.Status == 1 || r.Status == 2)) // ChoThucHien, DangSua, ChoDuyetHoanTat
                .ToListAsync();

            // Map and sort in memory
            var workQueue = workQueueRaw
                .OrderByDescending(r => GetPriorityValue(r.IncidentReport != null ? r.IncidentReport.ReportType : string.Empty))
                .ThenBy(r => r.RepairDate ?? r.StartDate ?? DateTime.MaxValue)
                .Take(20)
                .Select(r => new WorkQueueDto
                {
                    Id = r.Id,
                    DeviceName = r.Device?.DeviceName ?? string.Empty,
                    DeviceCode = r.Device?.DeviceCode ?? string.Empty,
                    Priority = GetPriorityLabel(r.IncidentReport != null ? r.IncidentReport.ReportType : string.Empty),
                    SLA = CalculateSLAForWorkQueue(r.RepairDate ?? r.StartDate),
                    CreatedDate = r.RepairDate ?? r.StartDate ?? DateTime.UtcNow,
                    Status = r.Status
                })
                .ToList();

            // Repair History - Completed repairs by this technician
            var repairHistory = await _context.Repairs
                .Include(r => r.Device)
                .Where(r => r.AssignedToTechnicianId == technicianId && r.Status == 3) // DaHoanTat
                .OrderByDescending(r => r.EndDate ?? r.StartDate)
                .Take(20)
                .Select(r => new RepairHistoryDto
                {
                    Id = r.Id,
                    DeviceCode = r.Device!.DeviceCode ?? string.Empty,
                    DeviceName = r.Device.DeviceName ?? string.Empty,
                    Status = r.Status,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    Cost = r.Cost.HasValue ? (double)r.Cost.Value : null,
                    Description = r.Description ?? string.Empty
                })
                .ToListAsync();

            return new
            {
                workQueue,
                repairHistory
            };
        }

        public async Task<object> GetEmployeeTablesAsync(Guid userId)
        {
            // My Devices Table
            var myDevices = await _context.Devices
                .Include(d => d.CurrentDepartment)
                .Where(d => d.CurrentUserId == userId && d.IsDeleted != true)
                .Select(d => new MyDeviceDto
                {
                    Id = d.Id,
                    DeviceCode = d.DeviceCode ?? string.Empty,
                    DeviceName = d.DeviceName ?? string.Empty,
                    Status = d.Status ?? string.Empty,
                    WarrantyExpiry = d.WarrantyExpiry,
                    DepartmentName = d.CurrentDepartment != null ? d.CurrentDepartment.DepartmentName ?? string.Empty : string.Empty
                })
                .ToListAsync();

            // My Incidents Table
            var myIncidents = await _context.IncidentReports
                .Include(i => i.Device)
                .Where(i => i.ReportedByUserId == userId)
                .OrderByDescending(i => i.ReportDate)
                .Take(20)
                .Select(i => new MyIncidentDto
                {
                    Id = i.Id,
                    DeviceCode = i.Device!.DeviceCode ?? string.Empty,
                    DeviceName = i.Device.DeviceName ?? string.Empty,
                    ReportDate = i.ReportDate ?? DateTime.UtcNow,
                    Status = i.Status,
                    ReportType = i.ReportType ?? string.Empty,
                    Description = i.Description ?? string.Empty
                })
                .ToListAsync();

            return new
            {
                myDevices,
                myIncidents
            };
        }

        private static int GetPriorityValue(string reportType)
        {
            if (string.IsNullOrEmpty(reportType)) return 0;
            var typeLower = reportType.ToLower();
            if (typeLower.Contains("mất mát") || typeLower.Contains("mat mat")) return 4; // Critical
            if (typeLower.Contains("hỏng hóc phần cứng") || typeLower.Contains("hong hoc phan cung")) return 3; // High
            if (typeLower.Contains("hư hỏng vật lý") || typeLower.Contains("hu hong vat ly")) return 2; // Medium
            if (typeLower.Contains("lỗi phần mềm") || typeLower.Contains("loi phan mem")) return 1; // Low
            return 0; // Unknown/Minor
        }

        private static string GetPriorityLabel(string reportType)
        {
            var priority = GetPriorityValue(reportType);
            return priority switch
            {
                4 => "critical",
                3 => "high",
                2 => "medium",
                1 => "low",
                _ => "low"
            };
        }

        private static string CalculateSLAForWorkQueue(DateTime? createdDate)
        {
            if (!createdDate.HasValue) return "N/A";
            var elapsed = DateTime.UtcNow - createdDate.Value;
            var remaining = TimeSpan.FromDays(7) - elapsed; // Assuming 7-day SLA
            if (remaining.TotalDays < 0) return "Overdue";
            return $"{remaining.Days}d";
        }
    }
}

