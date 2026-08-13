using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Services.Interfaces;
using backend.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DeviceHistoryController : ControllerBase
    {
        private readonly IDeviceHistoryService _deviceHistoryService;
        private readonly ILogger<DeviceHistoryController> _logger;
        private readonly DeviceManagementDbContext _context;

        public DeviceHistoryController(
            IDeviceHistoryService deviceHistoryService,
            ILogger<DeviceHistoryController> logger,
            DeviceManagementDbContext context)
        {
            _deviceHistoryService = deviceHistoryService;
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Get device history by device ID
        /// </summary>
        [HttpGet("device/{deviceId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<DeviceHistoryDto>>> GetDeviceHistory(
            Guid deviceId,
            [FromQuery] string? action = null,
            [FromQuery] string? actionType = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string sortBy = "ActionDate",
            [FromQuery] string sortOrder = "desc")
        {
            try
            {
                if (!await CanAccessDeviceAsync(deviceId))
                    return Forbid();

                var filter = new DeviceHistoryFilterDto
                {
                    DeviceId = deviceId,
                    Action = action,
                    ActionType = actionType,
                    FromDate = fromDate,
                    ToDate = toDate,
                    Page = page,
                    PageSize = pageSize,
                    SortBy = sortBy,
                    SortOrder = sortOrder
                };

                var history = await _deviceHistoryService.GetDeviceHistoryAsync(deviceId, filter);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for device {DeviceId}", deviceId);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving device history");
            }
        }

        /// <summary>
        /// Get user history by user ID
        /// </summary>
        [HttpGet("user/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<DeviceHistoryDto>>> GetUserHistory(
            Guid userId,
            [FromQuery] string? action = null,
            [FromQuery] string? actionType = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string sortBy = "ActionDate",
            [FromQuery] string sortOrder = "desc")
        {
            try
            {
                if (!await CanAccessUserAsync(userId))
                    return Forbid();

                var filter = new DeviceHistoryFilterDto
                {
                    UserId = userId,
                    Action = action,
                    ActionType = actionType,
                    FromDate = fromDate,
                    ToDate = toDate,
                    Page = page,
                    PageSize = pageSize,
                    SortBy = sortBy,
                    SortOrder = sortOrder
                };

                var history = await _deviceHistoryService.GetUserHistoryAsync(userId, filter);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving user history");
            }
        }

        /// <summary>
        /// Get current user's history
        /// </summary>
        [HttpGet("my-history")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<DeviceHistoryDto>>> GetMyHistory(
            [FromQuery] string? action = null,
            [FromQuery] string? actionType = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string sortBy = "ActionDate",
            [FromQuery] string sortOrder = "desc")
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("User ID not found in token");
                }

                var filter = new DeviceHistoryFilterDto
                {
                    UserId = userId,
                    Action = action,
                    ActionType = actionType,
                    FromDate = fromDate,
                    ToDate = toDate,
                    Page = page,
                    PageSize = pageSize,
                    SortBy = sortBy,
                    SortOrder = sortOrder
                };

                var history = await _deviceHistoryService.GetUserHistoryAsync(userId, filter);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user's history");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving user history");
            }
        }

        /// <summary>
        /// Get all device history with filters
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<IEnumerable<DeviceHistoryDto>>> GetAllHistory(
            [FromQuery] Guid? deviceId = null,
            [FromQuery] Guid? userId = null,
            [FromQuery] string? action = null,
            [FromQuery] string? actionType = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string sortBy = "ActionDate",
            [FromQuery] string sortOrder = "desc")
        {
            try
            {
                if (!User.IsInRole("Admin"))
                    return Forbid();

                var filter = new DeviceHistoryFilterDto
                {
                    DeviceId = deviceId,
                    UserId = userId,
                    Action = action,
                    ActionType = actionType,
                    FromDate = fromDate,
                    ToDate = toDate,
                    Page = page,
                    PageSize = pageSize,
                    SortBy = sortBy,
                    SortOrder = sortOrder
                };

                var history = await _deviceHistoryService.GetAllHistoryAsync(filter);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all device history");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving device history");
            }
        }

        /// <summary>
        /// Get device history timeline
        /// </summary>
        [HttpGet("timeline")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<DeviceHistoryTimelineDto>>> GetHistoryTimeline(
            [FromQuery] Guid? deviceId = null,
            [FromQuery] Guid? userId = null,
            [FromQuery] string? action = null,
            [FromQuery] string? actionType = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                if (!await CanAccessHistoryFilterAsync(deviceId, userId))
                    return Forbid();

                var filter = new DeviceHistoryFilterDto
                {
                    DeviceId = deviceId,
                    UserId = userId,
                    Action = action,
                    ActionType = actionType,
                    FromDate = fromDate,
                    ToDate = toDate
                };

                var timeline = await _deviceHistoryService.GetHistoryTimelineAsync(filter);
                return Ok(timeline);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device history timeline");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving history timeline");
            }
        }

        /// <summary>
        /// Get device history statistics
        /// </summary>
        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<DeviceHistoryStatsDto>> GetHistoryStats(
            [FromQuery] Guid? deviceId = null,
            [FromQuery] Guid? userId = null,
            [FromQuery] DateTime? fromDate = null)
        {
            try
            {
                if (!await CanAccessHistoryFilterAsync(deviceId, userId))
                    return Forbid();

                var stats = await _deviceHistoryService.GetHistoryStatsAsync(deviceId, userId, fromDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device history statistics");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving history statistics");
            }
        }

        /// <summary>
        /// Get specific history record by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DeviceHistoryDto>> GetHistoryById(Guid id)
        {
            try
            {
                var history = await _deviceHistoryService.GetHistoryByIdAsync(id);
                if (history == null)
                {
                    return NotFound($"History record with ID {id} not found");
                }

                if (!await CanAccessDeviceAsync(history.DeviceId))
                    return Forbid();

                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history by ID {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving history record");
            }
        }

        /// <summary>
        /// Log a new device action
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> LogAction([FromBody] CreateDeviceHistoryDto createHistoryDto)
        {
            try
            {
                if (!User.IsInRole("Admin"))
                    return Forbid();

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("User ID not found in token");
                }

                await _deviceHistoryService.LogActionAsync(
                    createHistoryDto.DeviceId,
                    createHistoryDto.Action,
                    userId,
                    createHistoryDto.Description,
                    createHistoryDto.ActionType);

                return StatusCode(StatusCodes.Status201Created, "Action logged successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging device action");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error logging action");
            }
        }

        /// <summary>
        /// Log multiple device actions in bulk
        /// </summary>
        [HttpPost("bulk")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> LogBulkActions([FromBody] BulkDeviceHistoryDto bulkHistoryDto)
        {
            try
            {
                if (!User.IsInRole("Admin"))
                    return Forbid();

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("User ID not found in token");
                }

                await _deviceHistoryService.LogBulkActionsAsync(bulkHistoryDto.Histories, userId);
                return StatusCode(StatusCodes.Status201Created, $"{bulkHistoryDto.Histories.Count} actions logged successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging bulk device actions");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error logging bulk actions");
            }
        }

        /// <summary>
        /// Get available actions for filtering
        /// </summary>
        [HttpGet("available-actions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<string>>> GetAvailableActions()
        {
            try
            {
                var actions = await _deviceHistoryService.GetAvailableActionsAsync();
                return Ok(actions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available actions");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving available actions");
            }
        }

        /// <summary>
        /// Get available action types for filtering
        /// </summary>
        [HttpGet("available-action-types")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<string>>> GetAvailableActionTypes()
        {
            try
            {
                var actionTypes = await _deviceHistoryService.GetAvailableActionTypesAsync();
                return Ok(actionTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available action types");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving available action types");
            }
        }

        /// <summary>
        /// Delete a history record (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> DeleteHistory(Guid id)
        {
            try
            {
                var deleted = await _deviceHistoryService.DeleteHistoryAsync(id);
                if (!deleted)
                {
                    return NotFound($"History record with ID {id} not found");
                }

                return Ok("History record deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting history record {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error deleting history record");
            }
        }

        /// <summary>
        /// Clean up old history records (Admin only)
        /// </summary>
        [HttpDelete("cleanup")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> CleanupOldHistory([FromQuery] DateTime beforeDate)
        {
            try
            {
                var deletedCount = await _deviceHistoryService.CleanupOldHistoryAsync(beforeDate);
                return Ok($"Cleaned up {deletedCount} old history records");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old history records");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error cleaning up history records");
            }
        }

        private Guid? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        private async Task<bool> CanAccessHistoryFilterAsync(Guid? deviceId, Guid? userId)
        {
            if (User.IsInRole("Admin")) return true;

            var hasAllowedFilter = false;

            if (deviceId.HasValue)
            {
                if (!await CanAccessDeviceAsync(deviceId.Value))
                    return false;

                hasAllowedFilter = true;
            }

            if (userId.HasValue)
            {
                if (!await CanAccessUserAsync(userId.Value))
                    return false;

                hasAllowedFilter = true;
            }

            return hasAllowedFilter;
        }

        private async Task<bool> CanAccessUserAsync(Guid targetUserId)
        {
            if (User.IsInRole("Admin")) return true;

            var currentUserId = GetCurrentUserId();
            if (currentUserId == null) return false;
            if (currentUserId.Value == targetUserId) return true;

            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            if (currentUser?.Position != "Trưởng phòng" || currentUser.DepartmentId == null)
                return false;

            return await _context.Users.AnyAsync(u =>
                u.Id == targetUserId &&
                u.DepartmentId == currentUser.DepartmentId);
        }

        private async Task<bool> CanAccessDeviceAsync(Guid deviceId)
        {
            if (User.IsInRole("Admin")) return true;

            var currentUserId = GetCurrentUserId();
            if (currentUserId == null) return false;

            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value);

            if (currentUser == null) return false;

            if (currentUser.Position == "Kỹ thuật viên")
            {
                return await _context.Repairs.AnyAsync(r =>
                    r.DeviceId == deviceId &&
                    r.AssignedToTechnicianId == currentUserId.Value);
            }

            if (currentUser.Position == "Trưởng phòng" && currentUser.DepartmentId.HasValue)
            {
                return await _context.Devices.AnyAsync(d =>
                    d.Id == deviceId &&
                    d.CurrentDepartmentId == currentUser.DepartmentId.Value &&
                    d.IsDeleted != true);
            }

            return await _context.Devices.AnyAsync(d =>
                d.Id == deviceId &&
                d.CurrentUserId == currentUserId.Value &&
                d.IsDeleted != true);
        }
    }
}
