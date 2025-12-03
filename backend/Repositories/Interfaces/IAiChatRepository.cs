using backend.Models.Entities;

namespace backend.Repositories.Interfaces;

public interface IAiChatRepository
{
    Task<AiChatSession?> GetSessionAsync(Guid sessionId, Guid userId);

    Task<AiChatSession?> GetLatestSessionAsync(Guid userId);

    Task AddSessionAsync(AiChatSession session);

    Task AddMessageAsync(AiChatMessage message);

    Task<IEnumerable<AiChatMessage>> GetMessagesAsync(Guid sessionId, int limit = 100);

    Task SaveChangesAsync();

    Task SoftDeleteSessionAsync(Guid sessionId, Guid userId);
}

