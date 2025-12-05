using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using backend.Models.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace backend.Services.Implementations
{
    public class AIReportService : IAIReportService
    {
        private readonly IReportExportService _reportExportService;
        private readonly ILogger<AIReportService> _logger;

        public AIReportService(
            IReportExportService reportExportService,
            ILogger<AIReportService> logger)
        {
            _reportExportService = reportExportService;
            _logger = logger;
        }

        public async Task<AIReportResponseDto> ProcessReportQueryAsync(string query, Guid userId)
        {
            try
            {
                var lowerQuery = query.ToLower().Trim();

                // Check if this is a report export query
                if (!IsReportExportQuery(lowerQuery))
                {
                    return new AIReportResponseDto
                    {
                        IsReportQuery = false,
                        Message = null
                    };
                }

                _logger.LogInformation("Processing report export query: {Query}", query);

                // Extract entities from the query
                var reportType = ExtractReportType(lowerQuery);
                var format = ExtractFormat(lowerQuery);
                var dateRange = ExtractDateRange(lowerQuery);
                var filters = ExtractFilters(lowerQuery, reportType);

                // Validate report type
                if (string.IsNullOrEmpty(reportType))
                {
                    return new AIReportResponseDto
                    {
                        IsReportQuery = true,
                        Message = "Xin lỗi, bạn có thể nói rõ hơn loại báo cáo không? Ví dụ: \"thiết bị\", \"sự cố\", \"sửa chữa\" hoặc \"thanh lý\"."
                    };
                }

                // Build ExportRequestDto
                var exportRequest = new ExportRequestDto
                {
                    ReportType = reportType,
                    Format = format,
                    FromDate = dateRange.FromDate,
                    ToDate = dateRange.ToDate,
                    SaveToHistory = true,
                    Filters = filters
                };

                // Check data count before exporting
                int dataCount = 0;
                switch (reportType.ToLower())
                {
                    case "devices":
                        dataCount = await _reportExportService.GetDevicesCountAsync(exportRequest);
                        break;
                    case "incidents":
                        dataCount = await _reportExportService.GetIncidentsCountAsync(exportRequest);
                        break;
                    case "repairs":
                        dataCount = await _reportExportService.GetRepairsCountAsync(exportRequest);
                        break;
                    case "liquidation":
                        dataCount = await _reportExportService.GetLiquidationsCountAsync(exportRequest);
                        break;
                    default:
                        return new AIReportResponseDto
                        {
                            IsReportQuery = true,
                            Error = $"Loại báo cáo '{reportType}' không được hỗ trợ."
                        };
                }

                // Build common info for messages
                var reportTypeName = GetReportTypeName(reportType);
                var dateInfo = "Tất cả";
                if (dateRange.FromDate.HasValue && dateRange.ToDate.HasValue)
                {
                    dateInfo = $"Từ {dateRange.FromDate.Value:dd/MM/yyyy} đến {dateRange.ToDate.Value:dd/MM/yyyy}";
                }
                else if (dateRange.FromDate.HasValue)
                {
                    dateInfo = $"Từ {dateRange.FromDate.Value:dd/MM/yyyy}";
                }
                else if (dateRange.ToDate.HasValue)
                {
                    dateInfo = $"Đến {dateRange.ToDate.Value:dd/MM/yyyy}";
                }

                // If no data found, return message instead of creating empty file
                if (dataCount == 0)
                {
                    var noDataMessage = $"⚠️ Không tìm thấy bản ghi phù hợp với điều kiện lọc.\n\n" +
                                      $"📊 Thông tin báo cáo:\n" +
                                      $"• Loại: {reportTypeName}\n" +
                                      $"• Thời gian: {dateInfo}\n";

                    // Add filter info if present
                    if (filters != null && filters.Count > 0)
                    {
                        noDataMessage += $"• Điều kiện lọc:\n";
                        if (filters.TryGetValue("reporterName", out var reporterNameFilter) && !string.IsNullOrWhiteSpace(reporterNameFilter))
                        {
                            noDataMessage += $"  - Người báo cáo: {reporterNameFilter}\n";
                        }
                        if (filters.TryGetValue("status", out var statusFilter) && !string.IsNullOrWhiteSpace(statusFilter))
                        {
                            noDataMessage += $"  - Trạng thái: {statusFilter}\n";
                        }
                        if (filters.TryGetValue("departmentName", out var deptName) && !string.IsNullOrWhiteSpace(deptName))
                        {
                            noDataMessage += $"  - Phòng ban: {deptName}\n";
                        }
                        if (filters.TryGetValue("supplierName", out var supplierName) && !string.IsNullOrWhiteSpace(supplierName))
                        {
                            noDataMessage += $"  - Nhà cung cấp: {supplierName}\n";
                        }
                    }

                    noDataMessage += $"\n💡 Vui lòng thử lại với điều kiện lọc khác.";

                    return new AIReportResponseDto
                    {
                        IsReportQuery = true,
                        ExportRequest = exportRequest,
                        Message = noDataMessage
                    };
                }

                // Generate the export file
                byte[] fileData;
                string fileName;
                string contentType;

                switch (reportType.ToLower())
                {
                    case "devices":
                        fileData = await _reportExportService.ExportDevicesAsync(exportRequest);
                        fileName = GenerateFileName("BaoCaoThietBi", dateRange, format);
                        contentType = format.ToLower() == "excel"
                            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            : "application/pdf";
                        break;

                    case "incidents":
                        fileData = await _reportExportService.ExportIncidentsAsync(exportRequest);
                        fileName = GenerateFileName("BaoCaoSuCo", dateRange, format);
                        contentType = format.ToLower() == "excel"
                            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            : "application/pdf";
                        break;

                    case "repairs":
                        fileData = await _reportExportService.ExportRepairsAsync(exportRequest);
                        fileName = GenerateFileName("BaoCaoSuaChua", dateRange, format);
                        contentType = format.ToLower() == "excel"
                            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            : "application/pdf";
                        break;

                    case "liquidation":
                        fileData = await _reportExportService.ExportLiquidationsAsync(exportRequest);
                        fileName = GenerateFileName("BaoCaoThanhLy", dateRange, format);
                        contentType = format.ToLower() == "excel"
                            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            : "application/pdf";
                        break;

                    default:
                        return new AIReportResponseDto
                        {
                            IsReportQuery = true,
                            Error = $"Loại báo cáo '{reportType}' không được hỗ trợ."
                        };
                }

                // Build success message
                var formatName = format.ToUpper();

                var message = $"✅ Đã tạo báo cáo thành công!\n\n" +
                             $"📊 Thông tin báo cáo:\n" +
                             $"• Loại: {reportTypeName}\n" +
                             $"• Thời gian: {dateInfo}\n";
                
                // Add reporter filter info if present
                if (filters != null && filters.TryGetValue("reporterName", out var reporterName) && !string.IsNullOrWhiteSpace(reporterName))
                {
                    message += $"• Người báo cáo: {reporterName}\n";
                }
                
                message += $"• Format: {formatName}\n\n" +
                          $"📥 File: {fileName}";

                return new AIReportResponseDto
                {
                    IsReportQuery = true,
                    ExportRequest = exportRequest,
                    Message = message,
                    FileData = fileData,
                    FileName = fileName,
                    ContentType = contentType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing report query: {Query}", query);
                return new AIReportResponseDto
                {
                    IsReportQuery = true,
                    Error = $"Đã xảy ra lỗi khi tạo báo cáo: {ex.Message}"
                };
            }
        }

        private bool IsReportExportQuery(string query)
        {
            // Từ khóa xuất báo cáo rõ ràng - yêu cầu bắt buộc
            var exportKeywords = new[]
            {
                "xuất", "export", "tạo báo cáo", "tạo file",
                "xuất file", "download", "tải xuống", "export report"
            };

            // Từ khóa báo cáo/thống kê (không bao gồm "danh sách" vì quá chung chung)
            var reportKeywords = new[]
            {
                "báo cáo", "report", "thống kê"
            };

            var hasExportKeyword = exportKeywords.Any(keyword => query.Contains(keyword));
            var hasReportKeyword = reportKeywords.Any(keyword => query.Contains(keyword));

            // Chỉ coi là yêu cầu xuất báo cáo nếu:
            // 1. Có từ khóa xuất rõ ràng (xuất, export, tạo báo cáo, etc.)
            // 2. HOẶC có từ khóa báo cáo/thống kê kết hợp với context thiết bị/sự cố
            // KHÔNG coi "danh sách" + "thiết bị" là yêu cầu xuất báo cáo (chỉ là câu hỏi danh sách thông thường)
            if (hasExportKeyword)
            {
                return true;
            }

            // Chỉ kiểm tra report keyword nếu có context và KHÔNG chỉ là "danh sách"
            if (hasReportKeyword)
            {
                var hasContext = query.Contains("thiết bị") ||
                                 query.Contains("sự cố") ||
                                 query.Contains("incident") ||
                                 query.Contains("thanh lý") ||
                                 query.Contains("liquidation") ||
                                 query.Contains("device");
                
                return hasContext;
            }

            return false;
        }

        private string ExtractReportType(string query)
        {
            var normalized = RemoveDiacritics(query).ToLowerInvariant();

            // Devices
            if (query.Contains("thiết bị") || normalized.Contains("device"))
            {
                return "devices";
            }

            // Incidents (sự cố)
            if (query.Contains("sự cố") || normalized.Contains("incident"))
            {
                return "incidents";
            }

            // Repairs / Bảo trì
            if (query.Contains("sửa chữa") ||
                query.Contains("bảo trì") ||
                normalized.Contains("repair") ||
                normalized.Contains("maintenance"))
            {
                return "repairs";
            }

            // Liquidations / Thanh lý
            if (query.Contains("thanh lý") || normalized.Contains("liquidation") || normalized.Contains("disposed"))
            {
                return "liquidation";
            }

            return string.Empty;
        }

        private string ExtractFormat(string query)
        {
            var normalized = RemoveDiacritics(query).ToLowerInvariant();

            // Explicit PDF patterns
            if (normalized.Contains("file pdf") ||
                normalized.Contains("dang pdf") ||
                normalized.Contains("dạng pdf") ||
                normalized.Contains("xuat ra pdf") ||
                normalized.Contains("xuất ra pdf") ||
                normalized.Contains(" pdf"))
            {
                return "pdf";
            }

            // Explicit Excel / spreadsheet patterns
            if (normalized.Contains("bảng excel") ||
                normalized.Contains("bang excel") ||
                normalized.Contains("file excel") ||
                normalized.Contains("dang bang tinh") ||
                normalized.Contains("dạng bảng tính") ||
                normalized.Contains("dang excel") ||
                normalized.Contains(" excel") ||
                normalized.Contains("xlsx") ||
                normalized.Contains("xls"))
            {
                return "excel";
            }

            // Fallback to existing simple detection
            if (query.Contains("pdf"))
            {
                return "pdf";
            }

            if (query.Contains("excel") || query.Contains("xlsx") || query.Contains("xls"))
            {
                return "excel";
            }

            // Default to Excel
            return "excel";
        }

        private (DateTime? FromDate, DateTime? ToDate) ExtractDateRange(string query)
        {
            DateTime? fromDate = null;
            DateTime? toDate = null;

            var now = DateTime.Now;
            var vietnamCulture = new CultureInfo("vi-VN");

            // "Năm trước" / "Năm ngoái" / "last year"
            if (query.Contains("năm trước") || query.Contains("năm ngoái") || query.Contains("last year"))
            {
                var year = now.Year - 1;
                fromDate = new DateTime(year, 1, 1);
                toDate = new DateTime(year, 12, 31);
                return (fromDate, toDate);
            }

            // 6 tháng đầu năm / 6 tháng cuối năm
            if (query.Contains("6 tháng đầu năm"))
            {
                fromDate = new DateTime(now.Year, 1, 1);
                toDate = new DateTime(now.Year, 6, DateTime.DaysInMonth(now.Year, 6));
                if (toDate > now) toDate = now;
                return (fromDate, toDate);
            }

            if (query.Contains("6 tháng cuối năm"))
            {
                fromDate = new DateTime(now.Year, 7, 1);
                toDate = new DateTime(now.Year, 12, 31);
                if (toDate > now) toDate = now;
                return (fromDate, toDate);
            }

            // Quý X / Quarter X (quý 1, quý I, quý II, quý 3, ...)
            var quarterMatch = Regex.Match(query, @"quý\s+([0-9ivx]+)", RegexOptions.IgnoreCase);
            if (quarterMatch.Success)
            {
                var quarterToken = quarterMatch.Groups[1].Value.Trim().ToUpperInvariant();
                int quarterNumber = ParseQuarterNumber(quarterToken);

                if (quarterNumber >= 1 && quarterNumber <= 4)
                {
                    int startMonth = (quarterNumber - 1) * 3 + 1;
                    int endMonth = startMonth + 2;

                    fromDate = new DateTime(now.Year, startMonth, 1);
                    toDate = new DateTime(now.Year, endMonth, DateTime.DaysInMonth(now.Year, endMonth));

                    if (toDate > now)
                    {
                        toDate = now;
                    }

                    return (fromDate, toDate);
                }
            }

            // "Tháng này" / "This month"
            if (query.Contains("tháng này") || query.Contains("this month"))
            {
                fromDate = new DateTime(now.Year, now.Month, 1);
                toDate = now;
                return (fromDate, toDate);
            }

            // "Tuần này" / "This week"
            if (query.Contains("tuần này") || query.Contains("this week"))
            {
                var daysUntilMonday = ((int)now.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
                fromDate = now.AddDays(-daysUntilMonday).Date;
                toDate = now;
                return (fromDate, toDate);
            }

            // "Năm này" / "This year"
            if (query.Contains("năm này") || query.Contains("this year"))
            {
                fromDate = new DateTime(now.Year, 1, 1);
                toDate = now;
                return (fromDate, toDate);
            }

            // "Tháng X" pattern - e.g., "tháng 1", "tháng 01"
            var monthMatch = Regex.Match(query, @"tháng\s+(\d{1,2})", RegexOptions.IgnoreCase);
            if (monthMatch.Success)
            {
                if (int.TryParse(monthMatch.Groups[1].Value, out int month) && month >= 1 && month <= 12)
                {
                    fromDate = new DateTime(now.Year, month, 1);
                    toDate = new DateTime(now.Year, month, DateTime.DaysInMonth(now.Year, month));
                    
                    // If the month has passed, don't extend toDate beyond today
                    if (toDate > now)
                    {
                        toDate = now;
                    }
                }
            }

            // "Từ X đến Y" pattern
            var fromToMatch = Regex.Match(query, @"từ\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s+đến\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})", RegexOptions.IgnoreCase);
            if (fromToMatch.Success)
            {
                var fromDay = int.Parse(fromToMatch.Groups[1].Value);
                var fromMonth = int.Parse(fromToMatch.Groups[2].Value);
                var fromYear = int.Parse(fromToMatch.Groups[3].Value);
                var toDay = int.Parse(fromToMatch.Groups[4].Value);
                var toMonth = int.Parse(fromToMatch.Groups[5].Value);
                var toYear = int.Parse(fromToMatch.Groups[6].Value);

                try
                {
                    fromDate = new DateTime(fromYear, fromMonth, fromDay);
                    toDate = new DateTime(toYear, toMonth, toDay);
                    return (fromDate, toDate);
                }
                catch
                {
                    // Invalid date, ignore
                }
            }

            // "Trong tháng X" pattern
            var inMonthMatch = Regex.Match(query, @"trong\s+tháng\s+(\d{1,2})", RegexOptions.IgnoreCase);
            if (inMonthMatch.Success)
            {
                if (int.TryParse(inMonthMatch.Groups[1].Value, out int month) && month >= 1 && month <= 12)
                {
                    fromDate = new DateTime(now.Year, month, 1);
                    toDate = new DateTime(now.Year, month, DateTime.DaysInMonth(now.Year, month));
                    
                    if (toDate > now)
                    {
                        toDate = now;
                    }

                    return (fromDate, toDate);
                }
            }

            return (fromDate, toDate);
        }

        private Dictionary<string, string> ExtractFilters(string query, string reportType)
        {
            var filters = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var normalized = RemoveDiacritics(query).ToLowerInvariant();

            // Department filters (e.g., "phòng nhân sự", "phòng Kinh doanh", "department IT")
            var departmentMatch = Regex.Match(query, @"phòng\s+([a-zA-ZÀ-ỹ0-9\s]+)", RegexOptions.IgnoreCase);
            if (departmentMatch.Success)
            {
                var deptName = departmentMatch.Groups[1].Value
                    .Trim()
                    .TrimEnd('.', ',', ';', '!', '?');

                if (!string.IsNullOrWhiteSpace(deptName))
                {
                    filters["departmentName"] = deptName;
                }
            }
            else if (normalized.Contains("department"))
            {
                // Basic English pattern: "department sales"
                var enDeptMatch = Regex.Match(normalized, @"department\s+([a-z0-9\s]+)", RegexOptions.IgnoreCase);
                if (enDeptMatch.Success)
                {
                    var deptName = enDeptMatch.Groups[1].Value.Trim();
                    if (!string.IsNullOrWhiteSpace(deptName))
                    {
                        filters["departmentName"] = deptName;
                    }
                }
            }

            // Supplier filters (e.g., "nhà cung cấp FPT", "thiết bị của FPT")
            var supplierMatch = Regex.Match(query, @"nhà cung cấp\s+([a-zA-ZÀ-ỹ0-9\s]+)", RegexOptions.IgnoreCase);
            if (supplierMatch.Success)
            {
                var supplierName = supplierMatch.Groups[1].Value
                    .Trim()
                    .TrimEnd('.', ',', ';', '!', '?');
                if (!string.IsNullOrWhiteSpace(supplierName))
                {
                    filters["supplierName"] = supplierName;
                }
            }
            else
            {
                var ofSupplierMatch = Regex.Match(query, @"thiết bị\s+của\s+([a-zA-ZÀ-ỹ0-9\s]+)", RegexOptions.IgnoreCase);
                if (ofSupplierMatch.Success)
                {
                    var supplierName = ofSupplierMatch.Groups[1].Value
                        .Trim()
                        .TrimEnd('.', ',', ';', '!', '?');
                    if (!string.IsNullOrWhiteSpace(supplierName))
                    {
                        filters["supplierName"] = supplierName;
                    }
                }
            }

            // Reporter filters for incidents (e.g., "người báo cáo X", "của người báo cáo X", "reporter X")
            if (reportType == "incidents")
            {
                // Pattern: "người báo cáo [tên]" or "của người báo cáo [tên]"
                var reporterMatch = Regex.Match(query, @"(?:của\s+)?người\s+báo\s+cáo\s+([a-zA-ZÀ-ỹ0-9\s]+)", RegexOptions.IgnoreCase);
                if (reporterMatch.Success)
                {
                    var reporterName = reporterMatch.Groups[1].Value
                        .Trim()
                        .TrimEnd('.', ',', ';', '!', '?');
                    if (!string.IsNullOrWhiteSpace(reporterName))
                    {
                        filters["reporterName"] = reporterName;
                    }
                }
                else
                {
                    // Pattern: "người báo [tên]" (shorter form)
                    var shortReporterMatch = Regex.Match(query, @"người\s+báo\s+([a-zA-ZÀ-ỹ0-9\s]+)", RegexOptions.IgnoreCase);
                    if (shortReporterMatch.Success)
                    {
                        var reporterName = shortReporterMatch.Groups[1].Value
                            .Trim()
                            .TrimEnd('.', ',', ';', '!', '?');
                        if (!string.IsNullOrWhiteSpace(reporterName))
                        {
                            filters["reporterName"] = reporterName;
                        }
                    }
                    else if (normalized.Contains("reporter"))
                    {
                        // English pattern: "reporter [name]"
                        var enReporterMatch = Regex.Match(normalized, @"reporter\s+([a-z0-9\s]+)", RegexOptions.IgnoreCase);
                        if (enReporterMatch.Success)
                        {
                            var reporterName = enReporterMatch.Groups[1].Value.Trim();
                            if (!string.IsNullOrWhiteSpace(reporterName))
                            {
                                filters["reporterName"] = reporterName;
                            }
                        }
                    }
                }
            }

            // Status filters for incidents
            if (reportType == "incidents")
            {
                if (query.Contains("chờ duyệt") || normalized.Contains("pending"))
                {
                    filters["status"] = IncidentStatus.ChoDuyet.ToString();
                }
                else if (query.Contains("đã tạo lệnh") || query.Contains("đã phê duyệt") || normalized.Contains("approved"))
                {
                    filters["status"] = IncidentStatus.DaTaoLenhSua.ToString();
                }
                else if (query.Contains("đã từ chối") || normalized.Contains("rejected"))
                {
                    filters["status"] = IncidentStatus.DaTuChoi.ToString();
                }
                else if (query.Contains("đã đóng") || query.Contains("đã giải quyết") || normalized.Contains("closed") || normalized.Contains("resolved"))
                {
                    filters["status"] = IncidentStatus.DaDong.ToString();
                }
                else if (query.Contains("chờ thực hiện") || normalized.Contains("waiting") || normalized.Contains("cho thuc hien"))
                {
                    filters["status"] = IncidentStatus.ChoThucHien.ToString();
                }
            }

            // Status filters for repairs
            if (reportType == "repairs")
            {
                if (query.Contains("đang sửa") || query.Contains("đang sửa chữa") || normalized.Contains("repairing"))
                {
                    filters["status"] = RepairStatus.DangSua.ToString();
                }
                else if (query.Contains("chờ thực hiện") || normalized.Contains("pending"))
                {
                    filters["status"] = RepairStatus.ChoThucHien.ToString();
                }
                else if (query.Contains("chờ duyệt hoàn tất") || normalized.Contains("cho duyet hoan tat"))
                {
                    filters["status"] = RepairStatus.ChoDuyetHoanTat.ToString();
                }
                else if (query.Contains("hoàn thành") || query.Contains("đã hoàn tất") || normalized.Contains("completed") || normalized.Contains("finished"))
                {
                    filters["status"] = RepairStatus.DaHoanTat.ToString();
                }
                else if (query.Contains("từ chối") || normalized.Contains("rejected"))
                {
                    filters["status"] = RepairStatus.TuChoi.ToString();
                }
                else if (query.Contains("không cần sửa") || normalized.Contains("khong can sua") || normalized.Contains("no need to repair"))
                {
                    filters["status"] = RepairStatus.KhongCanSua.ToString();
                }
            }

            // Status filters for devices
            if (reportType == "devices")
            {
                if (query.Contains("thiết bị hỏng") || query.Contains("bị hỏng") || normalized.Contains("broken"))
                {
                    filters["status"] = DeviceStatus.Broken;
                }
                else if (query.Contains("đang sử dụng") || query.Contains("đang dùng") || normalized.Contains("in use") || normalized.Contains("inuse"))
                {
                    filters["status"] = DeviceStatus.InUse;
                }
                else if (query.Contains("sẵn sàng") || query.Contains("chưa cấp phát") || normalized.Contains("available"))
                {
                    filters["status"] = DeviceStatus.Available;
                }
                else if (query.Contains("chờ thanh lý"))
                {
                    filters["status"] = DeviceStatus.PendingLiquidation;
                }
                else if (query.Contains("đã thanh lý") || query.Contains("đã thanh lí") || normalized.Contains("disposed") || normalized.Contains("liquidated"))
                {
                    filters["status"] = DeviceStatus.Liquidated;
                }
                else if (query.Contains("bảo trì") || normalized.Contains("maintenance"))
                {
                    filters["status"] = DeviceStatus.Maintenance;
                }
            }

            return filters.Count > 0 ? filters : null;
        }

        private string GetReportTypeName(string reportType)
        {
            return reportType.ToLower() switch
            {
                "devices" => "Báo cáo thiết bị",
                "incidents" => "Báo cáo sự cố",
                "repairs" => "Báo cáo sửa chữa",
                "liquidation" => "Báo cáo thanh lý",
                _ => reportType
            };
        }

        private string GenerateFileName(string reportTypeName, (DateTime? FromDate, DateTime? ToDate) dateRange, string format)
        {
            var fileExtension = format.ToLower() == "excel" ? "xlsx" : "pdf";
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var parts = new List<string> { reportTypeName };

            // Add date range information
            if (dateRange.FromDate.HasValue && dateRange.ToDate.HasValue)
            {
                var fromDate = dateRange.FromDate.Value;
                var toDate = dateRange.ToDate.Value;

                // Check if it's a single month
                if (fromDate.Year == toDate.Year && fromDate.Month == toDate.Month &&
                    fromDate.Day == 1 && toDate.Day == DateTime.DaysInMonth(toDate.Year, toDate.Month))
                {
                    parts.Add($"Thang{toDate.Month:D2}_{toDate.Year}");
                }
                // Check if it's a quarter
                else if (fromDate.Day == 1 && toDate.Day == DateTime.DaysInMonth(toDate.Year, toDate.Month))
                {
                    var quarter = ((toDate.Month - 1) / 3) + 1;
                    if ((fromDate.Month == (quarter - 1) * 3 + 1) && (toDate.Month == quarter * 3))
                    {
                        parts.Add($"Quy{quarter}_{toDate.Year}");
                    }
                    else
                    {
                        parts.Add($"Tu{fromDate:dd-MM-yyyy}_den_{toDate:dd-MM-yyyy}");
                    }
                }
                // Check if it's a full year
                else if (fromDate.Month == 1 && fromDate.Day == 1 && 
                         toDate.Month == 12 && toDate.Day == 31 && 
                         fromDate.Year == toDate.Year)
                {
                    parts.Add($"Nam{fromDate.Year}");
                }
                else
                {
                    parts.Add($"Tu{fromDate:dd-MM-yyyy}_den_{toDate:dd-MM-yyyy}");
                }
            }
            else if (dateRange.FromDate.HasValue)
            {
                parts.Add($"Tu{dateRange.FromDate.Value:dd-MM-yyyy}");
            }
            else if (dateRange.ToDate.HasValue)
            {
                parts.Add($"Den{dateRange.ToDate.Value:dd-MM-yyyy}");
            }

            parts.Add(timestamp);
            return $"{string.Join("_", parts)}.{fileExtension}";
        }

        private static int ParseQuarterNumber(string token)
        {
            // Numeric: "1", "2", "3", "4"
            if (int.TryParse(token, out var num) && num >= 1 && num <= 4)
            {
                return num;
            }

            // Roman numerals: I, II, III, IV
            return token switch
            {
                "I" => 1,
                "II" => 2,
                "III" => 3,
                "IV" => 4,
                _ => 0
            };
        }

        private static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return text;
            }

            var normalized = text.Normalize(NormalizationForm.FormD);
            var chars = normalized
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .ToArray();
            return new string(chars).Normalize(NormalizationForm.FormC);
        }
    }
}

