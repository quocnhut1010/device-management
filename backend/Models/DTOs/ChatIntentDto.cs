using System;
using System.Collections.Generic;
using backend.Models.Enums;

namespace backend.Models.DTOs;

public class ChatIntentClassificationResultDto
{
    public ChatIntent Intent { get; set; }

    /// <summary>
    /// Xác suất (0-1) của intent được chọn.
    /// </summary>
    public double Confidence { get; set; }

    /// <summary>
    /// Điểm/xác suất chi tiết theo từng intent (để debug).
    /// </summary>
    public Dictionary<ChatIntent, double> Scores { get; set; } = new();

    /// <summary>
    /// Endpoint API gợi ý để frontend gọi tiếp (vd: /api/devices/search).
    /// Có thể null nếu không map được.
    /// </summary>
    public string? SuggestedEndpoint { get; set; }

    /// <summary>
    /// Câu hỏi gốc người dùng gửi.
    /// </summary>
    public string OriginalQuery { get; set; } = string.Empty;

    /// <summary>
    /// Câu đã được chuẩn hoá dùng cho phân loại (không dấu, lower-case, v.v.).
    /// </summary>
    public string NormalizedQuery { get; set; } = string.Empty;
}


