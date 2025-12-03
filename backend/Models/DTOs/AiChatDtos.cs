using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class AiChatSessionDto
{
    public Guid Id { get; set; }

    public string? Title { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime LastActivityAt { get; set; }

    public bool IsArchived { get; set; }
}

public class AiChatMessageDto
{
    public Guid Id { get; set; }

    public Guid SessionId { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public string? FileName { get; set; }

    public string? FileUrl { get; set; }
}

public class AiChatHistoryResponseDto
{
    public AiChatSessionDto Session { get; set; } = null!;

    public IEnumerable<AiChatMessageDto> Messages { get; set; } = new List<AiChatMessageDto>();
}

public class StartAiChatSessionDto
{
    public Guid? SessionId { get; set; }

    public string? Title { get; set; }
}

public class SendAiChatMessageDto
{
    [Required]
    public string Message { get; set; } = string.Empty;

    public Guid SessionId { get; set; }
}

public class AiChatMessageResponseDto
{
    public AiChatMessageDto UserMessage { get; set; } = null!;

    public AiChatMessageDto AssistantMessage { get; set; } = null!;

    public string? Error { get; set; }
}

