using System.Text;
using System.Text.Json;
using AutoMapper;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Models;
using backend.Models.Enums;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services.Implementations;

public class AIChatService : IAIChatService
{
    private readonly IAiChatRepository _chatRepository;
    private readonly IAIReportService _aiReportService;
    private readonly IChatIntentClassifier _chatIntentClassifier;
    private readonly IDeviceService _deviceService;
    private readonly IMapper _mapper;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AIChatService> _logger;
    private readonly string _apiKey;
    private readonly string _modelName;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private const string SystemInstruction = @"Bạn là trợ lý AI chuyên về quản lý thiết bị công nghệ thông tin với khả năng truy cập dữ liệu thực từ hệ thống. 
- Ưu tiên sử dụng dữ liệu thực khi có thể.
- Sử dụng tiếng Việt thân thiện, chuyên nghiệp.
- Nếu không tìm thấy dữ liệu, giải thích rõ lý do và đề xuất hướng khác.";

    public AIChatService(
        IAiChatRepository chatRepository,
        IAIReportService aiReportService,
        IChatIntentClassifier chatIntentClassifier,
        IDeviceService deviceService,
        IMapper mapper,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<AIChatService> logger)
    {
        _chatRepository = chatRepository;
        _aiReportService = aiReportService;
        _chatIntentClassifier = chatIntentClassifier;
        _deviceService = deviceService;
        _mapper = mapper;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _apiKey = configuration["GoogleAI:ApiKey"] ?? string.Empty;
        _modelName = configuration["GoogleAI:Model"] ?? "gemini-2.0-flash-lite";
    }

    public async Task<AiChatHistoryResponseDto?> GetSessionHistoryAsync(Guid userId, Guid sessionId)
    {
        var session = await _chatRepository.GetSessionAsync(sessionId, userId);
        if (session == null)
        {
            return null;
        }

        var history = await _chatRepository.GetMessagesAsync(session.Id, 200);
        return new AiChatHistoryResponseDto
        {
            Session = _mapper.Map<AiChatSessionDto>(session),
            Messages = history.Select(_mapper.Map<AiChatMessageDto>).ToList()
        };
    }

    public async Task<AiChatMessageResponseDto> SendMessageAsync(Guid userId, SendAiChatMessageDto dto, bool isAdmin)
    {
        var session = await EnsureSessionAsync(userId, dto.SessionId);
        var trimmedMessage = dto.Message?.Trim();

        if (string.IsNullOrEmpty(trimmedMessage))
        {
            throw new ArgumentException("Tin nhắn không được để trống.");
        }

        // Phân loại intent cho câu hỏi hiện tại
        var intentResult = await _chatIntentClassifier.ClassifyAsync(trimmedMessage);

        var userMessage = new AiChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Role = "user",
            Content = trimmedMessage,
            CreatedAt = DateTime.UtcNow
        };

        await _chatRepository.AddMessageAsync(userMessage);
        session.LastActivityAt = DateTime.UtcNow;
        await _chatRepository.SaveChangesAsync();

        // Điều chỉnh ưu tiên intent Hướng dẫn nếu câu hỏi chứa "cách/hướng dẫn/làm sao"
        if (intentResult != null)
        {
            var normalized = intentResult.NormalizedQuery ?? string.Empty;
            var scores = intentResult.Scores ?? new Dictionary<ChatIntent, double>();

            bool isHowToQuestion =
                normalized.Contains("cach ") ||
                normalized.Contains("huong dan") ||
                normalized.Contains("lam sao");

            if (isHowToQuestion &&
                scores.TryGetValue(ChatIntent.HuongDanSuDung, out var guideScore) &&
                guideScore >= 0.2)
            {
                intentResult.Intent = ChatIntent.HuongDanSuDung;
            }

            // Nếu là admin và câu hỏi có chứa từ khóa xuất báo cáo, ưu tiên chuyển intent sang luồng xuất báo cáo
            if (isAdmin &&
                intentResult.Intent == ChatIntent.HuongDanSuDung &&
                ContainsExportKeywords(normalized))
            {
                intentResult.Intent = ChatIntent.ThongKeThietBiTheoPhongBan;
            }

            // Nếu không phải admin: luôn ép intent về Hướng dẫn sử dụng để không truy cập dữ liệu thật
            if (!isAdmin)
            {
                intentResult.Intent = ChatIntent.HuongDanSuDung;
            }
        }

