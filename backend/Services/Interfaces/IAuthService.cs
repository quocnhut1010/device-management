using backend.Models.DTOs;
using backend.Models.Entities;
using System.Security.Claims;

namespace backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<string?> AuthenticateAsync(LoginDto loginDto);
        Task<string?> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
        string? GetCurrentUserPosition(ClaimsPrincipal user);
        Guid? GetCurrentUserId(ClaimsPrincipal user);
        bool IsAdmin(ClaimsPrincipal user);
    }
}
