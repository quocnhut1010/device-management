using AutoMapper;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend.Services.Implementations
{
    public class ReportExportService : IReportExportService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IMapper _mapper;

        public ReportExportService(DeviceManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public async Task<byte[]> ExportDevicesAsync(ExportRequestDto request)
        {
            var devices = await GetDevicesDataAsync(request);
            
            if (request.Format.ToLower() == "excel")
                return await ExportDevicesToExcelAsync(devices);
            else
                return await ExportDevicesToPdfAsync(devices);
        }

        public async Task<byte[]> ExportRepairsAsync(ExportRequestDto request)
        {
            var repairs = await GetRepairsDataAsync(request);
            
            if (request.Format.ToLower() == "excel")
                return await ExportRepairsToExcelAsync(repairs);
            else
                return await ExportRepairsToPdfAsync(repairs);
        }

        public async Task<byte[]> ExportIncidentsAsync(ExportRequestDto request)
        {
            var incidents = await GetIncidentsDataAsync(request);
            
            if (request.Format.ToLower() == "excel")
                return await ExportIncidentsToExcelAsync(incidents);
            else
                return await ExportIncidentsToPdfAsync(incidents);
        }

        public async Task<byte[]> ExportLiquidationsAsync(ExportRequestDto request)
        {
            var liquidations = await GetLiquidationsDataAsync(request);
            
            if (request.Format.ToLower() == "excel")
                return await ExportLiquidationsToExcelAsync(liquidations);
            else
                return await ExportLiquidationsToPdfAsync(liquidations);
        }

        public async Task<ReportExportDto> SaveExportHistoryAsync(string reportType, string format, Guid userId, string? fileUrl)
        {
            var reportExport = new ReportExport
            {
                Id = Guid.NewGuid(),
                ReportType = reportType,
                ExportDate = DateTime.UtcNow,
                ExportedBy = userId,
                FileUrl = fileUrl
            };

            _context.ReportExports.Add(reportExport);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            return new ReportExportDto
            {
                Id = reportExport.Id,
                ReportType = reportExport.ReportType,
                ExportDate = reportExport.ExportDate ?? DateTime.UtcNow,
                ExportedByName = user?.FullName ?? "Unknown",
                FileUrl = reportExport.FileUrl
            };
        }

        public async Task<IEnumerable<ReportExportDto>> GetExportHistoryAsync()
        {
            var exports = await _context.ReportExports
                .Include(r => r.ExportedByNavigation)
                .OrderByDescending(r => r.ExportDate)
                .ToListAsync();

            return exports.Select(e => new ReportExportDto
            {
                Id = e.Id,
                ReportType = e.ReportType,
                ExportDate = e.ExportDate ?? DateTime.UtcNow,
                ExportedByName = e.ExportedByNavigation?.FullName ?? "Unknown",
                FileUrl = e.FileUrl
            });
        }

        #region Data Retrieval Methods

        private async Task<IEnumerable<Device>> GetDevicesDataAsync(ExportRequestDto request)
        {
            var query = _context.Devices
                .Include(d => d.Model)
                .Include(d => d.Supplier)
                .Include(d => d.CurrentDepartment)
                .Include(d => d.CurrentUser)
                .Where(d => d.IsDeleted != true);

            // Apply date filters
            if (request.FromDate.HasValue)
                query = query.Where(d => d.CreatedAt >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(d => d.CreatedAt <= request.ToDate.Value);

            // Apply custom filters
            if (request.Filters != null && request.Filters.Count > 0)
            {
                // Status (exact match)
                if (request.Filters.TryGetValue("status", out var status) && !string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(d => d.Status == status);
                }

                // Model
                if (request.Filters.TryGetValue("modelId", out var modelIdRaw) &&
                    Guid.TryParse(modelIdRaw, out var modelId))
                {
                    query = query.Where(d => d.ModelId == modelId);
                }

                // Department by Id
                if (request.Filters.TryGetValue("departmentId", out var departmentIdRaw) &&
                    Guid.TryParse(departmentIdRaw, out var departmentId))
                {
                    query = query.Where(d => d.CurrentDepartmentId == departmentId);
                }

                // Department by Name (contains, case-insensitive)
                if (request.Filters.TryGetValue("departmentName", out var departmentName) &&
                    !string.IsNullOrWhiteSpace(departmentName))
                {
                    var deptNameLower = departmentName.Trim().ToLower();
                    query = query.Where(d =>
                        d.CurrentDepartment != null &&
                        d.CurrentDepartment.DepartmentName != null &&
                        d.CurrentDepartment.DepartmentName.ToLower().Contains(deptNameLower));
                }

                // Supplier by Name
                if (request.Filters.TryGetValue("supplierName", out var supplierName) &&
                    !string.IsNullOrWhiteSpace(supplierName))
                {
                    var supplierLower = supplierName.Trim().ToLower();
                    query = query.Where(d =>
                        d.Supplier != null &&
                        d.Supplier.SupplierName != null &&
                        d.Supplier.SupplierName.ToLower().Contains(supplierLower));
                }
            }

            return await query.ToListAsync();
        }

        private async Task<IEnumerable<Repair>> GetRepairsDataAsync(ExportRequestDto request)
        {
            var query = _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.IncidentReport)
                .Include(r => r.AssignedToTechnician)
                .Include(r => r.RepairImages)
                .AsQueryable();

            // Apply date filters
            if (request.FromDate.HasValue)
                query = query.Where(r => r.StartDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(r => r.StartDate <= request.ToDate.Value);

            // Apply custom filters
            if (request.Filters != null && request.Filters.Count > 0)
            {
                // Status (enum as string)
                if (request.Filters.TryGetValue("status", out var status) && !string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(r => r.Status.ToString() == status);
                }

                // Technician
                if (request.Filters.TryGetValue("technicianId", out var technicianIdRaw) &&
                    Guid.TryParse(technicianIdRaw, out var technicianId))
                {
                    query = query.Where(r => r.AssignedToTechnicianId == technicianId);
                }

                // Department by name via device
                if (request.Filters.TryGetValue("departmentName", out var departmentName) &&
                    !string.IsNullOrWhiteSpace(departmentName))
                {
                    var deptNameLower = departmentName.Trim().ToLower();
                    query = query.Where(r =>
                        r.Device != null &&
                        r.Device.CurrentDepartment != null &&
                        r.Device.CurrentDepartment.DepartmentName != null &&
                        r.Device.CurrentDepartment.DepartmentName.ToLower().Contains(deptNameLower));
                }

                // Supplier by name via device
                if (request.Filters.TryGetValue("supplierName", out var supplierName) &&
                    !string.IsNullOrWhiteSpace(supplierName))
                {
                    var supplierLower = supplierName.Trim().ToLower();
                    query = query.Where(r =>
                        r.Device != null &&
                        r.Device.Supplier != null &&
                        r.Device.Supplier.SupplierName != null &&
                        r.Device.Supplier.SupplierName.ToLower().Contains(supplierLower));
                }
            }

            return await query.ToListAsync();
        }

        private async Task<IEnumerable<IncidentReport>> GetIncidentsDataAsync(ExportRequestDto request)
        {
            var query = _context.IncidentReports
                .Include(i => i.Device)
                .Include(i => i.ReportedByUser)
                .AsQueryable();

            // Apply date filters
            if (request.FromDate.HasValue)
                query = query.Where(i => i.ReportDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(i => i.ReportDate <= request.ToDate.Value);

            // Apply custom filters
            if (request.Filters != null && request.Filters.Count > 0)
            {
                // Status (enum as string)
                if (request.Filters.TryGetValue("status", out var status) && !string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(i => i.Status.ToString() == status);
                }

                // Report type
                if (request.Filters.TryGetValue("reportType", out var reportType) &&
                    !string.IsNullOrWhiteSpace(reportType))
                {
                    query = query.Where(i => i.ReportType == reportType);
                }

                // Department by name via device
                if (request.Filters.TryGetValue("departmentName", out var departmentName) &&
                    !string.IsNullOrWhiteSpace(departmentName))
                {
                    var deptNameLower = departmentName.Trim().ToLower();
                    query = query.Where(i =>
                        i.Device != null &&
                        i.Device.CurrentDepartment != null &&
                        i.Device.CurrentDepartment.DepartmentName != null &&
                        i.Device.CurrentDepartment.DepartmentName.ToLower().Contains(deptNameLower));
                }

                // Supplier by name via device
                if (request.Filters.TryGetValue("supplierName", out var supplierName) &&
                    !string.IsNullOrWhiteSpace(supplierName))
                {
                    var supplierLower = supplierName.Trim().ToLower();
                    query = query.Where(i =>
                        i.Device != null &&
                        i.Device.Supplier != null &&
                        i.Device.Supplier.SupplierName != null &&
                        i.Device.Supplier.SupplierName.ToLower().Contains(supplierLower));
                }

                // Reporter by name (case-insensitive, contains match)
                if (request.Filters.TryGetValue("reporterName", out var reporterName) &&
                    !string.IsNullOrWhiteSpace(reporterName))
                {
                    var reporterNameLower = reporterName.Trim().ToLower();
                    query = query.Where(i =>
                        i.ReportedByUser != null &&
                        i.ReportedByUser.FullName != null &&
                        i.ReportedByUser.FullName.ToLower().Contains(reporterNameLower));
                }
            }

            return await query.ToListAsync();
        }

        private async Task<IEnumerable<Liquidation>> GetLiquidationsDataAsync(ExportRequestDto request)
        {
            var query = _context.Liquidations
                .Include(l => l.Device)
                .ThenInclude(d => d.CurrentDepartment)
                .Include(l => l.Device)
                .ThenInclude(d => d.Supplier)
                .Include(l => l.ApprovedByNavigation)
                .AsQueryable();

            // Apply date filters
            if (request.FromDate.HasValue)
                query = query.Where(l => l.LiquidationDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(l => l.LiquidationDate <= request.ToDate.Value);

            // Apply custom filters via related device
            if (request.Filters != null && request.Filters.Count > 0)
            {
                if (request.Filters.TryGetValue("departmentName", out var departmentName) &&
                    !string.IsNullOrWhiteSpace(departmentName))
                {
                    var deptNameLower = departmentName.Trim().ToLower();
                    query = query.Where(l =>
                        l.Device != null &&
                        l.Device.CurrentDepartment != null &&
                        l.Device.CurrentDepartment.DepartmentName != null &&
                        l.Device.CurrentDepartment.DepartmentName.ToLower().Contains(deptNameLower));
                }

                if (request.Filters.TryGetValue("supplierName", out var supplierName) &&
                    !string.IsNullOrWhiteSpace(supplierName))
                {
                    var supplierLower = supplierName.Trim().ToLower();
                    query = query.Where(l =>
                        l.Device != null &&
                        l.Device.Supplier != null &&
                        l.Device.Supplier.SupplierName != null &&
                        l.Device.Supplier.SupplierName.ToLower().Contains(supplierLower));
                }
            }

            return await query.ToListAsync();
        }

        #endregion

        #region Count Methods

        public async Task<int> GetDevicesCountAsync(ExportRequestDto request)
        {
            var query = _context.Devices
                .Where(d => d.IsDeleted != true);

            // Apply date filters
            if (request.FromDate.HasValue)
                query = query.Where(d => d.CreatedAt >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(d => d.CreatedAt <= request.ToDate.Value);

            // Apply custom filters
            if (request.Filters != null && request.Filters.Count > 0)
            {
                // Status (exact match)
                if (request.Filters.TryGetValue("status", out var status) && !string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(d => d.Status == status);
                }

                // Model
                if (request.Filters.TryGetValue("modelId", out var modelIdRaw) &&
                    Guid.TryParse(modelIdRaw, out var modelId))
                {
                    query = query.Where(d => d.ModelId == modelId);
                }

                // Department by Id
                if (request.Filters.TryGetValue("departmentId", out var departmentIdRaw) &&
                    Guid.TryParse(departmentIdRaw, out var departmentId))
                {
                    query = query.Where(d => d.CurrentDepartmentId == departmentId);
                }

                // Department by Name (contains, case-insensitive)
                if (request.Filters.TryGetValue("departmentName", out var departmentName) &&
                    !string.IsNullOrWhiteSpace(departmentName))
                {
                    var deptNameLower = departmentName.Trim().ToLower();
                    query = query.Where(d =>
                        d.CurrentDepartment != null &&
                        d.CurrentDepartment.DepartmentName != null &&
                        d.CurrentDepartment.DepartmentName.ToLower().Contains(deptNameLower));
                }

                // Supplier by Name
                if (request.Filters.TryGetValue("supplierName", out var supplierName) &&
                    !string.IsNullOrWhiteSpace(supplierName))
                {
                    var supplierLower = supplierName.Trim().ToLower();
                    query = query.Where(d =>
                        d.Supplier != null &&
                        d.Supplier.SupplierName != null &&
                        d.Supplier.SupplierName.ToLower().Contains(supplierLower));
                }
            }

            return await query.CountAsync();
        }

        public async Task<int> GetIncidentsCountAsync(ExportRequestDto request)
        {
            var query = _context.IncidentReports.AsQueryable();

            // Apply date filters
            if (request.FromDate.HasValue)
                query = query.Where(i => i.ReportDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(i => i.ReportDate <= request.ToDate.Value);

            // Apply custom filters
            if (request.Filters != null && request.Filters.Count > 0)
            {
                // Status (enum as string)
                if (request.Filters.TryGetValue("status", out var status) && !string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(i => i.Status.ToString() == status);
                }

                // Report type
                if (request.Filters.TryGetValue("reportType", out var reportType) &&
                    !string.IsNullOrWhiteSpace(reportType))
                {
                    query = query.Where(i => i.ReportType == reportType);
                }

                // Department by name via device
                if (request.Filters.TryGetValue("departmentName", out var departmentName) &&
                    !string.IsNullOrWhiteSpace(departmentName))
                {
                    var deptNameLower = departmentName.Trim().ToLower();
                    query = query.Where(i =>
                        i.Device != null &&
                        i.Device.CurrentDepartment != null &&
                        i.Device.CurrentDepartment.DepartmentName != null &&
                        i.Device.CurrentDepartment.DepartmentName.ToLower().Contains(deptNameLower));
                }

                // Supplier by name via device
                if (request.Filters.TryGetValue("supplierName", out var supplierName) &&
                    !string.IsNullOrWhiteSpace(supplierName))
                {
                    var supplierLower = supplierName.Trim().ToLower();
                    query = query.Where(i =>
                        i.Device != null &&
                        i.Device.Supplier != null &&
                        i.Device.Supplier.SupplierName != null &&
                        i.Device.Supplier.SupplierName.ToLower().Contains(supplierLower));
                }

                // Reporter by name (case-insensitive, contains match)
                if (request.Filters.TryGetValue("reporterName", out var reporterName) &&
                    !string.IsNullOrWhiteSpace(reporterName))
                {
                    var reporterNameLower = reporterName.Trim().ToLower();
                    query = query.Where(i =>
                        i.ReportedByUser != null &&
                        i.ReportedByUser.FullName != null &&
                        i.ReportedByUser.FullName.ToLower().Contains(reporterNameLower));
                }
            }

            return await query.CountAsync();
        }

        public async Task<int> GetRepairsCountAsync(ExportRequestDto request)
        {
            var query = _context.Repairs.AsQueryable();

            // Apply date filters
            if (request.FromDate.HasValue)
                query = query.Where(r => r.StartDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(r => r.StartDate <= request.ToDate.Value);

            // Apply custom filters
            if (request.Filters != null && request.Filters.Count > 0)
            {
                // Status (enum as string)
                if (request.Filters.TryGetValue("status", out var status) && !string.IsNullOrWhiteSpace(status))
                {
                    query = query.Where(r => r.Status.ToString() == status);
                }

                // Technician
                if (request.Filters.TryGetValue("technicianId", out var technicianIdRaw) &&
                    Guid.TryParse(technicianIdRaw, out var technicianId))
                {
                    query = query.Where(r => r.AssignedToTechnicianId == technicianId);
                }

                // Department by name via device
                if (request.Filters.TryGetValue("departmentName", out var departmentName) &&
                    !string.IsNullOrWhiteSpace(departmentName))
                {
                    var deptNameLower = departmentName.Trim().ToLower();
                    query = query.Where(r =>
                        r.Device != null &&
                        r.Device.CurrentDepartment != null &&
                        r.Device.CurrentDepartment.DepartmentName != null &&
                        r.Device.CurrentDepartment.DepartmentName.ToLower().Contains(deptNameLower));
                }

                // Supplier by name via device
                if (request.Filters.TryGetValue("supplierName", out var supplierName) &&
                    !string.IsNullOrWhiteSpace(supplierName))
                {
                    var supplierLower = supplierName.Trim().ToLower();
                    query = query.Where(r =>
                        r.Device != null &&
                        r.Device.Supplier != null &&
                        r.Device.Supplier.SupplierName != null &&
                        r.Device.Supplier.SupplierName.ToLower().Contains(supplierLower));
                }
            }

            return await query.CountAsync();
        }

        public async Task<int> GetLiquidationsCountAsync(ExportRequestDto request)
        {
            var query = _context.Liquidations.AsQueryable();

            // Apply date filters
            if (request.FromDate.HasValue)
                query = query.Where(l => l.LiquidationDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(l => l.LiquidationDate <= request.ToDate.Value);

            // Apply custom filters via related device
            if (request.Filters != null && request.Filters.Count > 0)
            {
                if (request.Filters.TryGetValue("departmentName", out var departmentName) &&
                    !string.IsNullOrWhiteSpace(departmentName))
                {
                    var deptNameLower = departmentName.Trim().ToLower();
                    query = query.Where(l =>
                        l.Device != null &&
                        l.Device.CurrentDepartment != null &&
                        l.Device.CurrentDepartment.DepartmentName != null &&
                        l.Device.CurrentDepartment.DepartmentName.ToLower().Contains(deptNameLower));
                }

                if (request.Filters.TryGetValue("supplierName", out var supplierName) &&
                    !string.IsNullOrWhiteSpace(supplierName))
                {
                    var supplierLower = supplierName.Trim().ToLower();
                    query = query.Where(l =>
                        l.Device != null &&
                        l.Device.Supplier != null &&
                        l.Device.Supplier.SupplierName != null &&
                        l.Device.Supplier.SupplierName.ToLower().Contains(supplierLower));
                }
            }

            return await query.CountAsync();
        }

        #endregion

        #region Excel Export Methods

        private async Task<byte[]> ExportDevicesToExcelAsync(IEnumerable<Device> devices)
        {
            var deviceList = devices.ToList();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Thiết bị");

            // Headers
            var headers = new[] { "Mã thiết bị", "Tên thiết bị", "Model", "Nhà cung cấp", "Trạng thái", "Phòng ban", "Người sử dụng", "Ngày mua", "Giá mua", "Bảo hành đến" };
            
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cell(1, i + 1).Value = headers[i];
                worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightBlue;
            }

            // Data
            int row = 2;
            if (deviceList.Count == 0)
            {
                worksheet.Cell(row, 1).Value = "Không có bản ghi nào phù hợp với điều kiện lọc.";
            }
            else
            {
                foreach (var device in deviceList)
                {
                    worksheet.Cell(row, 1).Value = device.DeviceCode;
                    worksheet.Cell(row, 2).Value = device.DeviceName;
                    worksheet.Cell(row, 3).Value = device.Model?.ModelName;
                    worksheet.Cell(row, 4).Value = device.Supplier?.SupplierName;
                    worksheet.Cell(row, 5).Value = device.Status;
                    worksheet.Cell(row, 6).Value = device.CurrentDepartment?.DepartmentName;
                    worksheet.Cell(row, 7).Value = device.CurrentUser?.FullName;
                    worksheet.Cell(row, 8).Value = device.PurchaseDate?.ToString("dd/MM/yyyy");
                    worksheet.Cell(row, 9).Value = device.PurchasePrice;
                    worksheet.Cell(row, 10).Value = device.WarrantyExpiry?.ToString("dd/MM/yyyy");
                    row++;
                }
            }

            worksheet.Columns().AdjustToContents();
            
            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private async Task<byte[]> ExportRepairsToExcelAsync(IEnumerable<Repair> repairs)
        {
            var repairList = repairs.ToList();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Sửa chữa");

            var headers = new[] { "Mã thiết bị", "Tên thiết bị", "Trạng thái", "Kỹ thuật viên", "Ngày bắt đầu", "Ngày kết thúc", "Chi phí", "Công ty sửa chữa", "Ghi chú" };
            
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cell(1, i + 1).Value = headers[i];
                worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightGreen;
            }

            int row = 2;
            if (repairList.Count == 0)
            {
                worksheet.Cell(row, 1).Value = "Không có bản ghi nào phù hợp với điều kiện lọc.";
            }
            else
            {
                foreach (var repair in repairList)
                {
                    worksheet.Cell(row, 1).Value = repair.Device?.DeviceCode;
                    worksheet.Cell(row, 2).Value = repair.Device?.DeviceName;
                    worksheet.Cell(row, 3).Value = repair.Status;
                    worksheet.Cell(row, 4).Value = repair.AssignedToTechnician?.FullName;
                    worksheet.Cell(row, 5).Value = repair.StartDate?.ToString("dd/MM/yyyy HH:mm");
                    worksheet.Cell(row, 6).Value = repair.EndDate?.ToString("dd/MM/yyyy HH:mm");
                    worksheet.Cell(row, 7).Value = repair.Cost;
                    worksheet.Cell(row, 8).Value = repair.RepairCompany;
                    worksheet.Cell(row, 9).Value = repair.Description;
                    row++;
                }
            }

            worksheet.Columns().AdjustToContents();
            
            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private async Task<byte[]> ExportIncidentsToExcelAsync(IEnumerable<IncidentReport> incidents)
        {
            var incidentList = incidents.ToList();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Báo cáo sự cố");

            var headers = new[] { "Mã thiết bị", "Tên thiết bị", "Loại báo cáo", "Trạng thái", "Người báo cáo", "Ngày báo cáo", "Mô tả", "Lý do từ chối" };
            
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cell(1, i + 1).Value = headers[i];
                worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightYellow;
            }

            int row = 2;
            if (incidentList.Count == 0)
            {
                worksheet.Cell(row, 1).Value = "Không có bản ghi nào phù hợp với điều kiện lọc.";
            }
            else
            {
                foreach (var incident in incidentList)
                {
                    worksheet.Cell(row, 1).Value = incident.Device?.DeviceCode;
                    worksheet.Cell(row, 2).Value = incident.Device?.DeviceName;
                    worksheet.Cell(row, 3).Value = incident.ReportType;
                    worksheet.Cell(row, 4).Value = incident.Status;
                    worksheet.Cell(row, 5).Value = incident.ReportedByUser?.FullName;
                    worksheet.Cell(row, 6).Value = incident.ReportDate?.ToString("dd/MM/yyyy HH:mm") ?? "";
                    worksheet.Cell(row, 7).Value = incident.Description;
                    worksheet.Cell(row, 8).Value = incident.RejectedReason;
                    row++;
                }
            }

            worksheet.Columns().AdjustToContents();
            
            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private async Task<byte[]> ExportLiquidationsToExcelAsync(IEnumerable<Liquidation> liquidations)
        {
            var liquidationList = liquidations.ToList();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Thanh lý");

            var headers = new[] { "Mã thiết bị", "Tên thiết bị", "Ngày thanh lý", "Người duyệt", "Lý do thanh lý" };
            
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cell(1, i + 1).Value = headers[i];
                worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightCoral;
            }

            int row = 2;
            if (liquidationList.Count == 0)
            {
                worksheet.Cell(row, 1).Value = "Không có bản ghi nào phù hợp với điều kiện lọc.";
            }
            else
            {
                foreach (var liquidation in liquidationList)
                {
                    worksheet.Cell(row, 1).Value = liquidation.Device?.DeviceCode;
                    worksheet.Cell(row, 2).Value = liquidation.Device?.DeviceName;
                    worksheet.Cell(row, 3).Value = liquidation.LiquidationDate?.ToString("dd/MM/yyyy");
                    worksheet.Cell(row, 4).Value = liquidation.ApprovedByNavigation?.FullName;
                    worksheet.Cell(row, 5).Value = liquidation.Reason;
                    row++;
                }
            }

            worksheet.Columns().AdjustToContents();
            
            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        #endregion

        #region PDF Export Methods

        private async Task<byte[]> ExportDevicesToPdfAsync(IEnumerable<Device> devices)
        {
            var deviceList = devices.ToList();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header()
                        .Text("BÁO CÁO THIẾT BỊ")
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x =>
                        {
                            x.Spacing(20);

                            if (!deviceList.Any())
                            {
                                x.Item().Text("Không có bản ghi nào phù hợp với điều kiện lọc.")
                                    .FontSize(12);
                            }
                            else
                            {
                                x.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Element(CellStyle).Text("Mã TB").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Tên TB").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Model").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Trạng thái").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Phòng ban").SemiBold();
                                    });

                                    foreach (var device in deviceList.Take(50)) // Limit for PDF
                                    {
                                        table.Cell().Element(CellStyle).Text(device.DeviceCode ?? "");
                                        table.Cell().Element(CellStyle).Text(device.DeviceName ?? "");
                                        table.Cell().Element(CellStyle).Text(device.Model?.ModelName ?? "");
                                        table.Cell().Element(CellStyle).Text(device.Status ?? "");
                                        table.Cell().Element(CellStyle).Text(device.CurrentDepartment?.DepartmentName ?? "");
                                    }
                                });
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Trang ");
                            x.CurrentPageNumber();
                            x.Span(" / ");
                            x.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        private async Task<byte[]> ExportRepairsToPdfAsync(IEnumerable<Repair> repairs)
        {
            var repairList = repairs.ToList();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header()
                        .Text("BÁO CÁO SỬA CHỮA")
                        .SemiBold().FontSize(20).FontColor(Colors.Green.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x =>
                        {
                            x.Spacing(20);

                            if (!repairList.Any())
                            {
                                x.Item().Text("Không có bản ghi nào phù hợp với điều kiện lọc.")
                                    .FontSize(12);
                            }
                            else
                            {
                                x.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Element(CellStyle).Text("Mã TB").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Trạng thái").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Kỹ thuật viên").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Ngày bắt đầu").SemiBold();
                                    });

                                    foreach (var repair in repairList.Take(50))
                                    {
                                        table.Cell().Element(CellStyle).Text(repair.Device?.DeviceCode ?? "");
                                        table.Cell().Element(CellStyle).Text(repair.Status.ToString());
                                        table.Cell().Element(CellStyle).Text(repair.AssignedToTechnician?.FullName ?? "");
                                        table.Cell().Element(CellStyle).Text(repair.StartDate?.ToString("dd/MM/yyyy") ?? "");
                                    }
                                });
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Trang ");
                            x.CurrentPageNumber();
                            x.Span(" / ");
                            x.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        private async Task<byte[]> ExportIncidentsToPdfAsync(IEnumerable<IncidentReport> incidents)
        {
            var incidentList = incidents.ToList();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header()
                        .Text("BÁO CÁO SỰ CỐ")
                        .SemiBold().FontSize(20).FontColor(Colors.Orange.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x =>
                        {
                            x.Spacing(20);

                            if (!incidentList.Any())
                            {
                                x.Item().Text("Không có bản ghi nào phù hợp với điều kiện lọc.")
                                    .FontSize(12);
                            }
                            else
                            {
                                x.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Element(CellStyle).Text("Mã TB").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Loại báo cáo").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Trạng thái").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Ngày báo cáo").SemiBold();
                                    });

                                    foreach (var incident in incidentList.Take(50))
                                    {
                                        table.Cell().Element(CellStyle).Text(incident.Device?.DeviceCode ?? "");
                                        table.Cell().Element(CellStyle).Text(incident.ReportType ?? "");
                                        table.Cell().Element(CellStyle).Text(incident.Status.ToString());
                                        table.Cell().Element(CellStyle).Text(incident.ReportDate?.ToString("dd/MM/yyyy") ?? "");
                                    }
                                });
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Trang ");
                            x.CurrentPageNumber();
                            x.Span(" / ");
                            x.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        private async Task<byte[]> ExportLiquidationsToPdfAsync(IEnumerable<Liquidation> liquidations)
        {
            var liquidationList = liquidations.ToList();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header()
                        .Text("BÁO CÁO THANH LÝ")
                        .SemiBold().FontSize(20).FontColor(Colors.Red.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x =>
                        {
                            x.Spacing(20);

                            if (!liquidationList.Any())
                            {
                                x.Item().Text("Không có bản ghi nào phù hợp với điều kiện lọc.")
                                    .FontSize(12);
                            }
                            else
                            {
                                x.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().Element(CellStyle).Text("Mã TB").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Tên TB").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Ngày thanh lý").SemiBold();
                                        header.Cell().Element(CellStyle).Text("Người duyệt").SemiBold();
                                    });

                                    foreach (var liquidation in liquidationList.Take(50))
                                    {
                                        table.Cell().Element(CellStyle).Text(liquidation.Device?.DeviceCode ?? "");
                                        table.Cell().Element(CellStyle).Text(liquidation.Device?.DeviceName ?? "");
                                        table.Cell().Element(CellStyle).Text(liquidation.LiquidationDate?.ToString("dd/MM/yyyy") ?? "");
                                        table.Cell().Element(CellStyle).Text(liquidation.ApprovedByNavigation?.FullName ?? "");
                                    }
                                });
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Trang ");
                            x.CurrentPageNumber();
                            x.Span(" / ");
                            x.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        private static IContainer CellStyle(IContainer container)
        {
            return container
                .Border(1)
                .Padding(8)
                .Background(Colors.Grey.Lighten3);
        }

        #endregion
    }
}
