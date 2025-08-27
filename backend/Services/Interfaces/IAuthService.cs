using backend.Models.DTOs;
using backend.Models.Entities;

namespace backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<string?> AuthenticateAsync(LoginDto loginDto);
    }
}
