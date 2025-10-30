using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/reports")]
    public class ReportExportController : ControllerBase
    {
        private readonly IReportExportService _reportExportService;

        public ReportExportController(IReportExportService reportExportService)
        {
            _reportExportService = reportExportService;
        }

        [HttpPost("export")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportReport([FromBody] ExportRequestDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.ReportType) || string.IsNullOrEmpty(request.Format))
                {
                    return BadRequest("ReportType và Format là bắt buộc");
                }

                byte[] fileBytes;
                string contentType;
                string fileName;

                switch (request.ReportType.ToLower())
                {
                    case "devices":
                        fileBytes = await _reportExportService.ExportDevicesAsync(request);
                        contentType = request.Format.ToLower() == "excel" 
                            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            : "application/pdf";
                        fileName = $"Devices_Export_{DateTime.Now:yyyyMMdd_HHmmss}.{(request.Format.ToLower() == "excel" ? "xlsx" : "pdf")}";
                        break;

                    case "repairs":
                        fileBytes = await _reportExportService.ExportRepairsAsync(request);
                        contentType = request.Format.ToLower() == "excel" 
                            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            : "application/pdf";
                        fileName = $"Repairs_Export_{DateTime.Now:yyyyMMdd_HHmmss}.{(request.Format.ToLower() == "excel" ? "xlsx" : "pdf")}";
                        break;

                    case "incidents":
                        fileBytes = await _reportExportService.ExportIncidentsAsync(request);
                        contentType = request.Format.ToLower() == "excel" 
                            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            : "application/pdf";
                        fileName = $"Incidents_Export_{DateTime.Now:yyyyMMdd_HHmmss}.{(request.Format.ToLower() == "excel" ? "xlsx" : "pdf")}";
                        break;

                    case "liquidation":
                        fileBytes = await _reportExportService.ExportLiquidationsAsync(request);
                        contentType = request.Format.ToLower() == "excel" 
                            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            : "application/pdf";
                        fileName = $"Liquidations_Export_{DateTime.Now:yyyyMMdd_HHmmss}.{(request.Format.ToLower() == "excel" ? "xlsx" : "pdf")}";
                        break;

                    default:
                        return BadRequest("Loại báo cáo không được hỗ trợ");
                }

                // Save to history if requested
                if (request.SaveToHistory)
                {
                    var userId = GetCurrentUserId();
                    if (userId.HasValue)
                    {
                        await _reportExportService.SaveExportHistoryAsync(
                            request.ReportType, 
                            request.Format, 
                            userId.Value, 
                            null // File not saved to server, direct download
                        );
                    }
                }

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Đã xảy ra lỗi khi tạo file báo cáo: {ex.Message}");
            }
        }

        [HttpGet("history")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetExportHistory()
        {
            try
            {
                var history = await _reportExportService.GetExportHistoryAsync();
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Đã xảy ra lỗi khi lấy lịch sử xuất báo cáo: {ex.Message}");
            }
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}
