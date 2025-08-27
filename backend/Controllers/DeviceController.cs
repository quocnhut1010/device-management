// Updated DeviceController.cs
using AutoMapper;
using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceController : ControllerBase
    {
        private readonly IDeviceService _deviceService;

        public DeviceController(IDeviceService deviceService)
        {
            _deviceService = deviceService;
        }

        // ADMIN: Get all devices
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<DeviceDto>>> GetDevices()
        {
            var devices = await _deviceService.GetAllDevicesAsync();
            if (!devices.Any())
                return NotFound("Không có thiết bị nào trong hệ thống.");

            return Ok(devices);
        }

        // USER: Get assigned devices of logged-in user
        [HttpGet("my")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<IEnumerable<DeviceDto>>> GetMyDevices()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized("Không xác định được tài khoản người dùng.");

            var myDevices = await _deviceService.GetDevicesByUserAsync(userId);
            return Ok(myDevices);
        }

        // ADMIN + USER: Get device by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<DeviceDto>> GetDevice(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            bool isAdmin = User.IsInRole("Admin");
            Guid? userId = Guid.TryParse(userIdStr, out Guid uid) ? uid : null;

            var device = await _deviceService.GetDeviceByIdAsync(id, userId, isAdmin);
            if (device == null)
                return Forbid("Bạn không có quyền truy cập thiết bị này hoặc thiết bị không tồn tại.");

            return Ok(device);
        }

        // ADMIN: Create new device
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateDevice([FromBody] DeviceDto dto)
        {
            bool result = await _deviceService.CreateDeviceAsync(dto);
            return result ? Ok("Thiết bị đã được thêm.") : BadRequest("Tạo thiết bị thất bại.");
        }

        // ADMIN: Update device
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateDevice(Guid id, [FromBody] DeviceDto dto)
        {
            bool result = await _deviceService.UpdateDeviceAsync(id, dto);
            return result ? Ok("Cập nhật thành công.") : NotFound("Thiết bị không tồn tại.");
        }

        // ADMIN: Delete device (soft delete)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDevice(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized("Không xác định được người dùng xóa.");

            bool result = await _deviceService.DeleteDeviceAsync(id, userId);
            return result ? Ok("Xóa thiết bị thành công.") : NotFound("Thiết bị không tồn tại.");
        }
    }
}
