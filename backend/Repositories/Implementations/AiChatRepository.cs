using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implementations;

public class AiChatRepository : IAiChatRepository
{
    private readonly DeviceManagementDbContext _context;

    public AiChatRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public async Task AddMessageAsync(AiChatMessage message)
    {
        await _context.AiChatMessages.AddAsync(message);
    }

    public async Task AddSessionAsync(AiChatSession session)
    {
        await _context.AiChatSessions.AddAsync(session);
    }

    public async Task<AiChatSession?> GetLatestSessionAsync(Guid userId)
    {
        return await _context.AiChatSessions
            .Where(s => s.UserId == userId && s.DeletedAt == null)
            .OrderByDescending(s => s.LastActivityAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<AiChatMessage>> GetMessagesAsync(Guid sessionId, int limit = 100)
    {
        return await _context.AiChatMessages
            .Where(m => m.SessionId == sessionId)
            .OrderBy(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<AiChatSession?> GetSessionAsync(Guid sessionId, Guid userId)
    {
        return await _context.AiChatSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId && s.DeletedAt == null);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task SoftDeleteSessionAsync(Guid sessionId, Guid userId)
    {
        var session = await _context.AiChatSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

        if (session != null)
        {
            session.DeletedAt = DateTime.UtcNow;
        }
    }
}

