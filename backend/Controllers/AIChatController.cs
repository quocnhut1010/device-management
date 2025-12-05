using System.Security.Claims;
using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AIChatController : ControllerBase
{
    private readonly IAIChatService _aiChatService;
    private readonly IAuthService _authService;

    public AIChatController(IAIChatService aiChatService, IAuthService authService)
    {
        _aiChatService = aiChatService;
        _authService = authService;
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> StartOrResumeSession([FromBody] StartAiChatSessionDto? dto)
    {
        var userId = GetUserId();
        dto ??= new StartAiChatSessionDto();
        var result = await _aiChatService.StartOrResumeSessionAsync(userId, dto);
        return Ok(result);
    }

    [HttpGet("sessions/{sessionId:guid}")]
    public async Task<IActionResult> GetSession(Guid sessionId)
    {
        var userId = GetUserId();
        var result = await _aiChatService.GetSessionHistoryAsync(userId, sessionId);
        if (result == null)
        {
            return NotFound("Không tìm thấy phiên chat.");
        }

        return Ok(result);
    }

    [HttpPost("sessions/{sessionId:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid sessionId, [FromBody] SendAiChatMessageDto dto)
    {
        var userId = GetUserId();
        var isAdmin = _authService.IsAdmin(User);
        dto.SessionId = sessionId;
        var result = await _aiChatService.SendMessageAsync(userId, dto, isAdmin);
        return Ok(result);
    }

    [HttpDelete("sessions/{sessionId:guid}")]
    public async Task<IActionResult> ClearSession(Guid sessionId)
    {
        var userId = GetUserId();
        await _aiChatService.ClearSessionAsync(userId, sessionId);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var parsed))
        {
            throw new UnauthorizedAccessException("Không xác định được người dùng.");
        }

        return parsed;
    }
}

