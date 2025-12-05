using System.Threading.Tasks;
using backend.Models.DTOs;

namespace backend.Services.Interfaces;

/// <summary>
/// Service phân loại câu hỏi chatbox thành các chủ đề (intent) cố định.
/// </summary>
public interface IChatIntentClassifier
{
    /// <summary>
    /// Phân loại câu hỏi người dùng, trả về intent, độ tin cậy và gợi ý endpoint.
    /// </summary>
    Task<ChatIntentClassificationResultDto> ClassifyAsync(string query);
}


