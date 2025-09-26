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

        // ADMIN: Phân trang tất cả thiết bị (chưa bị xoá)
        [HttpGet("paged")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDevicesPaged(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] Guid? modelId = null)
        {
            var result = await _deviceService.GetPagedDevicesAsync(page, pageSize, search, status, modelId);
            return Ok(result);
        }

        // ADMIN: Lấy tất cả thiết bị (dùng cho dropdown, filter,...)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<DeviceDto>>> GetAll([FromQuery] bool includeDeleted = false)
        {
            var result = await _deviceService.GetAllDevicesAsync(includeDeleted);
            return Ok(result);
        }

        // ADMIN: Lấy tất cả thiết bị cho admin xem trong danh sách chính
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<DeviceDto>>> GetAllForAdmin([FromQuery] bool includeDeleted = false)
        {
            var result = await _deviceService.GetAllDevicesAsync(includeDeleted);
            return Ok(result);
        }

        // DEBUG: Kiểm tra thông tin user hiện tại
        [HttpGet("debug/user-info")]
        [Authorize]
        public IActionResult GetCurrentUserInfo()
        {
            var userInfo = new
            {
                UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Email = User.FindFirst(ClaimTypes.Email)?.Value,
                Role = User.FindFirst(ClaimTypes.Role)?.Value,
                Position = User.FindFirst("position")?.Value,
                IsAdmin = User.IsInRole("Admin"),
                AllClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            };
            return Ok(userInfo);
        }

        // ADMIN: Lấy danh sách thiết bị đã bị xoá mềm
        [HttpGet("deleted")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<DeviceDto>>> GetDeletedDevices()
        {
            var devices = await _deviceService.GetDeletedDevicesAsync();
            return Ok(devices);
        }

        // ADMIN: Khôi phục thiết bị đã xoá
        [HttpPut("restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RestoreDevice(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized("Không xác định được người dùng.");

            var result = await _deviceService.RestoreDeviceAsync(id);
            return result ? Ok("Khôi phục thiết bị thành công.") : NotFound("Thiết bị không tồn tại hoặc chưa bị xoá.");
        }

        // USER: Lấy danh sách thiết bị đang quản lý
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

        // MANAGER: Lấy danh sách thiết bị của phòng ban quản lý
        [HttpGet("managed")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<IEnumerable<DeviceDto>>> GetManagedDevices()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var position = User.FindFirst("position")?.Value;
            
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized("Không xác định được tài khoản người dùng.");
            
            // Chỉ Trưởng phòng mới được xem thiết bị của phòng ban
            if (position != "Trưởng phòng")
                return Forbid("Chỉ Trưởng phòng mới có quyền xem thiết bị của phòng ban.");

            var managedDevices = await _deviceService.GetDevicesByManagedDepartmentAsync(userId);
            return Ok(managedDevices);
        }

        // ADMIN + USER: Xem chi tiết thiết bị
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

        // ADMIN: Tạo thiết bị mới
        // [HttpPost]
        // [Authorize(Roles = "Admin")]
        // public async Task<IActionResult> CreateDevice([FromBody] CreateDeviceDto dto)
        // {
        //     try
        //     {
        //         bool result = await _deviceService.CreateDeviceAsync(dto);
        //         return result ? Ok("Thiết bị đã được thêm.") : BadRequest("Tạo thiết bị thất bại.");
        //     }
        //     catch (InvalidOperationException ex)
        //     {
        //         return BadRequest(new { message = ex.Message });
        //     }
        // }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateDevice([FromForm] CreateDeviceDto dto, IFormFile? file)
        {

            if (file != null && file.Length > 0)
            {
                // Validate loại file
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest("Chỉ hỗ trợ file ảnh JPG/PNG.");

                // Validate dung lượng (< 5MB)
                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest("Dung lượng ảnh vượt quá 5MB.");

                // Đảm bảo thư mục tồn tại
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "devices");
                if (!Directory.Exists(uploadDir))
                    Directory.CreateDirectory(uploadDir);

                // Tạo tên file duy nhất
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // URL đầy đủ
                var request = HttpContext.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";
                dto.DeviceImageUrl = $"/images/devices/{fileName}";
            }

            try
            {
                var createdDevice = await _deviceService.CreateDeviceWithReturnAsync(dto);
                return Ok(new { 
                    message = "Thiết bị đã được thêm thành công.",
                    device = createdDevice 
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        
    }


        // ADMIN: Cập nhật thông tin thiết bị
        // Cập nhật thiết bị
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateDevice(Guid id, [FromForm] UpdateDeviceDto dto, IFormFile? file)
        {
            var entity = await _deviceService.GetDeviceByIdAsync(id, null, true);
            if (entity == null)
                return NotFound("Thiết bị không tồn tại hoặc đã bị xoá.");

            // Nếu có file mới thì upload và xoá file cũ
            if (file != null && file.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest("Chỉ hỗ trợ file ảnh JPG/PNG.");

                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest("Dung lượng ảnh vượt quá 5MB.");

                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "devices");
                if (!Directory.Exists(uploadDir))
                    Directory.CreateDirectory(uploadDir);

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Xoá ảnh cũ nếu có
                if (!string.IsNullOrEmpty(entity.DeviceImageUrl))
                {
                    var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", 
                        entity.DeviceImageUrl.Replace($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}", "").TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                var request = HttpContext.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";
                dto.DeviceImageUrl = $"/images/devices/{fileName}";
            }
            else
            {
                // Giữ nguyên ảnh cũ
                dto.DeviceImageUrl = entity.DeviceImageUrl;
            }

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized("Không xác định được người dùng.");

            dto.UpdatedBy = userId;

            bool result = await _deviceService.UpdateDeviceAsync(id, dto);
            return result ? Ok("Cập nhật thành công.") : BadRequest("Cập nhật thất bại.");
        }

        // Xoá mềm thiết bị
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDevice(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized("Không xác định được người dùng xoá.");

            try
            {
                bool result = await _deviceService.DeleteDeviceAsync(id, userId);
                return result ? Ok("Xoá thiết bị thành công.") : NotFound("Thiết bị không tồn tại hoặc đã bị xoá.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File rỗng.");

            // Đảm bảo thư mục tồn tại
            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "devices");
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            // Tạo tên file duy nhất
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // URL trả về cho frontend
            var imageUrl = $"/images/devices/{fileName}";
            return Ok(new { imageUrl });
        }
        [HttpGet("scan/{id}")]
        [Authorize] // Có thể truy cập từ app/mobile
        public async Task<IActionResult> ScanDevice(string qrCode)
        {
            var result = await _deviceService.ScanDeviceAsync(qrCode);

            if (result == null)
                return NotFound("Không tìm thấy thiết bị với mã QR này");

            return Ok(result);
        }

    }
}
