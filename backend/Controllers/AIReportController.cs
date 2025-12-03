using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/ai-reports")]
    public class AIReportController : ControllerBase
    {
        private readonly IAIReportService _aiReportService;

        public AIReportController(IAIReportService aiReportService)
        {
            _aiReportService = aiReportService;
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessReportQuery([FromBody] AIReportRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Query))
                {
                    return BadRequest(new { error = "Query không được để trống." });
                }

                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(new { error = "Không thể xác định người dùng." });
                }

                var response = await _aiReportService.ProcessReportQueryAsync(request.Query, userId.Value);

                if (!response.IsReportQuery)
                {
                    return Ok(new
                    {
                        isReportQuery = false,
                        message = response.Message
                    });
                }

                if (!string.IsNullOrEmpty(response.Error))
                {
                    return BadRequest(new
                    {
                        isReportQuery = true,
                        error = response.Error
                    });
                }

                // If file data is present, include it in JSON response with base64 encoding
                if (response.FileData != null && !string.IsNullOrEmpty(response.FileName) && !string.IsNullOrEmpty(response.ContentType))
                {
                    var fileBase64 = Convert.ToBase64String(response.FileData);
                    
                    return Ok(new
                    {
                        isReportQuery = true,
                        message = response.Message,
                        exportRequest = response.ExportRequest,
                        fileData = fileBase64,
                        fileName = response.FileName,
                        contentType = response.ContentType
                    });
                }

                // Return response with message
                return Ok(new
                {
                    isReportQuery = true,
                    message = response.Message,
                    exportRequest = response.ExportRequest
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Đã xảy ra lỗi khi xử lý yêu cầu: {ex.Message}" });
            }
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}

