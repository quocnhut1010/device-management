using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;



namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RepairController : ControllerBase
    {
        private readonly IRepairService _repairService;
        private readonly IAuthService _authService;

        public RepairController(
            IRepairService repairService,
            IAuthService authService)
        {
            _repairService = repairService;
            _authService = authService;
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
    }
}