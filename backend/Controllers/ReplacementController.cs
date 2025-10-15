using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Services.Interfaces;
using backend.Models.DTOs;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReplacementController : ControllerBase
    {
        private readonly IReplacementService _replacementService;
        private readonly ILogger<ReplacementController> _logger;
        private readonly INotificationService _notificationService;

        public ReplacementController(
            IReplacementService replacementService, 
            ILogger<ReplacementController> logger,
            INotificationService notificationService)
        {
            _replacementService = replacementService;
            _logger = logger;
            _notificationService = notificationService;
        }

        /// <summary>
        /// Lấy danh sách thiết bị được đề xuất cho việc thay thế (cùng model)
        /// </summary>
        /// <param name="oldDeviceId">ID của thiết bị cũ cần thay thế</param>
        /// <returns>Danh sách thiết bị đề xuất</returns>
        [HttpGet("suggested-devices/{oldDeviceId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSuggestedReplacementDevices(Guid oldDeviceId)
        {
            try
            {
                _logger.LogInformation("Getting suggested replacement devices for device {DeviceId}", oldDeviceId);
                var suggestedDevices = await _replacementService.GetSuggestedReplacementDevicesAsync(oldDeviceId);
                return Ok(suggestedDevices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting suggested replacement devices for {DeviceId}", oldDeviceId);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// Lấy tất cả thiết bị có sẵn cho việc thay thế
        /// </summary>
        /// <returns>Danh sách tất cả thiết bị available</returns>
        [HttpGet("available-devices")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAvailableDevices()
        {
            try
            {
                _logger.LogInformation("Getting all available devices for replacement");
                var availableDevices = await _replacementService.GetAllAvailableDevicesAsync();
                return Ok(availableDevices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all available devices");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// Tạo replacement request và thực hiện thay thế thiết bị
        /// </summary>
        /// <param name="createReplacementDto">Thông tin thay thế</param>
        /// <returns>Thông tin replacement đã tạo</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateReplacement([FromBody] CreateReplacementDto createReplacementDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var performedBy = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                    throw new UnauthorizedAccessException("User ID not found in token"));

                _logger.LogInformation("Creating replacement: Old {OldDeviceId} -> New {NewDeviceId} by {UserId}", 
                    createReplacementDto.OldDeviceId, createReplacementDto.NewDeviceId, performedBy);

                var replacement = await _replacementService.CreateReplacementAsync(createReplacementDto, performedBy);
                
                // Send notification to user about device replacement
                await _notificationService.NotifyDeviceReplacedAsync(replacement.Id);
                
                return CreatedAtAction(nameof(GetReplacementById), new { id = replacement.Id }, replacement);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for replacement creation");
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation for replacement creation");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating replacement");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin replacement theo ID
        /// </summary>
        /// <param name="id">ID của replacement</param>
        /// <returns>Thông tin replacement</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetReplacementById(Guid id)
        {
            try
            {
                _logger.LogInformation("Getting replacement by ID {ReplacementId}", id);
                var replacement = await _replacementService.GetReplacementByIdAsync(id);
                
                if (replacement == null)
                {
                    return NotFound(new { message = $"Replacement {id} not found" });
                }

                return Ok(replacement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting replacement {ReplacementId}", id);
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// Lấy lịch sử thay thế thiết bị
        /// </summary>
        /// <param name="deviceId">ID của thiết bị (tùy chọn). Nếu không có thì lấy tất cả</param>
        /// <returns>Danh sách lịch sử thay thế</returns>
       [HttpGet("history")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetReplacementHistory([FromQuery] Guid? deviceId = null)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty);
                var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";

                var history = await _replacementService.GetReplacementHistoryAsync(deviceId, userId, role);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting replacement history");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }


        /// <summary>
        /// Endpoint để Admin có thể quickly check device info trước khi thay thế
        /// </summary>
        /// <param name="deviceId">ID của thiết bị</param>
        /// <returns>Thông tin cơ bản của thiết bị</returns>
        [HttpGet("device-info/{deviceId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDeviceInfoForReplacement(Guid deviceId)
        {
            try
            {
                _logger.LogInformation("Getting device info for replacement: {DeviceId}", deviceId);
                
                // This could be moved to a separate service, but for now we'll implement here
                // In the future, consider creating a dedicated DeviceInfoService
                
                return Ok(new { 
                    message = "Device info endpoint - implementation can be added if needed",
                    deviceId = deviceId,
                    suggestion = "Use existing DeviceController endpoints for device information"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device info for replacement");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }
    }
}