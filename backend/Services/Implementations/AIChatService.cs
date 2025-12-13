using System.Globalization;
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
    private const int DefaultHistoryLimit = 10;

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
        _modelName = configuration["GoogleAI:Model"] ?? "gemini-2.5-flash-lite";
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
            return await HandleDeviceDataQueryAsync(session.Id, message, preferRepairing: true);
        }

        // Xử lý intent tra cứu thiết bị (chỉ cho admin) - data-first
        if (isAdmin && intentResult.Intent == ChatIntent.TraCuuThietBi)
        {
            return await HandleDeviceDataQueryAsync(session.Id, message, preferRepairing: false);
        }

        // Nếu câu hỏi có dấu hiệu tra cứu thiết bị nhưng intent chưa khớp, vẫn ưu tiên luồng data-first (admin)
        if (isAdmin)
        {
            var detectedFilters = DetectDeviceQueryFilters(message);
            if (detectedFilters.IsDataQuery)
            {
                return await HandleDeviceDataQueryAsync(session.Id, message, detectedFilters);
            }
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

    private async Task<string> GenerateModelResponseWithContextAsync(
        Guid sessionId,
        string instruction,
        object structuredContext,
        int historyLimit = DefaultHistoryLimit)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Google AI API key is missing.");
            return "Không tìm thấy API key Google AI. Vui lòng cấu hình trong hệ thống.";
        }

        try
        {
            var history = await _chatRepository.GetMessagesAsync(sessionId, historyLimit);
            var trimmedHistory = history
                .OrderBy(h => h.CreatedAt)
                .TakeLast(Math.Max(2, historyLimit / 2))
                .Select(m => new
                {
                    role = m.Role == "assistant" ? "model" : "user",
                    parts = new[]
                    {
                        new { text = m.Content }
                    }
                })
                .ToList();

            // Bổ sung context đã lọc dữ liệu để LLM chỉ diễn đạt lại
            trimmedHistory.Add(new
            {
                role = "user",
                parts = new[]
                {
                    new
                    {
                        text = $"instruction: {instruction}\ncontext:\n{JsonSerializer.Serialize(structuredContext, JsonOptions)}"
                    }
                }
            });

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
                contents = trimmedHistory,
                generationConfig = new
                {
                    maxOutputTokens = 500,
                    temperature = 0.3
                }
            };

            var httpClient = _httpClientFactory.CreateClient();
            var requestContent = new StringContent(JsonSerializer.Serialize(requestPayload, JsonOptions), Encoding.UTF8, "application/json");
            var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelName}:generateContent?key={_apiKey}";

            var response = await httpClient.PostAsync(endpoint, requestContent);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("Google AI context request failed. Status: {Status} Body: {Body}", response.StatusCode, body);
                return string.Empty;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                _logger.LogWarning("Google AI context response missing candidates. Payload: {Payload}", json);
                return string.Empty;
            }

            var firstCandidate = candidates[0];
            if (!firstCandidate.TryGetProperty("content", out var content) ||
                !content.TryGetProperty("parts", out var parts) ||
                parts.GetArrayLength() == 0)
            {
                _logger.LogWarning("Google AI context response missing content parts. Payload: {Payload}", json);
                return string.Empty;
            }

            var text = parts[0].GetProperty("text").GetString() ?? string.Empty;
            return SanitizeAsterisks(text);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception when calling Google AI with structured context.");
            return string.Empty;
        }
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
            var history = await _chatRepository.GetMessagesAsync(sessionId, DefaultHistoryLimit);

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

    private sealed class DeviceQueryFilters
    {
        public bool IsDataQuery { get; set; }
        public string? DeviceCode { get; set; }
        public string? Department { get; set; }
        public string? Status { get; set; }
        public string? DeviceType { get; set; }
        public bool ExplicitListRequest { get; set; }
    }

    private DeviceQueryFilters DetectDeviceQueryFilters(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return new DeviceQueryFilters();
        }

        var normalized = NormalizeText(message);

        var filters = new DeviceQueryFilters
        {
            DeviceCode = ExtractDeviceCode(message)
        };

        if (normalized.Contains("danh sach") || normalized.Contains("liet ke"))
        {
            filters.ExplicitListRequest = true;
        }

        // Status keywords
        if (normalized.Contains("dang sua") || normalized.Contains("dang sua chua") || normalized.Contains("sua chua"))
        {
            filters.Status = DeviceStatus.Repairing;
        }
        else if (normalized.Contains("dang dung") || normalized.Contains("dang su dung") || normalized.Contains("in use"))
        {
            filters.Status = DeviceStatus.InUse;
        }
        else if (normalized.Contains("chua cap phat") || normalized.Contains("san sang") || normalized.Contains("available"))
        {
            filters.Status = DeviceStatus.Available;
        }
        else if (normalized.Contains("bao tri") || normalized.Contains("maintenance"))
        {
            filters.Status = DeviceStatus.Maintenance;
        }
        else if (normalized.Contains("hong") || normalized.Contains("broken"))
        {
            filters.Status = DeviceStatus.Broken;
        }
        else if (normalized.Contains("mat"))
        {
            filters.Status = DeviceStatus.Lost;
        }
        else if (normalized.Contains("cho thanh ly"))
        {
            filters.Status = DeviceStatus.PendingLiquidation;
        }
        else if (normalized.Contains("da thanh ly") || normalized.Contains("thanh li") || normalized.Contains("liquidated"))
        {
            filters.Status = DeviceStatus.Liquidated;
        }

        // Department extraction: lấy cụm sau từ khóa phòng/phòng ban
        filters.Department = ExtractDepartment(normalized);

        // Device type keywords
        if (normalized.Contains("laptop"))
        {
            filters.DeviceType = "laptop";
        }
        else if (normalized.Contains("may tinh ban") || normalized.Contains("desktop") || normalized.Contains("pc"))
        {
            filters.DeviceType = "pc";
        }
        else if (normalized.Contains("may in") || normalized.Contains("printer"))
        {
            filters.DeviceType = "printer";
        }
        else if (normalized.Contains("may chu") || normalized.Contains("server"))
        {
            filters.DeviceType = "server";
        }

        bool mentionsDevices = normalized.Contains("thiet bi") || normalized.Contains("device") || normalized.Contains("ma dev");

        filters.IsDataQuery =
            filters.DeviceCode != null ||
            !string.IsNullOrEmpty(filters.Status) ||
            !string.IsNullOrEmpty(filters.Department) ||
            !string.IsNullOrEmpty(filters.DeviceType) ||
            filters.ExplicitListRequest ||
            mentionsDevices;

        return filters;
    }

    private static string? ExtractDepartment(string normalized)
    {
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return null;
        }

        var markers = new[] { "phong ", "phong ban ", "bo phan " };
        foreach (var marker in markers)
        {
            var idx = normalized.IndexOf(marker, StringComparison.Ordinal);
            if (idx >= 0)
            {
                var start = idx + marker.Length;
                var rest = normalized.Substring(start);
                var stopChars = new[] { ".", ",", ";", "?", "!" };
                var stopIndex = rest.Length;
                foreach (var c in stopChars)
                {
                    var pos = rest.IndexOf(c);
                    if (pos >= 0 && pos < stopIndex)
                    {
                        stopIndex = pos;
                    }
                }

                var candidate = rest[..stopIndex].Trim();
                if (!string.IsNullOrWhiteSpace(candidate))
                {
                    return candidate;
                }
            }
        }

        return null;
    }

    private async Task<AiChatMessage> HandleDeviceDataQueryAsync(
        Guid sessionId,
        string message,
        DeviceQueryFilters? filters = null,
        bool preferRepairing = false)
    {
        filters ??= DetectDeviceQueryFilters(message);

        if (preferRepairing && string.IsNullOrEmpty(filters.Status))
        {
            filters.Status = DeviceStatus.Repairing;
        }

        var devices = await _deviceService.GetAllDevicesAsync();

        // Nếu có mã thiết bị cụ thể -> trả về chi tiết trước, không cần LLM
        if (!string.IsNullOrWhiteSpace(filters.DeviceCode))
        {
            var device = devices.FirstOrDefault(d =>
                !string.IsNullOrEmpty(d.DeviceCode) &&
                string.Equals(d.DeviceCode, filters.DeviceCode, StringComparison.OrdinalIgnoreCase));

            if (device == null)
            {
                return new AiChatMessage
                {
                    Id = Guid.NewGuid(),
                    SessionId = sessionId,
                    Role = "assistant",
                    Content = $"Không tìm thấy thiết bị với mã {filters.DeviceCode} trong hệ thống.",
                    CreatedAt = DateTime.UtcNow
                };
            }

            var detailBuilder = BuildDeviceDetail(device);
            return new AiChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                Role = "assistant",
                Content = detailBuilder.ToString(),
                CreatedAt = DateTime.UtcNow
            };
        }

        // Áp dụng các bộ lọc list
        var filtered = devices.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(filters.Status))
        {
            filtered = filtered.Where(d => string.Equals(d.Status, filters.Status, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(filters.Department))
        {
            filtered = filtered.Where(d =>
                !string.IsNullOrWhiteSpace(d.DepartmentName) &&
                ContainsNormalized(d.DepartmentName, filters.Department!));
        }

        if (!string.IsNullOrWhiteSpace(filters.DeviceType))
        {
            filtered = filtered.Where(d =>
                !string.IsNullOrWhiteSpace(d.DeviceTypeName) &&
                ContainsNormalized(d.DeviceTypeName, filters.DeviceType!));
        }

        var filteredList = filtered.ToList();
        _logger.LogInformation("AIChat data query filters: {@Filters} -> {Count} devices", new
        {
            filters.DeviceCode,
            filters.Status,
            filters.Department,
            filters.DeviceType,
            filters.ExplicitListRequest
        }, filteredList.Count);

        if (filteredList.Count == 0)
        {
            return new AiChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                Role = "assistant",
                Content = "Không tìm thấy dữ liệu phù hợp với yêu cầu. Vui lòng kiểm tra lại từ khóa hoặc cung cấp thêm thông tin.",
                CreatedAt = DateTime.UtcNow
            };
        }

        if (filteredList.Count == 1)
        {
            var detailBuilder = BuildDeviceDetail(filteredList[0]);
            return new AiChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                Role = "assistant",
                Content = detailBuilder.ToString(),
                CreatedAt = DateTime.UtcNow
            };
        }

        var limited = filteredList.Take(20).ToList();
        var tableText = FormatDevicesTable(limited, filteredList.Count);

        // Tùy chọn diễn đạt bằng LLM nhưng ràng buộc context
        var contextPayload = limited.Select(d => new
        {
            deviceCode = d.DeviceCode,
            name = d.DeviceName,
            dept = d.DepartmentName,
            status = d.Status,
            type = d.DeviceTypeName,
            user = d.CurrentUserName
        }).ToList();

        var paraphrase = await GenerateModelResponseWithContextAsync(
            sessionId,
            "Chỉ trả lời dựa trên context. Nếu context trống hãy nói không tìm thấy dữ liệu phù hợp. Viết ngắn gọn tiếng Việt, không bịa, không suy đoán. Không dùng markdown hoặc dấu *.",
            new { context = contextPayload, total = filteredList.Count });

        var sanitizedParaphrase = string.IsNullOrWhiteSpace(paraphrase) ? string.Empty : SanitizeAsterisks(paraphrase);

        var finalText = string.IsNullOrWhiteSpace(sanitizedParaphrase)
            ? tableText
            : $"{sanitizedParaphrase}\n\n{tableText}";

        return new AiChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            Role = "assistant",
            Content = finalText,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static StringBuilder BuildDeviceDetail(DeviceDto device)
    {
        var builder = new StringBuilder();
        var purchaseDateText = device.PurchaseDate.HasValue
            ? device.PurchaseDate.Value.ToString("dd/MM/yyyy")
            : "(chưa có)";
        var warrantyText = device.WarrantyExpiry.HasValue
            ? device.WarrantyExpiry.Value.ToString("dd/MM/yyyy")
            : "(chưa có)";
        builder.AppendLine($"Tôi đã tìm được thiết bị với mã {device.DeviceCode ?? "(không rõ)"}:");
        builder.AppendLine();
        builder.AppendLine("Thông tin chi tiết:");
        builder.AppendLine($"- Tên thiết bị: {device.DeviceName}");
        builder.AppendLine($"- Loại thiết bị: {device.DeviceTypeName}");
        builder.AppendLine($"- Trạng thái: {device.Status}");
        builder.AppendLine($"- Người dùng: {device.CurrentUserName}");
        builder.AppendLine($"- Phòng ban: {device.DepartmentName}");
        builder.AppendLine($"- Ngày mua: {purchaseDateText}");
        builder.AppendLine($"- Hết bảo hành: {warrantyText}");
        return builder;
    }

    private static string FormatDevicesTable(IEnumerable<DeviceDto> devices, int total)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"Danh sách thiết bị (tối đa 20 kết quả) - tổng: {total}");
        sb.AppendLine("Mã | Tên | Phòng ban | Trạng thái");
        sb.AppendLine("-----------------------------------");
        foreach (var d in devices)
        {
            sb.AppendLine($"{d.DeviceCode ?? "-"} | {d.DeviceName ?? "-"} | {d.DepartmentName ?? "-"} | {d.Status ?? "-"}");
        }
        return sb.ToString();
    }

    private static string NormalizeText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var normalized = text.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var chars = normalized
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            .ToArray();
        return new string(chars);
    }

    private static bool ContainsNormalized(string source, string keyword)
    {
        if (string.IsNullOrWhiteSpace(source) || string.IsNullOrWhiteSpace(keyword))
        {
            return false;
        }

        return NormalizeText(source).Contains(NormalizeText(keyword));
    }

    private static string SanitizeAsterisks(string input)
    {
        if (string.IsNullOrEmpty(input))
        {
            return string.Empty;
        }

        return input.Replace("*", string.Empty);
    }

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

