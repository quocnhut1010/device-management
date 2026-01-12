namespace backend.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl);
        Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        Task<bool> SendRepairAssignmentEmailAsync(string email, Guid repairId, string deviceCode, string? description);
    }
}