        var assistantMessage = await GenerateAssistantMessageAsync(userId, session, trimmedMessage, intentResult, isAdmin);
        await _chatRepository.AddMessageAsync(assistantMessage);
        session.LastActivityAt = DateTime.UtcNow;
        await _chatRepository.SaveChangesAsync();

        return new AiChatMessageResponseDto
        {
            UserMessage = _mapper.Map<AiChatMessageDto>(userMessage),
            AssistantMessage = _mapper.Map<AiChatMessageDto>(assistantMessage),
            IntentClassification = intentResult
        };
    }

    public async Task<AiChatHistoryResponseDto> StartOrResumeSessionAsync(Guid userId, StartAiChatSessionDto dto)
    {
        AiChatSession? session = null;

        if (dto.SessionId.HasValue)
        {
            session = await _chatRepository.GetSessionAsync(dto.SessionId.Value, userId);
        }

        session ??= await _chatRepository.GetLatestSessionAsync(userId);

        if (session == null)
        {
            session = new AiChatSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = string.IsNullOrWhiteSpace(dto.Title)
                    ? $"Cuộc trò chuyện {DateTime.Now:dd/MM HH:mm}"
                    : dto.Title!.Trim()
            };

            await _chatRepository.AddSessionAsync(session);
            await _chatRepository.SaveChangesAsync();
        }

        var history = await _chatRepository.GetMessagesAsync(session.Id, 200);

        return new AiChatHistoryResponseDto
        {
            Session = _mapper.Map<AiChatSessionDto>(session),
            Messages = history.Select(_mapper.Map<AiChatMessageDto>).ToList()
        };
    }

    public async Task<bool> ClearSessionAsync(Guid userId, Guid sessionId)
    {
        await _chatRepository.SoftDeleteSessionAsync(sessionId, userId);
        await _chatRepository.SaveChangesAsync();
        return true;
    }

    private async Task<AiChatSession> EnsureSessionAsync(Guid userId, Guid sessionId)
    {
        var session = await _chatRepository.GetSessionAsync(sessionId, userId);
        if (session == null)
        {
            throw new InvalidOperationException("Không tìm thấy phiên trò chuyện.");
        }

        if (session.DeletedAt != null)
        {
            throw new InvalidOperationException("Phiên trò chuyện đã bị xoá.");
        }

        return session;
    }

    private async Task<AiChatMessage> GenerateAssistantMessageAsync(
        Guid userId,
        AiChatSession session,
        string message,
        ChatIntentClassificationResultDto intentResult,
        bool isAdmin)
    {
        // Ưu tiên xử lý một số intent đặc biệt bằng dữ liệu thật trước khi gọi AI tổng quát
        if (intentResult.Intent == ChatIntent.HuongDanSuDung)
        {
            // Phân loại chủ đề hướng dẫn dựa trên từ khóa trong câu hỏi
            var guideTopic = DetectGuideTopic(message);

            switch (guideTopic)
            {
                case GuideTopic.ViewDevices:
                {
                    var guideText =
                        "Để xem thông tin thiết bị, bạn có thể thực hiện như sau:\n\n" +
                        "1. Vào menu 'Quản lý thiết bị' -> 'Danh sách thiết bị'.\n" +
                        "2. Sử dụng ô tìm kiếm để tra cứu theo mã thiết bị, tên thiết bị hoặc phòng ban.\n" +
                        "3. Nhấn vào từng dòng thiết bị để xem chi tiết thông tin và lịch sử liên quan.";

                    return new AiChatMessage
                    {
                        Id = Guid.NewGuid(),
                        SessionId = session.Id,
                        Role = "assistant",
                        Content = guideText,
                        CreatedAt = DateTime.UtcNow
                    };
                }

                case GuideTopic.ReportIncident:
                {
                    var guideText =
                        "Để tạo báo cáo sự cố thiết bị, bạn thực hiện:\n\n" +
                        "1. Vào menu 'Báo cáo' -> 'Báo cáo sự cố'.\n" +
                        "2. Chọn khoảng thời gian cần thống kê và các bộ lọc (phòng ban, loại thiết bị, trạng thái...).\n" +
                        "3. Nhấn 'Tạo báo cáo' để hệ thống tổng hợp dữ liệu.\n" +
                        "4. Nếu cần file Excel, bạn có thể sử dụng chức năng xuất file trên màn hình báo cáo.";

                    return new AiChatMessage
                    {
                        Id = Guid.NewGuid(),
                        SessionId = session.Id,
                        Role = "assistant",
                        Content = guideText,
                        CreatedAt = DateTime.UtcNow
                    };
                }

                case GuideTopic.ExportReport:
                {
                    // Hướng dẫn các bước xuất báo cáo trên giao diện
                    var guideText =
                        "Để xuất các báo cáo thiết bị ra file, bạn làm như sau:\n\n" +
                        "1. Vào menu 'Báo cáo' và chọn loại báo cáo phù hợp (thiết bị, sự cố, thanh lý...).\n" +
                        "2. Thiết lập khoảng thời gian và các điều kiện lọc mong muốn.\n" +
                        "3. Nhấn 'Tạo báo cáo' để xem trước dữ liệu trên màn hình.\n" +
                        "4. Nhấn nút 'Tải file' hoặc 'Xuất Excel' để tải báo cáo về máy.";

                    // Nếu không phải admin: chỉ trả lời hướng dẫn, không gọi AIReportService
                    if (!isAdmin)
                    {
                        return new AiChatMessage
                        {
                            Id = Guid.NewGuid(),
                            SessionId = session.Id,
                            Role = "assistant",
                            Content = guideText,
                            CreatedAt = DateTime.UtcNow
                        };
                    }

                    // Admin: kết hợp thêm logic AIReportService để gợi ý/chạy xuất báo cáo
                    string? followUpQuestion = null;
                    try
                    {
                        var guideReportResponse = await _aiReportService.ProcessReportQueryAsync(message, userId);
                        if (guideReportResponse.IsReportQuery)
                        {
                            // Nếu đã xác định được loại báo cáo và có dữ liệu file, trả về như flow report bình thường
                            if (guideReportResponse.FileData != null && !string.IsNullOrWhiteSpace(guideReportResponse.FileName))
                            {
                                return await BuildReportMessageAsync(session.Id, guideReportResponse);
                            }

                            // Nếu chưa rõ loại báo cáo => lấy câu hỏi gợi ý từ AIReportService
                            if (!string.IsNullOrWhiteSpace(guideReportResponse.Message))
                            {
                                followUpQuestion = guideReportResponse.Message;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi gọi AIReportService trong nhánh hướng dẫn xuất báo cáo.");
                    }

                    if (string.IsNullOrWhiteSpace(followUpQuestion))
                    {
                        followUpQuestion =
                            "Bạn muốn xuất loại báo cáo nào? Ví dụ: \"thiết bị\", \"sự cố\", \"sửa chữa\" hoặc \"thanh lý\".";
                    }

                    var combinedContent = guideText + "\n\n" + followUpQuestion;

                    return new AiChatMessage
                    {
                        Id = Guid.NewGuid(),
                        SessionId = session.Id,
                        Role = "assistant",
                        Content = combinedContent,
                        CreatedAt = DateTime.UtcNow
                    };
                }

                case GuideTopic.AssetLiquidation:
                {
                    var guideText =
                        "Để thực hiện thanh lý thiết bị trong hệ thống, bạn thực hiện:\n\n" +
                        "1. Vào menu 'Thanh lý' hoặc chức năng quản lý thanh lý thiết bị (nếu được cấu hình).\n" +
                        "2. Chọn thiết bị cần thanh lý từ danh sách, kiểm tra lại thông tin tài sản.\n" +
                        "3. Nhập các thông tin liên quan (lý do thanh lý, giá trị còn lại, đơn vị nhận...).\n" +
                        "4. Lưu phiếu thanh lý và, nếu cần, xuất báo cáo/thông báo liên quan.";

                    return new AiChatMessage
                    {
                        Id = Guid.NewGuid(),
                        SessionId = session.Id,
                        Role = "assistant",
                        Content = guideText,
                        CreatedAt = DateTime.UtcNow
                    };
                }

                case GuideTopic.Other:
                default:
                    // Không xác định rõ chủ đề: chuyển sang gọi LLM để trả lời linh hoạt,
                    // không xử lý như yêu cầu xuất báo cáo.
                    var aiGuideResponse = await GenerateModelResponseAsync(session.Id);
                    return new AiChatMessage
                    {
                        Id = Guid.NewGuid(),
                        SessionId = session.Id,
                        Role = "assistant",
                        Content = aiGuideResponse,
                        CreatedAt = DateTime.UtcNow
                    };
            }
        }

        // Xử lý intent kiểm tra tình trạng sửa chữa (chỉ cho admin)
        if (isAdmin && intentResult.Intent == ChatIntent.KiemTraTinhTrangSuaChua)
        {
            return await HandleRepairStatusAsync(session.Id, message);
        }

        // Xử lý intent tra cứu thiết bị (chỉ cho admin)
        if (isAdmin && intentResult.Intent == ChatIntent.TraCuuThietBi)
        {
            return await HandleDeviceLookupAsync(session.Id, message);
        }

        // Kiểm tra xem có phải yêu cầu xuất báo cáo không (sau khi đã loại trừ các intent trên) - chỉ cho admin
        if (isAdmin)
        {
            var reportResponse = await _aiReportService.ProcessReportQueryAsync(message, userId);
            if (reportResponse.IsReportQuery)
            {
                return await BuildReportMessageAsync(session.Id, reportResponse);
            }
        }

        var aiResponse = await GenerateModelResponseAsync(session.Id);
        return new AiChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Role = "assistant",
            Content = aiResponse,
            CreatedAt = DateTime.UtcNow
        };
    }

    private async Task<AiChatMessage> BuildReportMessageAsync(Guid sessionId, AIReportResponseDto reportResponse)
    {
        string messageContent = reportResponse.Error ?? reportResponse.Message ?? "Đã xử lý yêu cầu báo cáo.";
        string? fileUrl = null;

        if (reportResponse.FileData != null && !string.IsNullOrEmpty(reportResponse.FileName))
        {
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ai-reports");
            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            var safeFileName = reportResponse.FileName;
            var filePath = Path.Combine(folder, safeFileName);
            await File.WriteAllBytesAsync(filePath, reportResponse.FileData);
            fileUrl = $"/ai-reports/{safeFileName}";
        }

        return new AiChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            Role = "assistant",
            Content = messageContent,
            FileName = reportResponse.FileName,
            FileUrl = fileUrl,
            CreatedAt = DateTime.UtcNow
        };
    }

    private async Task<string> GenerateModelResponseAsync(Guid sessionId)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Google AI API key is missing.");
            return "Không tìm thấy API key Google AI. Vui lòng cấu hình trong hệ thống.";
        }

        try
        {
            var history = await _chatRepository.GetMessagesAsync(sessionId, 25);

            var contents = history.Select(m => new
            {
                role = m.Role == "assistant" ? "model" : "user",
                parts = new[]
                {
                    new { text = m.Content }
                }
            }).ToList();

            var requestPayload = new
            {
                systemInstruction = new
                {
                    role = "system",
                    parts = new[]
                    {
                        new { text = SystemInstruction }
                    }
                },
                contents,
                generationConfig = new
                {
                    maxOutputTokens = 2000,
                    temperature = 0.7
                }
            };

            var httpClient = _httpClientFactory.CreateClient();
            var requestContent = new StringContent(JsonSerializer.Serialize(requestPayload, JsonOptions), Encoding.UTF8, "application/json");
            var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelName}:generateContent?key={_apiKey}";

            var response = await httpClient.PostAsync(endpoint, requestContent);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("Google AI request failed. Status: {Status} Body: {Body}", response.StatusCode, body);

                var statusCode = (int)response.StatusCode;
                var shortBody = TruncateForUser(body, 400);

                return $"Xin lỗi, trợ lý AI đang gặp sự cố trong lúc trả lời. " +
                       $"Mã lỗi từ Google AI: {statusCode} - {response.StatusCode}. " +
                       $"Chi tiết: {shortBody}";
            }

            var json = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                _logger.LogWarning("Google AI response missing candidates. Payload: {Payload}", json);
                return "Hiện tôi chưa có câu trả lời phù hợp. Bạn có thể hỏi lại với thông tin cụ thể hơn không?";
            }

            var firstCandidate = candidates[0];
            if (!firstCandidate.TryGetProperty("content", out var content) ||
                !content.TryGetProperty("parts", out var parts) ||
                parts.GetArrayLength() == 0)
            {
                _logger.LogWarning("Google AI response missing content parts. Payload: {Payload}", json);
                return "Xin lỗi, tôi chưa thể trả lời câu hỏi này.";
            }

            var text = parts[0].GetProperty("text").GetString();
            return text ?? "Xin lỗi, tôi chưa thể trả lời câu hỏi này.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception when calling Google AI.");
            return $"Xin lỗi, trợ lý AI gặp lỗi khi gọi Google AI: {ex.Message}";
        }
    }

    private static string TruncateForUser(string? body, int maxLength)
    {
        if (string.IsNullOrEmpty(body))
        {
            return "(không có nội dung lỗi từ Google AI)";
        }

        if (body.Length <= maxLength)
        {
            return body;
        }

        return body.Substring(0, maxLength) + "...";
    }

    #region Guide topic detection

    private enum GuideTopic
    {
        Other = 0,
        ViewDevices = 1,
        ReportIncident = 2,
        ExportReport = 3,
        AssetLiquidation = 4
    }

    private static bool ContainsExportKeywords(string normalized)
    {
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return false;
        }

        var exportPhrases = new[]
        {
            "xuat bao cao",
            "export report",
            "tao bao cao",
            "xuat thong ke",
            "xuat du lieu",
            "xuat file bao cao",
            "tai file bao cao"
        };

        if (exportPhrases.Any(normalized.Contains))
        {
            return true;
        }

        var exportVerbs = new[] { "xuat", "tao", "export" };
        var reportContexts = new[] { "bao cao", "su co", "thiet bi", "thanh ly", "thong ke" };

        bool hasVerb = exportVerbs.Any(normalized.Contains);
        bool hasContext = reportContexts.Any(normalized.Contains);

        return hasVerb && hasContext;
    }

    private static GuideTopic DetectGuideTopic(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return GuideTopic.Other;
        }

        var normalized = message.ToLowerInvariant();

        // Nhóm xem / tra cứu thiết bị
        if (normalized.Contains("xem thông tin thiết bị") ||
            normalized.Contains("xem thong tin thiet bi") ||
            normalized.Contains("xem thiết bị") ||
            normalized.Contains("xem thiet bi") ||
            normalized.Contains("tra cứu thiết bị") ||
            normalized.Contains("tra cuu thiet bi") ||
            normalized.Contains("tra cứu theo thiết bị") ||
            normalized.Contains("xem danh sách thiết bị") ||
            normalized.Contains("danh sách thiết bị") ||
            normalized.Contains("danh sach thiet bi"))
        {
            return GuideTopic.ViewDevices;
        }

        // Nhóm hướng dẫn báo cáo sự cố
        if ((normalized.Contains("báo cáo sự cố") || normalized.Contains("bao cao su co")) ||
            (normalized.Contains("sự cố") || normalized.Contains("su co")) &&
            (normalized.Contains("hướng dẫn") || normalized.Contains("huong dan") ||
             normalized.Contains("cách") || normalized.Contains("cach") ||
             normalized.Contains("làm sao") || normalized.Contains("lam sao")))
        {
            return GuideTopic.ReportIncident;
        }

        // Nhóm xuất báo cáo / báo cáo thiết bị
        if (normalized.Contains("xuất báo cáo") ||
            normalized.Contains("xuat bao cao") ||
            normalized.Contains("xuất file") ||
            normalized.Contains("xuat file") ||
            normalized.Contains("export report") ||
            normalized.Contains("hướng dẫn xuất báo cáo") ||
            normalized.Contains("huong dan xuat bao cao"))
        {
            return GuideTopic.ExportReport;
        }

        // Nhóm thanh lý thiết bị
        if (normalized.Contains("thanh lý thiết bị") ||
            normalized.Contains("thanh ly thiet bi") ||
            normalized.Contains("thanh lý tài sản") ||
            normalized.Contains("thanh ly tai san"))
        {
            return GuideTopic.AssetLiquidation;
        }

        return GuideTopic.Other;
    }

    #endregion

    private async Task<AiChatMessage> HandleDeviceLookupAsync(Guid sessionId, string message)
    {
        var deviceCode = ExtractDeviceCode(message);
        if (string.IsNullOrWhiteSpace(deviceCode))
        {
            return new AiChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                Role = "assistant",
                Content = "Bạn vui lòng cung cấp rõ mã thiết bị (ví dụ: DEV-001) để mình tra cứu chính xác nhé.",
                CreatedAt = DateTime.UtcNow
            };
        }

        var devices = await _deviceService.GetAllDevicesAsync();
        var device = devices.FirstOrDefault(d =>
            !string.IsNullOrEmpty(d.DeviceCode) &&
            string.Equals(d.DeviceCode, deviceCode, StringComparison.OrdinalIgnoreCase));

        if (device == null)
        {
            return new AiChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                Role = "assistant",
                Content = $"Không tìm thấy thiết bị với mã {deviceCode} trong hệ thống.",
                CreatedAt = DateTime.UtcNow
            };
        }

        var builder = new StringBuilder();
        var purchaseDateText = device.PurchaseDate.HasValue
            ? device.PurchaseDate.Value.ToString("dd/MM/yyyy")
            : "(chưa có)";
        var warrantyText = device.WarrantyExpiry.HasValue
            ? device.WarrantyExpiry.Value.ToString("dd/MM/yyyy")
            : "(chưa có)";
        builder.AppendLine($"Tôi đã tìm được thiết bị với mã {device.DeviceCode} trong hệ thống:");
        builder.AppendLine();
        builder.AppendLine("Thông tin chi tiết:");
        builder.AppendLine($"- Tên thiết bị: {device.DeviceName}");
        builder.AppendLine($"- Loại thiết bị: {device.DeviceTypeName}");
        builder.AppendLine($"- Trạng thái: {device.Status}");
        builder.AppendLine($"- Người dùng: {device.CurrentUserName}");
        builder.AppendLine($"- Phòng ban: {device.DepartmentName}");
        builder.AppendLine($"- Ngày mua: {purchaseDateText}");
        builder.AppendLine($"- Hết bảo hành: {warrantyText}");

        return new AiChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            Role = "assistant",
            Content = builder.ToString(),
            CreatedAt = DateTime.UtcNow
        };
    }

    private async Task<AiChatMessage> HandleRepairStatusAsync(Guid sessionId, string message)
    {
        var deviceCode = ExtractDeviceCode(message);

        // Nếu người dùng hỏi chung chung: liệt kê thiết bị đang sửa chữa
        if (string.IsNullOrWhiteSpace(deviceCode))
        {
            var devices = await _deviceService.GetAllDevicesAsync();
            var repairingDevices = devices
                .Where(d => string.Equals(d.Status, DeviceStatus.Repairing, StringComparison.OrdinalIgnoreCase))
                .Take(20)
                .ToList();

            if (repairingDevices.Count == 0)
            {
                return new AiChatMessage
                {
                    Id = Guid.NewGuid(),
                    SessionId = sessionId,
                    Role = "assistant",
                    Content = "Hiện tại hệ thống không ghi nhận thiết bị nào đang trong trạng thái Đang sửa chữa.",
                    CreatedAt = DateTime.UtcNow
                };
            }

            var builder = new StringBuilder();
            builder.AppendLine("Dưới đây là các thiết bị đang trong trạng thái Đang sửa chữa:");
            builder.AppendLine();

            foreach (var d in repairingDevices)
            {
                builder.AppendLine($"- Mã thiết bị: {d.DeviceCode} | Tên: {d.DeviceName} | Phòng ban: {d.DepartmentName}");
            }

            return new AiChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                Role = "assistant",
                Content = builder.ToString(),
                CreatedAt = DateTime.UtcNow
            };
        }

        // Nếu có mã thiết bị cụ thể: mô tả tình trạng sửa chữa cho thiết bị đó
        var allDevices = await _deviceService.GetAllDevicesAsync();
        var device = allDevices.FirstOrDefault(d =>
            !string.IsNullOrEmpty(d.DeviceCode) &&
            string.Equals(d.DeviceCode, deviceCode, StringComparison.OrdinalIgnoreCase));

        if (device == null)
        {
            return new AiChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                Role = "assistant",
                Content = $"Không tìm thấy thiết bị với mã {deviceCode} trong hệ thống.",
                CreatedAt = DateTime.UtcNow
            };
        }

        var statusText = device.Status ?? "(chưa có)";
        var builderDetail = new StringBuilder();
        builderDetail.AppendLine($"Tình trạng sửa chữa của thiết bị {device.DeviceCode} - {device.DeviceName}:");
        builderDetail.AppendLine($"- Trạng thái hiện tại: {statusText}");
        builderDetail.AppendLine($"- Đang quản lý tại phòng ban: {device.DepartmentName}");
        builderDetail.AppendLine($"- Người đang sử dụng: {device.CurrentUserName}");

        return new AiChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            Role = "assistant",
            Content = builderDetail.ToString(),
            CreatedAt = DateTime.UtcNow
        };
    }

    private static string? ExtractDeviceCode(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return null;
        }

        // Tìm mẫu kiểu DEV-001, DEV-0001, v.v.
        var parts = message.Split(new[] { ' ', '\t', '\r', '\n', ',', '.', ';', ':' }, StringSplitOptions.RemoveEmptyEntries);
        var candidate = parts.FirstOrDefault(p => p.StartsWith("DEV-", StringComparison.OrdinalIgnoreCase));
        return candidate;
    }
}

