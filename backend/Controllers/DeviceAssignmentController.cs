using backend.Models.DTOs;
using backend.Services.Interfaces;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DeviceAssignmentController : ControllerBase
    {
        private readonly IDeviceAssignmentService _service;
        private readonly DeviceManagementDbContext _context;
        private readonly INotificationService _notificationService;

        public DeviceAssignmentController(IDeviceAssignmentService service, DeviceManagementDbContext context, INotificationService notificationService)
        {
            _service = service;
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Nếu là user thường → chỉ xem thiết bị mình được cấp
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var result = await _service.GetAllAsync();
            
            if (role != "Admin" && Guid.TryParse(userIdStr, out var userId))
            {
                // Lọc theo user hiện tại
                var filtered = result.Where(x => x.AssignedToUserId == userId);
                return Ok(filtered);
            }

            // Admin thấy tất cả
            return Ok(result);
        }

        [HttpGet("unassigned")]
        public async Task<IActionResult> GetUnassigned(
            [FromQuery] string? deviceCode = null,
            [FromQuery] string? modelName = null,
            [FromQuery] string? status = null)
        {
            try
            {
                // Base query for unassigned devices
                var query = _context.Devices
                    .Include(d => d.Model)
                        .ThenInclude(m => m!.DeviceType)
                    .Where(d => (d.Status == "Chưa cấp phát" || d.Status == "Sẵn sàng")
                                && (!d.IsDeleted.HasValue || !d.IsDeleted.Value));

                // Apply filters
                if (!string.IsNullOrEmpty(deviceCode))
                {
                    query = query.Where(d => d.DeviceCode.Contains(deviceCode));
                }

                if (!string.IsNullOrEmpty(modelName))
                {
                    query = query.Where(d => d.Model != null && d.Model.ModelName.Contains(modelName));
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(d => d.Status == status);
                }

                var unassignedDevices = await query
                    .Select(d => new UnassignedDeviceDto
                    {
                        Id = d.Id,
                        DeviceId = d.Id,
                        DeviceName = d.DeviceName,
                        DeviceCode = d.DeviceCode,
                        Status = d.Status,
                        ModelName = d.Model != null ? d.Model.ModelName : null,
                        DeviceTypeName = d.Model != null && d.Model.DeviceType != null ? d.Model.DeviceType.TypeName : null
                    })
                    .ToListAsync();
                    
                return Ok(unassignedDevices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("inuse")]
        public async Task<IActionResult> GetInUse()
        {
            try
            {
                // Lấy tất cả thiết bị đang sử dụng với thông tin assignment
                var inUseDevices = await _context.DeviceAssignments
                    .Include(da => da.Device)
                        .ThenInclude(d => d!.Model)
                            .ThenInclude(m => m!.DeviceType)
                    .Include(da => da.AssignedToUser)
                    .Include(da => da.AssignedToDepartment)
                    .Where(da => da.ReturnedDate == null // Chưa trả lại
                                && da.Device!.Status == "Đang sử dụng"
                                && da.IsDeleted != true
                                && da.Device.IsDeleted != true)
                    .Select(da => new 
                    {
                        Id = da.Id, // Assignment ID cho revoke/transfer
                        DeviceId = da.DeviceId,
                        DeviceName = da.Device!.DeviceName,
                        DeviceCode = da.Device.DeviceCode,
                        Status = da.Device.Status,
                        ModelName = da.Device.Model != null ? da.Device.Model.ModelName : null,
                        DeviceTypeName = da.Device.Model != null && da.Device.Model.DeviceType != null ? da.Device.Model.DeviceType.TypeName : null,
                        AssignedToUserName = da.AssignedToUser != null ? da.AssignedToUser.FullName : null,
                        AssignedToDepartmentName = da.AssignedToDepartment != null ? da.AssignedToDepartment.DepartmentName : null,
                        AssignedToUserId = da.AssignedToUserId,
                        AssignedToDepartmentId = da.AssignedToDepartmentId,
                        AssignedDate = da.AssignedDate, // Thêm assignedDate
                        Note = da.Note
                    })
                    .ToListAsync();
                    
                return Ok(inUseDevices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (role != "Admin" && Guid.TryParse(userIdStr, out var userId))
            {
                if (result.AssignedToUserId != userId)
                    return Forbid();
            }

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateDeviceAssignmentDto dto)
        {
            try
            {
                Console.WriteLine($"🎯 Controller.Create called with DTO: DeviceId={dto.DeviceId}, UserId={dto.AssignedToUserId}, DeptId={dto.AssignedToDepartmentId}");
                
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                Console.WriteLine($"👤 Current user ID: {currentUserId}");
                
                var result = await _service.CreateAsync(dto, currentUserId);
                
                if (result == null)
                {
                    Console.WriteLine("❌ Service returned null - BadRequest");
                    return BadRequest(new { message = "Assignment creation failed. Check device availability, user validity, and department." });
                }
                
                // Send notification to user about device assignment
                await _notificationService.NotifyDeviceAssignedAsync(result.Id);
                
                Console.WriteLine("✅ Assignment created successfully");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 Controller exception: {ex.Message}");
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // Update không có trong service hiện tại - comment lại
        // [HttpPut("{id}")]
        // [Authorize(Roles = "Admin")]
        // public async Task<IActionResult> Update(Guid id, UpdateDeviceAssignmentDto dto)
        // {
        //     var result = await _service.UpdateAsync(id, dto);
        //     return result == null ? NotFound() : Ok(result);
        // }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _service.SoftDeleteAsync(id, currentUserId);
            return success ? Ok() : NotFound();
        }
        [HttpPost("{id}/revoke")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Revoke(Guid id)
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _service.RevokeAsync(id, currentUserId);
            return success ? Ok() : BadRequest();
        }

        [HttpPost("{id}/transfer")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Transfer(Guid id, [FromBody] CreateDeviceAssignmentDto dto)
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _service.TransferAsync(id, dto, currentUserId);
            return result == null ? BadRequest() : Ok(result);
        }
        
        [HttpPost("transfer")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TransferNew([FromBody] TransferDeviceAssignmentDto dto)
        {
            try
            {
                Console.WriteLine($"📡 Transfer API called with: oldAssignmentId={dto.OldAssignmentId}, newUserId={dto.NewUserId}");
                
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                
                var transferDto = new CreateDeviceAssignmentDto
                {
                    DeviceId = Guid.Empty, // Sẽ lấy từ assignment cũ
                    AssignedToUserId = dto.NewUserId,
                    AssignedToDepartmentId = dto.NewDepartmentId,
                    Note = dto.Note
                };
                
                var result = await _service.TransferAsync(dto.OldAssignmentId, transferDto, currentUserId);
                
                if (result != null)
                {
                    // Send notification to new user about device assignment
                    await _notificationService.NotifyDeviceAssignedAsync(result.Id);
                }
                
                return result == null ? BadRequest() : Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 Transfer error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

    }
}
