using System;
using System.Collections.Generic;

namespace backend.Models.Entities;

public class AiChatSession
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string? Title { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;

    public bool IsArchived { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<AiChatMessage> Messages { get; set; } = new List<AiChatMessage>();
}

