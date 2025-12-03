using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Mật khẩu cũ là bắt buộc.")]
        public string OldPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới là bắt buộc.")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Xác nhận mật khẩu là bắt buộc.")]
        [Compare("NewPassword", ErrorMessage = "Mật khẩu xác nhận không khớp với mật khẩu mới.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}

