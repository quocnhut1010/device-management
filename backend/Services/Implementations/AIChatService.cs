using System.Text;
using System.Text.Json;
using AutoMapper;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services.Implementations;

public class AIChatService : IAIChatService
{
    private readonly IAiChatRepository _chatRepository;
    private readonly IAIReportService _aiReportService;
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
        IMapper mapper,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<AIChatService> logger)
    {
        _chatRepository = chatRepository;
        _aiReportService = aiReportService;
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

    public async Task<AiChatMessageResponseDto> SendMessageAsync(Guid userId, SendAiChatMessageDto dto)
    {
        var session = await EnsureSessionAsync(userId, dto.SessionId);
        var trimmedMessage = dto.Message?.Trim();

        if (string.IsNullOrEmpty(trimmedMessage))
        {
            throw new ArgumentException("Tin nhắn không được để trống.");
        }

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

        var assistantMessage = await GenerateAssistantMessageAsync(userId, session, trimmedMessage);
        await _chatRepository.AddMessageAsync(assistantMessage);
        session.LastActivityAt = DateTime.UtcNow;
        await _chatRepository.SaveChangesAsync();

        return new AiChatMessageResponseDto
        {
            UserMessage = _mapper.Map<AiChatMessageDto>(userMessage),
            AssistantMessage = _mapper.Map<AiChatMessageDto>(assistantMessage)
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

    private async Task<AiChatMessage> GenerateAssistantMessageAsync(Guid userId, AiChatSession session, string message)
    {
        var reportResponse = await _aiReportService.ProcessReportQueryAsync(message, userId);
        if (reportResponse.IsReportQuery)
        {
            return await BuildReportMessageAsync(session.Id, reportResponse);
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
            return "Xin lỗi, trợ lý AI đang gặp sự cố trong lúc trả lời. Vui lòng thử lại.";
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
}

