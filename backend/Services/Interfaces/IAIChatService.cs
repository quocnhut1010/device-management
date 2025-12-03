using backend.Models.DTOs;

namespace backend.Services.Interfaces;

public interface IAIChatService
{
    Task<AiChatHistoryResponseDto> StartOrResumeSessionAsync(Guid userId, StartAiChatSessionDto dto);

    Task<AiChatHistoryResponseDto?> GetSessionHistoryAsync(Guid userId, Guid sessionId);

    Task<AiChatMessageResponseDto> SendMessageAsync(Guid userId, SendAiChatMessageDto dto);

    Task<bool> ClearSessionAsync(Guid userId, Guid sessionId);
}

