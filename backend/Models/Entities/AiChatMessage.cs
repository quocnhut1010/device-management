using System;

namespace backend.Models.Entities;

public class AiChatMessage
{
    public Guid Id { get; set; }

    public Guid SessionId { get; set; }

    public string Role { get; set; } = "user";

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? FileName { get; set; }

    public string? FileUrl { get; set; }

    public string? FileMimeType { get; set; }

    public virtual AiChatSession Session { get; set; } = null!;
}

