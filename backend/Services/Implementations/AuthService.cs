using backend.Models.DTOs;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Models.Entities;

namespace backend.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;
        private readonly PasswordHasher<User> _hasher = new();

        public AuthService(IUserRepository userRepo, IConfiguration config, IEmailService emailService)
        {
            _userRepo = userRepo;
            _config = config;
            _emailService = emailService;
        }

        public async Task<string?> AuthenticateAsync(LoginDto loginDto)
        {
            var user = await _userRepo.GetByEmailAsync(loginDto.Email);
            if (user?.IsDeleted == true || user?.IsActive == false)
            {
                return null;
            }

            var result = _hasher.VerifyHashedPassword(user!, user!.PasswordHash!, loginDto.Password!);
            if (result == PasswordVerificationResult.Failed)
                return null;

            // Create JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured");
            var key = Encoding.UTF8.GetBytes(keyString);


            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, user.Role ?? "User"),
                new Claim("position", user.Position ?? "") 
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(6),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string? GetCurrentUserPosition(ClaimsPrincipal user)
        {
            return user.FindFirst("position")?.Value;
        }

        public Guid? GetCurrentUserId(ClaimsPrincipal user)
        {
            var userIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                return userId;
            }
            return null;
        }

        public bool IsAdmin(ClaimsPrincipal user)
        {
            var role = user.FindFirst(ClaimTypes.Role)?.Value;
            return role == "Admin";
        }

        public async Task<string?> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            Console.WriteLine($"[AuthService] ===== Starting ForgotPassword process =====");
            Console.WriteLine($"[AuthService] Requested email: {dto.Email}");
            
            // Lookup user by email
            Console.WriteLine($"[AuthService] Step 1: Looking up user by email...");
            var user = await _userRepo.GetByEmailAsync(dto.Email);
            
            if (user == null)
            {
                Console.WriteLine($"[AuthService] ✗ User not found with email: {dto.Email}");
                Console.WriteLine($"[AuthService] ⚠ Returning early (security: don't reveal if email exists)");
                Console.WriteLine($"[AuthService] ===== ForgotPassword process ended (user not found) =====");
                // Don't reveal if user exists for security
                return null;
            }
            
            Console.WriteLine($"[AuthService] ✓ User found: ID={user.Id}, Email={user.Email}, FullName={user.FullName}");
            
            // Check if user is deleted
            if (user.IsDeleted == true)
            {
                Console.WriteLine($"[AuthService] ✗ User is deleted (IsDeleted=true)");
                Console.WriteLine($"[AuthService] ⚠ Returning early (security: don't reveal if email exists)");
                Console.WriteLine($"[AuthService] ===== ForgotPassword process ended (user deleted) =====");
                return null;
            }
            
            // Check if user is inactive
            if (user.IsActive == false)
            {
                Console.WriteLine($"[AuthService] ✗ User is inactive (IsActive=false)");
                Console.WriteLine($"[AuthService] ⚠ Returning early (security: don't reveal if email exists)");
                Console.WriteLine($"[AuthService] ===== ForgotPassword process ended (user inactive) =====");
                return null;
            }
            
            Console.WriteLine($"[AuthService] ✓ User is valid (not deleted, active)");

            // Generate secure random token
            Console.WriteLine($"[AuthService] Step 2: Generating secure reset token...");
            var tokenBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(tokenBytes);
            }
            var token = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
            Console.WriteLine($"[AuthService] ✓ Token generated: {token.Substring(0, Math.Min(20, token.Length))}...");

            // Set token and expiry (1 hour from now)
            Console.WriteLine($"[AuthService] Step 3: Updating user with reset token...");
            user.ResetPasswordToken = token;
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);
            Console.WriteLine($"[AuthService] Token expiry set to: {user.ResetPasswordTokenExpiry:yyyy-MM-dd HH:mm:ss} UTC");

            try
            {
                await _userRepo.UpdateAsync(user);
                Console.WriteLine($"[AuthService] ✓ User entity updated in repository");
                
                await _userRepo.SaveChangesAsync();
                Console.WriteLine($"[AuthService] ✓ Changes saved to database successfully");
            }
            catch (Exception dbEx)
            {
                Console.WriteLine($"[AuthService] ✗ Database update failed!");
                Console.WriteLine($"[AuthService] Exception Type: {dbEx.GetType().Name}");
                Console.WriteLine($"[AuthService] Exception Message: {dbEx.Message}");
                Console.WriteLine($"[AuthService] Stack Trace: {dbEx.StackTrace}");
                if (dbEx.InnerException != null)
                {
                    Console.WriteLine($"[AuthService] Inner Exception: {dbEx.InnerException.Message}");
                }
                Console.WriteLine($"[AuthService] ⚠ Returning early due to database error");
                Console.WriteLine($"[AuthService] ===== ForgotPassword process ended (database error) =====");
                // Don't reveal error to user for security
                return null;
            }

            // Build reset password URL
            Console.WriteLine($"[AuthService] Step 4: Building reset password URL...");
            var baseUrl = _config["App:BaseUrl"] ?? "http://localhost:5173";
            var resetUrl = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(dto.Email)}";
            Console.WriteLine($"[AuthService] ✓ Reset URL: {resetUrl}");

            // Send email with reset link
            Console.WriteLine($"[AuthService] Step 5: Sending password reset email...");
            try
            {
                var emailSent = await _emailService.SendPasswordResetEmailAsync(dto.Email, token, resetUrl);
                
                if (emailSent)
                {
                    Console.WriteLine($"[AuthService] ✓ Password reset email sent successfully to {dto.Email}");
                    Console.WriteLine($"[AuthService] ===== ForgotPassword process completed successfully =====");
                }
                else
                {
                    Console.WriteLine($"[AuthService] ✗ FAILED to send password reset email to {dto.Email}");
                    Console.WriteLine($"[AuthService] ⚠ WARNING: Token was generated and saved but email was not sent!");
                    Console.WriteLine($"[AuthService] ⚠ User will not be able to reset password without the token!");
                    Console.WriteLine($"[AuthService] ⚠ Check EmailService logs above for details");
                    Console.WriteLine($"[AuthService] ===== ForgotPassword process completed with email failure =====");
                    // Note: We still return null (success) to not reveal if email exists
                    // But in production, you might want to log this to a monitoring service
                }
            }
            catch (Exception ex)
            {
                // Log error but don't fail the request (security: don't reveal if email exists)
                Console.WriteLine($"[AuthService] ✗ Exception occurred while sending email!");
                Console.WriteLine($"[AuthService] Exception Type: {ex.GetType().Name}");
                Console.WriteLine($"[AuthService] Exception Message: {ex.Message}");
                Console.WriteLine($"[AuthService] Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[AuthService] Inner Exception Type: {ex.InnerException.GetType().Name}");
                    Console.WriteLine($"[AuthService] Inner Exception Message: {ex.InnerException.Message}");
                }
                Console.WriteLine($"[AuthService] ⚠ WARNING: Email sending failed but request will continue (security)");
                Console.WriteLine($"[AuthService] ⚠ Token was generated and saved, but email was not sent");
                Console.WriteLine($"[AuthService] ===== ForgotPassword process completed with exception =====");
                // In production, you might want to log this to a logging service
            }

            // Return null to indicate success (token is sent via email, not in response)
            Console.WriteLine($"[AuthService] Returning success response (security: don't reveal if email exists)");
            return null;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email);
            if (user == null || user.IsDeleted == true || user.IsActive == false)
            {
                return false;
            }

            // Validate token
            if (string.IsNullOrEmpty(user.ResetPasswordToken) || 
                user.ResetPasswordToken != dto.Token ||
                user.ResetPasswordTokenExpiry == null ||
                user.ResetPasswordTokenExpiry < DateTime.UtcNow)
            {
                return false;
            }

            // Hash new password
            user.PasswordHash = _hasher.HashPassword(user, dto.NewPassword);

            // Clear reset token fields
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;

            await _userRepo.UpdateAsync(user);
            await _userRepo.SaveChangesAsync();

            return true;
        }
    }
}
