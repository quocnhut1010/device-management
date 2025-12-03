using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            if (loginDto == null)
                return BadRequest("Dữ liệu đăng nhập không hợp lệ.");

            var token = await _authService.AuthenticateAsync(loginDto);
            if (token == null)
                return Unauthorized("Email hoặc mật khẩu không đúng.");

            return Ok(new { token });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto == null)
                return BadRequest("Dữ liệu không hợp lệ.");

            var token = await _authService.ForgotPasswordAsync(dto);
            // Always return success message for security (don't reveal if email exists)
            // Token is sent via email, not in response
            return Ok(new { 
                message = "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu qua email." 
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto == null)
                return BadRequest("Dữ liệu không hợp lệ.");

            var success = await _authService.ResetPasswordAsync(dto);
            if (!success)
            {
                return BadRequest(new { message = "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới." });
            }

            return Ok(new { message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới." });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto == null)
                return BadRequest("Dữ liệu không hợp lệ.");

            // Get current user ID from JWT token
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out Guid userId))
            {
                return Unauthorized(new { message = "Không xác định được người dùng" });
            }

            try
            {
                var success = await _authService.ChangePasswordAsync(dto, userId);
                if (!success)
                {
                    return BadRequest(new { message = "Mật khẩu cũ không đúng" });
                }

                return Ok(new { message = "Đổi mật khẩu thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi đổi mật khẩu" });
            }
        }
    }
}
