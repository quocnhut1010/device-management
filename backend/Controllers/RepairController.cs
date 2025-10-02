using backend.Models.DTOs;
using backend.Services.Interfaces;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Models.Entities;



namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RepairController : ControllerBase
    {
        private readonly IRepairService _repairService;
        private readonly IAuthService _authService;
        private readonly DeviceManagementDbContext _context;

        public RepairController(
            IRepairService repairService,
            IAuthService authService,
            DeviceManagementDbContext context)
        {
            _repairService = repairService;
            _authService = authService;
            _context = context;
        }

        private Guid? GetUserId() => _authService.GetCurrentUserId(User);
        private string? GetPosition() => _authService.GetCurrentUserPosition(User);

        // GET: api/repair - Admin xem tất cả lệnh sửa chữa
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _repairService.GetAllAsync();
            return Ok(result);
        }

        // GET: api/repair/mine - Kỹ thuật viên xem lệnh sửa của mình
        [HttpGet("mine")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyRepairs()
        {
            var position = GetPosition();
            if (position != "Kỹ thuật viên")
                return Forbid("Chỉ kỹ thuật viên mới có thể xem lệnh sửa chữa");

            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var result = await _repairService.GetMyRepairsAsync(userId.Value);
            return Ok(result);
        }

        // GET: api/repair/{id} - Xem chi tiết một lệnh sửa chữa
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _repairService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        // GET: api/repair/technicians - Lấy danh sách kỹ thuật viên để phân công
        [HttpGet("technicians")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAvailableTechnicians()
        {
            try
            {
                var result = await _repairService.GetAvailableTechniciansAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi lấy danh sách kỹ thuật viên",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // Debug API - Lấy tất cả users để kiểm tra
        [HttpGet("debug-users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DebugGetAllUsers()
        {
            try
            {
                var allUsers = await _context.Users
                    .Select(u => new
                    {
                        u.Id,
                        u.FullName,
                        u.Email,
                        u.Position,
                        u.IsActive,
                        IsDeleted = u.IsDeleted.GetValueOrDefault()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalUsers = allUsers.Count,
                    activeUsers = allUsers.Count(u => u.IsActive == true && !u.IsDeleted),
                    technicians = allUsers.Where(u => u.Position != null && u.Position.Contains("kỹ thuật")),
                    allUsers = allUsers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/repair/{repairId}/assign - Admin phân công kỹ thuật viên
        [HttpPost("{repairId}/assign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignTechnician(Guid repairId, [FromBody] AssignTechnicianDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var success = await _repairService.AssignTechnicianAsync(repairId, dto.TechnicianId, userId.Value, dto.Note);
            if (!success)
                return BadRequest(new { message = "Không thể phân công kỹ thuật viên cho lệnh sửa chữa này" });

            return Ok(new { message = "Đã phân công kỹ thuật viên thành công" });
        }

        // POST: api/repair/{repairId}/accept - Kỹ thuật viên chấp nhận lệnh sửa
        [HttpPost("{repairId}/accept")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> AcceptRepair(Guid repairId)
        {
            var userId = GetUserId();
            var position = GetPosition();

            if (position != "Kỹ thuật viên")
                return Forbid("Chỉ kỹ thuật viên mới có thể chấp nhận lệnh sửa chữa");

            if (userId == null) return Unauthorized();

            var success = await _repairService.AcceptRepairAsync(repairId, userId.Value);
            if (!success)
                return BadRequest(new { message = "Không thể chấp nhận lệnh sửa chữa này" });

            return Ok(new { message = "Đã chấp nhận lệnh sửa chữa" });
        }

        // POST: api/repair/{repairId}/complete - Kỹ thuật viên hoàn thành sửa chữa
        [HttpPost("{repairId}/complete")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> CompleteRepair(Guid repairId, [FromBody] RepairRequestDto dto)
        {
            var userId = GetUserId();
            var position = GetPosition();

            if (position != "Kỹ thuật viên")
                return Forbid("Chỉ kỹ thuật viên mới có thể hoàn thành sửa chữa");

            if (userId == null) return Unauthorized();

            var success = await _repairService.CompleteRepairAsync(repairId, dto, userId.Value);
            if (!success)
                return BadRequest(new { message = "Không thể hoàn thành lệnh sửa chữa này" });

            return Ok(new { message = "Đã hoàn thành sửa chữa, chờ admin duyệt" });
        }

        // POST: api/repair/{repairId}/confirm-completion - Admin xác nhận hoàn tất
        [HttpPost("{repairId}/confirm-completion")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ConfirmCompletion(Guid repairId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var success = await _repairService.ConfirmCompletionAsync(repairId, userId.Value);
            if (!success)
                return BadRequest(new { message = "Không thể xác nhận hoàn tất lệnh sửa chữa này" });

            return Ok(new { message = "Đã xác nhận hoàn tất sửa chữa" });
        }

        // POST: api/repair/{repairId}/reject - Kỹ thuật viên từ chối lệnh sửa
        [HttpPost("{repairId}/reject")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> RejectRepair(Guid repairId, [FromBody] RejectRepairDto dto)
        {
            var userId = GetUserId();
            var position = GetPosition();

            if (position != "Kỹ thuật viên")
                return Forbid("Chỉ kỹ thuật viên mới có thể từ chối lệnh sửa chữa");

            if (userId == null) return Unauthorized();

            var success = await _repairService.RejectRepairAsync(repairId, dto.Reason, userId.Value);
            if (!success)
                return BadRequest(new { message = "Không thể từ chối lệnh sửa chữa này" });

            return Ok(new { message = "Đã từ chối lệnh sửa chữa" });
        }

        // POST: api/repair/{repairId}/not-needed - Kỹ thuật viên đánh dấu "không cần sửa"
        [HttpPost("{repairId}/not-needed")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> MarkAsNotNeeded(Guid repairId, [FromBody] NotNeededRepairDto dto)
        {
            var userId = GetUserId();
            var position = GetPosition();

            if (position != "Kỹ thuật viên")
                return Forbid("Chỉ kỹ thuật viên mới có thể đánh dấu không cần sửa");

            if (userId == null) return Unauthorized();

            var success = await _repairService.MarkAsNotNeededAsync(repairId, dto.Note, userId.Value);
            if (!success)
                return BadRequest(new { message = "Không thể đánh dấu lệnh sửa chữa này" });

            return Ok(new { message = "Đã đánh dấu không cần sửa chữa" });
        }

        // POST: api/repair/{repairId}/reject-or-not-needed - Kỹ thuật viên chọn từ chối hoặc không cần sửa
        [HttpPost("{repairId}/reject-or-not-needed")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> RejectOrMarkNotNeeded(Guid repairId, [FromBody] RejectOrNotNeededDto dto)
        {
            var userId = GetUserId();
            var position = GetPosition();

            if (position != "Kỹ thuật viên")
                return Forbid("Chỉ kỹ thuật viên mới có thể thực hiện thao tác này");

            if (userId == null) return Unauthorized();

            // Kiểm tra status hợp lệ
            if (dto.Status != RepairStatus.TuChoi && dto.Status != RepairStatus.KhongCanSua)
            {
                return BadRequest(new { message = "Trạng thái không hợp lệ. Chỉ chấp nhận 4 (Từ chối) hoặc 5 (Không cần sửa)" });
            }

            var success = await _repairService.RejectOrMarkNotNeededAsync(repairId, dto, userId.Value);
            if (!success)
                return BadRequest(new { message = "Không thể thực hiện thao tác này" });

            var message = dto.Status == RepairStatus.TuChoi
                ? "Đã từ chối lệnh sửa chữa"
                : "Đã đánh dấu không cần sửa chữa";

            return Ok(new { message });
        }
        [HttpPost("{repairId}/upload-images")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> UploadRepairImages(Guid repairId, [FromForm] List<IFormFile> files)
        {
            var userId = GetUserId();
            var position = GetPosition();

            if (position != "Kỹ thuật viên") return Forbid();
            if (userId == null) return Unauthorized();

            if (files == null || files.Count == 0)
                return BadRequest(new { message = "Không có file nào được chọn" });

            var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "repairs");
            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            var imageUrls = new List<string>();

            foreach (var file in files)
            {
                var fileExt = Path.GetExtension(file.FileName).ToLower();
                if (fileExt != ".jpg" && fileExt != ".jpeg" && fileExt != ".png")
                    return BadRequest(new { message = "Chỉ chấp nhận định dạng JPG hoặc PNG" });

                var fileName = $"{Guid.NewGuid()}{fileExt}";
                var filePath = Path.Combine(uploadFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = $"/images/repairs/{fileName}";
                imageUrls.Add(relativePath);

                // Lưu vào DB
                var repairImage = new RepairImage
                {
                    Id = Guid.NewGuid(),
                    RepairId = repairId,
                    ImageUrl = relativePath,
                    IsAfterRepair = true,
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = userId
                };

                _context.RepairImages.Add(repairImage);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã tải ảnh thành công", imageUrls });
        }

    }
}
