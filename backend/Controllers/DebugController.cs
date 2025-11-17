using backend.Services.Interfaces;
using backend.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebugController : ControllerBase
    {
        private readonly IIncidentReportService _incidentService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public DebugController(IIncidentReportService incidentService, IEmailService emailService, IConfiguration configuration)
        {
            _incidentService = incidentService;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost("test-approval/{id}")]
        public async Task<IActionResult> TestApproval(Guid id)
        {
            try
            {
                Console.WriteLine($"🔍 Debug: Starting approval test for ID: {id}");
                
                var updatedBy = "debug-user";
                var result = await _incidentService.ApproveAndCreateRepairAsync(id, updatedBy);
                
                Console.WriteLine($"🔍 Debug: Approval result - Success: {result.Success}, Message: {result.Message}");
                
                if (result.Success)
                {
                    // Return simplified data without navigation properties to avoid cycles
                    var repairData = result.Data as Repair;
                    var simplifiedData = repairData != null ? new {
                        id = repairData.Id,
                        deviceId = repairData.DeviceId,
                        incidentReportId = repairData.IncidentReportId,
                        description = repairData.Description,
                        status = repairData.Status,
                        startDate = repairData.StartDate
                    } : null;
                    
                    return Ok(new { 
                        success = true, 
                        message = result.Message, 
                        data = simplifiedData 
                    });
                }
                else
                {
                    return BadRequest(new { 
                        success = false, 
                        message = result.Message,
                        error = "Approval failed"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"💥 Debug: Exception caught in controller: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"💥 Debug: Inner exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"💥 Debug: Stack trace: {ex.StackTrace}");
                
                return StatusCode(500, new { 
                    error = "Internal server error", 
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("test-connection")]
        public IActionResult TestConnection()
        {
            return Ok(new { 
                message = "Debug controller is working", 
                timestamp = DateTime.UtcNow 
            });
        }

        [HttpGet("list-incidents")]
        public async Task<IActionResult> ListIncidents()
        {
            try
            {
                var incidents = await _incidentService.GetAllAsync();
                return Ok(incidents.Take(5)); // First 5 for testing
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest request)
        {
            try
            {
                Console.WriteLine($"[Debug] ===== Starting email test ======");
                Console.WriteLine($"[Debug] Test email to: {request.Email}");

                // Check SMTP configuration
                var smtpHost = _configuration["Smtp:Host"];
                var smtpPort = _configuration.GetValue<int>("Smtp:Port", 587);
                var smtpUsername = _configuration["Smtp:Username"];
                var smtpPassword = _configuration["Smtp:Password"];
                var fromEmail = _configuration["Smtp:FromEmail"];
                var fromName = _configuration["Smtp:FromName"];
                var enableSsl = _configuration.GetValue<bool>("Smtp:EnableSsl", true);

                var configStatus = new
                {
                    Host = !string.IsNullOrEmpty(smtpHost) ? "✓ Configured" : "✗ Missing",
                    HostValue = smtpHost ?? "Not set",
                    Port = smtpPort,
                    Username = !string.IsNullOrEmpty(smtpUsername) ? "✓ Configured" : "✗ Missing",
                    UsernameValue = smtpUsername ?? "Not set",
                    Password = !string.IsNullOrEmpty(smtpPassword) ? "✓ Configured (hidden)" : "✗ Missing",
                    PasswordLength = smtpPassword?.Length ?? 0,
                    FromEmail = fromEmail ?? "Not set (will use Username)",
                    FromName = fromName ?? "Not set",
                    EnableSsl = enableSsl,
                    IsGmail = smtpHost?.Contains("gmail.com", StringComparison.OrdinalIgnoreCase) ?? false
                };

                // Test email sending
                var testSubject = "Test Email - Hệ thống Quản lý Thiết bị";
                var testBody = $@"
                    <html>
                    <body>
                        <h2>Email Test</h2>
                        <p>Đây là email test từ hệ thống.</p>
                        <p>Nếu bạn nhận được email này, cấu hình SMTP đã hoạt động đúng.</p>
                        <p>Thời gian: {DateTime.Now:dd/MM/yyyy HH:mm:ss}</p>
                    </body>
                    </html>";

                Console.WriteLine($"[Debug] Attempting to send test email...");
                var emailSent = await _emailService.SendEmailAsync(request.Email, testSubject, testBody, true);

                var result = new
                {
                    success = emailSent,
                    message = emailSent 
                        ? "Email sent successfully! Check your inbox (and spam folder)." 
                        : "Email sending failed. Check console logs for details.",
                    configuration = configStatus,
                    timestamp = DateTime.UtcNow,
                    recipient = request.Email
                };

                Console.WriteLine($"[Debug] Email test result: {(emailSent ? "SUCCESS" : "FAILED")}");
                Console.WriteLine($"[Debug] ===== Email test completed ======");

                if (emailSent)
                {
                    return Ok(result);
                }
                else
                {
                    return StatusCode(500, result);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Debug] Exception in test-email: {ex.Message}");
                Console.WriteLine($"[Debug] Stack trace: {ex.StackTrace}");
                
                return StatusCode(500, new
                {
                    success = false,
                    error = "Exception occurred",
                    message = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("smtp-config")]
        public IActionResult GetSmtpConfig()
        {
            try
            {
                var smtpHost = _configuration["Smtp:Host"];
                var smtpPort = _configuration.GetValue<int>("Smtp:Port", 587);
                var smtpUsername = _configuration["Smtp:Username"];
                var smtpPassword = _configuration["Smtp:Password"];
                var fromEmail = _configuration["Smtp:FromEmail"];
                var fromName = _configuration["Smtp:FromName"];
                var enableSsl = _configuration.GetValue<bool>("Smtp:EnableSsl", true);

                return Ok(new
                {
                    host = smtpHost ?? "Not configured",
                    port = smtpPort,
                    username = smtpUsername ?? "Not configured",
                    passwordConfigured = !string.IsNullOrEmpty(smtpPassword),
                    passwordLength = smtpPassword?.Length ?? 0,
                    fromEmail = fromEmail ?? "Not set (will use Username)",
                    fromName = fromName ?? "Not set",
                    enableSsl = enableSsl,
                    isGmail = smtpHost?.Contains("gmail.com", StringComparison.OrdinalIgnoreCase) ?? false,
                    isValid = !string.IsNullOrEmpty(smtpHost) && 
                             !string.IsNullOrEmpty(smtpUsername) && 
                             !string.IsNullOrEmpty(smtpPassword)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class TestEmailRequest
    {
        public string Email { get; set; } = string.Empty;
    }
}