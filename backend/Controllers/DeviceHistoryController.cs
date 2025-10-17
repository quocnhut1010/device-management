using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Services.Interfaces;
using backend.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DeviceHistoryController : ControllerBase
    {
        private readonly IDeviceHistoryService _deviceHistoryService;
        private readonly ILogger<DeviceHistoryController> _logger;

        public DeviceHistoryController(
            IDeviceHistoryService deviceHistoryService,
            ILogger<DeviceHistoryController> logger)
        {
            _deviceHistoryService = deviceHistoryService;
            _logger = logger;
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
        [Authorize(Roles = "Admin,Manager")]
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
    }
}