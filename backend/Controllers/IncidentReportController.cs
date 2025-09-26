using backend.Models.Dtos.IncidentReports;
using backend.Models.Entities;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IncidentReportController : ControllerBase
    {
        private readonly IIncidentReportService _incidentService;
        private readonly IAuthService _authService;

        public IncidentReportController(
            IIncidentReportService incidentService,
            IAuthService authService)
        {
            _incidentService = incidentService;
            _authService = authService;
        }

        // [1] Nhân viên tạo báo cáo
        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> Create([FromBody] CreateIncidentReportDto dto)
        {
            var position = _authService.GetCurrentUserPosition(User);
            if (position != "Nhân viên")
                return Forbid("Chỉ nhân viên mới được tạo báo cáo");

            var userId = _authService.GetCurrentUserId(User);
            if (userId == null) return Unauthorized();

            try
            {
                var created = await _incidentService.CreateAsync(dto, userId.Value);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // ✅ Trả về 400 + message rõ ràng
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // [2] Admin duyệt và tạo lệnh sửa chữa
        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveAndCreateRepair(Guid id)
        {
            var updatedBy = User.FindFirst(ClaimTypes.Email)?.Value ?? "admin";

            var result = await _incidentService.ApproveAndCreateRepairAsync(id, updatedBy);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            // Return simplified data without navigation properties to avoid JSON cycles
            var repairData = result.Data as Repair;
            var responseData = new
            {
                success = true,
                message = result.Message,
                data = repairData != null ? new
                {
                    id = repairData.Id,
                    deviceId = repairData.DeviceId,
                    incidentReportId = repairData.IncidentReportId,
                    description = repairData.Description,
                    status = repairData.Status,
                    startDate = repairData.StartDate
                } : null
            };

            return Ok(responseData);
        }

        // [3] Admin từ chối báo cáo
        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] RejectIncidentDto dto)
        {
            var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "admin";

            var success = await _incidentService.RejectAsync(id, dto.Reason, adminEmail);
            if (!success) return NotFound();

            return Ok(new { message = "Đã từ chối báo cáo sự cố." });
        }

        // [4] Kỹ thuật viên hoặc admin xem tất cả
        [HttpGet("all")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetAll()
        {
            var position = _authService.GetCurrentUserPosition(User);
            if (_authService.IsAdmin(User) || position == "Kỹ thuật viên")
            {
                var result = await _incidentService.GetAllAsync();
                return Ok(result);
            }

            return Forbid();
        }

        // [5] Nhân viên xem báo cáo của mình
        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> GetMine()
        {
            var userId = _authService.GetCurrentUserId(User);
            if (userId == null) return Unauthorized();

            var result = await _incidentService.GetMyReportsAsync(userId.Value);
            return Ok(result);
        }

        // [6] Xem chi tiết 1 báo cáo
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _incidentService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        [HttpPost("upload-incident-image")]
        [Authorize]
        public async Task<IActionResult> UploadIncidentImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File ảnh rỗng" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Chỉ hỗ trợ file ảnh JPG/PNG." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Dung lượng ảnh vượt quá 5MB." });

            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "incidents");
            if (!Directory.Exists(uploadDir))
                Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var imageUrl = $"/images/incidents/{fileName}";

            return Ok(new { imageUrl });
        }

    }
}
