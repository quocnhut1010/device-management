using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Chỉ Admin mới được thanh lý
    public class LiquidationController : ControllerBase
    {
        private readonly ILiquidationService _liquidationService;

        public LiquidationController(ILiquidationService liquidationService)
        {
            _liquidationService = liquidationService;
        }

        /// <summary>
        /// Lấy danh sách thiết bị đủ điều kiện thanh lý
        /// </summary>
        [HttpGet("eligible-devices")]
        public async Task<ActionResult<IEnumerable<LiquidationEligibleDeviceDto>>> GetEligibleDevices()
        {
            try
            {
                var devices = await _liquidationService.GetEligibleDevicesAsync();
                return Ok(devices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách thiết bị: " + ex.Message });
            }
        }

        /// <summary>
        /// Kiểm tra thiết bị có đủ điều kiện thanh lý không
        /// </summary>
        [HttpGet("eligible/{deviceId}")]
        public async Task<ActionResult<bool>> CheckDeviceEligibility(Guid deviceId)
        {
            try
            {
                var isEligible = await _liquidationService.IsDeviceEligibleForLiquidationAsync(deviceId);
                return Ok(new { eligible = isEligible });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi kiểm tra điều kiện: " + ex.Message });
            }
        }

        /// <summary>
        /// Thanh lý một thiết bị
        /// </summary>
        [HttpPost("single")]
        public async Task<ActionResult<LiquidationDto>> LiquidateSingleDevice([FromBody] CreateLiquidationDto dto)
        {
            try
            {
                var adminIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(adminIdStr, out Guid adminId))
                {
                    return Unauthorized(new { message = "Không xác định được Admin" });
                }

                var result = await _liquidationService.LiquidateDeviceAsync(dto, adminId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thanh lý thiết bị: " + ex.Message });
            }
        }

        /// <summary>
        /// Thanh lý nhiều thiết bị cùng lúc
        /// </summary>
        [HttpPost("batch")]
        public async Task<ActionResult<IEnumerable<LiquidationDto>>> LiquidateBatch([FromBody] BatchLiquidationDto dto)
        {
            try
            {
                var adminIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(adminIdStr, out Guid adminId))
                {
                    return Unauthorized(new { message = "Không xác định được Admin" });
                }

                var results = await _liquidationService.LiquidateBatchAsync(dto, adminId);
                return Ok(new 
                { 
                    message = $"Đã thanh lý thành công {results.Count()} thiết bị",
                    liquidations = results
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thanh lý nhiều thiết bị: " + ex.Message });
            }
        }

        /// <summary>
        /// Lấy lịch sử thanh lý
        /// </summary>
        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<LiquidationDto>>> GetLiquidationHistory()
        {
            try
            {
                var history = await _liquidationService.GetLiquidationHistoryAsync();
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy lịch sử thanh lý: " + ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết một bản ghi thanh lý
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<LiquidationDto>> GetLiquidationById(Guid id)
        {
            try
            {
                var liquidation = await _liquidationService.GetLiquidationByIdAsync(id);
                if (liquidation == null)
                {
                    return NotFound(new { message = "Không tìm thấy bản ghi thanh lý" });
                }

                return Ok(liquidation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết thanh lý: " + ex.Message });
            }
        }
    }
}