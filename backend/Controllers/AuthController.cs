using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
    }
}
