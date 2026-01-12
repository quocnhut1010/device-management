using backend.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net.Sockets;
using System.Text.RegularExpressions;

namespace backend.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private const int SmtpTimeoutSeconds = 30;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl)
        {
            // Validate email format
            if (!IsValidEmail(email))
            {
                Console.WriteLine($"[Email Service] Invalid email format: {email}");
                return false;
            }

            var subject = "Đặt lại mật khẩu - Hệ thống Quản lý Thiết bị";
            var body = GeneratePasswordResetEmailBody(resetToken, resetUrl);
            
            return await SendEmailAsync(email, subject, body, true);
        }

        private bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                var regex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
                return regex.IsMatch(email);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            try
            {
                // Validate configuration
                var validationResult = ValidateSmtpConfiguration();
                if (!validationResult.IsValid)
                {
                    Console.WriteLine($"[Email Service] Configuration validation failed: {validationResult.ErrorMessage}");
                    return false;
                }

                var smtpHost = _configuration["Smtp:Host"]!;
                var smtpPort = _configuration.GetValue<int>("Smtp:Port", 587);
                var smtpUsername = _configuration["Smtp:Username"]!;
                var smtpPassword = _configuration["Smtp:Password"]!;
                var fromEmail = _configuration["Smtp:FromEmail"];
                var fromName = _configuration["Smtp:FromName"] ?? "Hệ thống Quản lý Thiết bị";
                var enableSsl = _configuration.GetValue<bool>("Smtp:EnableSsl", true);

                // Validate email format
                if (!IsValidEmail(to))
                {
                    Console.WriteLine($"[Email Service] Invalid recipient email format: {to}");
                    return false;
                }

                // For Gmail, FromEmail should match Username or be an alias
                // Use Username as FromEmail if FromEmail is different (Gmail requirement)
                if (smtpHost.Contains("gmail.com", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(smtpUsername))
                {
                    fromEmail = smtpUsername;
                    Console.WriteLine($"[Email Service] Using Gmail - FromEmail set to Username: {fromEmail}");
                    
                    // Check if password looks like App Password (Gmail App Passwords have spaces)
                    if (!string.IsNullOrEmpty(smtpPassword) && !smtpPassword.Contains(" "))
                    {
                        Console.WriteLine($"[Email Service] WARNING: Gmail password doesn't contain spaces. Make sure you're using App Password, not regular password!");
                    }
                }
                else if (string.IsNullOrEmpty(fromEmail))
                {
                    fromEmail = smtpUsername;
                    Console.WriteLine($"[Email Service] FromEmail not set, using Username: {fromEmail}");
                }

                Console.WriteLine($"[Email Service] ===== Starting email send process =====");
                Console.WriteLine($"[Email Service] To: {to}");
                Console.WriteLine($"[Email Service] Subject: {subject}");
                Console.WriteLine($"[Email Service] SMTP Host: {smtpHost}, Port: {smtpPort}, SSL: {enableSsl}");
                Console.WriteLine($"[Email Service] From: {fromEmail} ({fromName})");
                Console.WriteLine($"[Email Service] Username: {smtpUsername}");

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder();
                if (isHtml)
                {
                    bodyBuilder.HtmlBody = body;
                }
                else
                {
                    bodyBuilder.TextBody = body;
                }
                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    try
                    {
                        // Set timeout
                        client.Timeout = SmtpTimeoutSeconds * 1000;

                        Console.WriteLine($"[Email Service] Step 1: Connecting to {smtpHost}:{smtpPort}...");
                        var secureOptions = enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;
                        await client.ConnectAsync(smtpHost, smtpPort, secureOptions);
                        
                        if (client.IsConnected)
                        {
                            Console.WriteLine($"[Email Service] ✓ Connected successfully");
                            Console.WriteLine($"[Email Service] Server capabilities: {string.Join(", ", client.Capabilities)}");
                        }
                        else
                        {
                            Console.WriteLine($"[Email Service] ✗ Connection failed - client not connected");
                            return false;
                        }

                        Console.WriteLine($"[Email Service] Step 2: Authenticating with username: {smtpUsername}...");
                        await client.AuthenticateAsync(smtpUsername, smtpPassword);
                        
                        if (client.IsAuthenticated)
                        {
                            Console.WriteLine($"[Email Service] ✓ Authenticated successfully");
                        }
                        else
                        {
                            Console.WriteLine($"[Email Service] ✗ Authentication failed - client not authenticated");
                            return false;
                        }

                        Console.WriteLine($"[Email Service] Step 3: Sending email message...");
                        var response = await client.SendAsync(message);
                        Console.WriteLine($"[Email Service] ✓ Email sent successfully!");
                        Console.WriteLine($"[Email Service] Server response: {response}");

                        Console.WriteLine($"[Email Service] Step 4: Disconnecting...");
                        await client.DisconnectAsync(true);
                        Console.WriteLine($"[Email Service] ✓ Disconnected");
                        Console.WriteLine($"[Email Service] ===== Email send process completed successfully =====");

                        return true;
                    }
                    catch (SmtpCommandException smtpEx)
                    {
                        Console.WriteLine($"[Email Service] ✗ SMTP Command Error: {smtpEx.Message}");
                        Console.WriteLine($"[Email Service] Status Code: {smtpEx.StatusCode}");
                        Console.WriteLine($"[Email Service] Error Code: {smtpEx.ErrorCode}");
                        if (smtpEx.InnerException != null)
                        {
                            Console.WriteLine($"[Email Service] Inner exception: {smtpEx.InnerException.Message}");
                        }
                        throw;
                    }
                    catch (SmtpProtocolException smtpEx)
                    {
                        Console.WriteLine($"[Email Service] ✗ SMTP Protocol Error: {smtpEx.Message}");
                        if (smtpEx.InnerException != null)
                        {
                            Console.WriteLine($"[Email Service] Inner exception: {smtpEx.InnerException.Message}");
                        }
                        throw;
                    }
                    catch (AuthenticationException authEx)
                    {
                        Console.WriteLine($"[Email Service] ✗ Authentication Error: {authEx.Message}");
                        Console.WriteLine($"[Email Service] This usually means:");
                        Console.WriteLine($"[Email Service]   1. Username or password is incorrect");
                        Console.WriteLine($"[Email Service]   2. For Gmail: You need to use App Password (not regular password)");
                        Console.WriteLine($"[Email Service]   3. For Gmail: 2-Step Verification must be enabled");
                        if (authEx.InnerException != null)
                        {
                            Console.WriteLine($"[Email Service] Inner exception: {authEx.InnerException.Message}");
                        }
                        throw;
                    }
                    catch (SocketException socketEx)
                    {
                        Console.WriteLine($"[Email Service] ✗ Network Error: {socketEx.Message}");
                        Console.WriteLine($"[Email Service] Error Code: {socketEx.ErrorCode}");
                        Console.WriteLine($"[Email Service] This usually means:");
                        Console.WriteLine($"[Email Service]   1. Cannot connect to SMTP server (check Host and Port)");
                        Console.WriteLine($"[Email Service]   2. Firewall is blocking the connection");
                        Console.WriteLine($"[Email Service]   3. Network connectivity issues");
                        throw;
                    }
                    catch (TimeoutException timeoutEx)
                    {
                        Console.WriteLine($"[Email Service] ✗ Timeout Error: {timeoutEx.Message}");
                        Console.WriteLine($"[Email Service] Connection timed out after {SmtpTimeoutSeconds} seconds");
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Email Service] ===== Email send process failed =====");
                Console.WriteLine($"[Email Service] ✗ Error Type: {ex.GetType().Name}");
                Console.WriteLine($"[Email Service] ✗ Error Message: {ex.Message}");
                Console.WriteLine($"[Email Service] ✗ Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[Email Service] ✗ Inner Exception Type: {ex.InnerException.GetType().Name}");
                    Console.WriteLine($"[Email Service] ✗ Inner Exception Message: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        private (bool IsValid, string ErrorMessage) ValidateSmtpConfiguration()
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpUsername = _configuration["Smtp:Username"];
            var smtpPassword = _configuration["Smtp:Password"];

            if (string.IsNullOrWhiteSpace(smtpHost))
            {
                return (false, "SMTP Host is not configured");
            }

            if (string.IsNullOrWhiteSpace(smtpUsername))
            {
                return (false, "SMTP Username is not configured");
            }

            if (string.IsNullOrWhiteSpace(smtpPassword))
            {
                return (false, "SMTP Password is not configured");
            }

            // Validate email format for username if it's Gmail
            if (smtpHost.Contains("gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                if (!IsValidEmail(smtpUsername))
                {
                    return (false, $"Gmail Username '{smtpUsername}' is not a valid email address");
                }
            }

            return (true, string.Empty);
        }

        public async Task<bool> SendRepairAssignmentEmailAsync(string email, Guid repairId, string deviceCode, string? description)
        {
            // Validate email format
            if (!IsValidEmail(email))
            {
                Console.WriteLine($"[Email Service] Invalid email format: {email}");
                return false;
            }

            var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5173";
            var repairsUrl = $"{baseUrl}/repairs";
            
            var subject = $"Được giao lệnh sửa chữa mới - {deviceCode}";
            var body = GenerateRepairAssignmentEmailBody(deviceCode, description, repairsUrl);
            
            return await SendEmailAsync(email, subject, body, true);
        }

        private string GeneratePasswordResetEmailBody(string resetToken, string resetUrl)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }}
        .button {{
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .token-box {{
            background-color: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Đặt lại mật khẩu</h1>
        </div>
        <div class='content'>
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình trong Hệ thống Quản lý Thiết bị.</p>
            <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
            <div style='text-align: center;'>
                <a href='{resetUrl}' class='button'>Đặt lại mật khẩu</a>
            </div>
            <p>Hoặc sao chép và dán link sau vào trình duyệt:</p>
            <div class='token-box'>{resetUrl}</div>
            <p><strong>Lưu ý:</strong></p>
            <ul>
                <li>Link này chỉ có hiệu lực trong 1 giờ.</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</li>
                <li>Để bảo mật, vui lòng không chia sẻ link này với bất kỳ ai.</li>
            </ul>
            <p>Trân trọng,<br>Đội ngũ Hệ thống Quản lý Thiết bị</p>
        </div>
        <div class='footer'>
            <p>Email này được gửi tự động, vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateRepairAssignmentEmailBody(string deviceCode, string? description, string repairsUrl)
        {
            var descriptionHtml = string.IsNullOrWhiteSpace(description) 
                ? "<p><em>Không có mô tả chi tiết.</em></p>" 
                : $"<p><strong>Mô tả:</strong> {System.Net.WebUtility.HtmlEncode(description)}</p>";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #059669;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }}
        .button {{
            display: inline-block;
            padding: 12px 24px;
            background-color: #059669;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }}
        .info-box {{
            background-color: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }}
        .device-code {{
            font-size: 18px;
            font-weight: bold;
            color: #059669;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Được giao lệnh sửa chữa mới</h1>
        </div>
        <div class='content'>
            <p>Xin chào,</p>
            <p>Bạn vừa được phân công một lệnh sửa chữa mới trong Hệ thống Quản lý Thiết bị.</p>
            
            <div class='info-box'>
                <p><strong>Mã thiết bị:</strong> <span class='device-code'>{System.Net.WebUtility.HtmlEncode(deviceCode)}</span></p>
                {descriptionHtml}
            </div>

            <p>Vui lòng click vào nút bên dưới để xem chi tiết và chấp nhận lệnh sửa chữa:</p>
            <div style='text-align: center;'>
                <a href='{repairsUrl}' class='button'>Xem và chấp nhận lệnh sửa chữa</a>
            </div>
            
            <p>Hoặc truy cập trực tiếp vào trang quản lý sửa chữa:</p>
            <div class='info-box' style='word-break: break-all;'>
                {repairsUrl}
            </div>

            <p><strong>Lưu ý:</strong></p>
            <ul>
                <li>Vui lòng đăng nhập vào hệ thống để xem và chấp nhận lệnh sửa chữa.</li>
                <li>Nếu bạn chưa đăng nhập, hệ thống sẽ yêu cầu bạn đăng nhập trước.</li>
                <li>Sau khi chấp nhận, bạn có thể bắt đầu thực hiện sửa chữa.</li>
            </ul>

            <p>Trân trọng,<br>Đội ngũ Hệ thống Quản lý Thiết bị</p>
        </div>
        <div class='footer'>
            <p>Email này được gửi tự động, vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}

