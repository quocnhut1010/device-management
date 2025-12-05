using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Enums;
using backend.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace backend.Services.Implementations;

/// <summary>
/// Bộ phân loại văn bản đơn giản dùng Naive Bayes cho các intent cố định của chatbox.
/// Không phụ thuộc ML framework, chỉ dùng in-memory.
/// </summary>
public class NaiveBayesTextClassifier : IChatIntentClassifier
{
    private readonly ILogger<NaiveBayesTextClassifier> _logger;

    private readonly Dictionary<ChatIntent, Dictionary<string, int>> _tokenCountsByIntent = new();
    private readonly Dictionary<ChatIntent, int> _totalTokensByIntent = new();
    private readonly Dictionary<ChatIntent, double> _priors = new();
    private readonly HashSet<string> _vocabulary = new();
    private readonly HashSet<string> _stopWords;
    private bool _isTrained;

    private static readonly Regex TokenRegex = new(@"[a-zA-Z0-9À-ỹ]+", RegexOptions.Compiled);

    public NaiveBayesTextClassifier(ILogger<NaiveBayesTextClassifier> logger)
    {
        _logger = logger;
        _stopWords = BuildStopWords();
        TrainIfNeeded();
    }

    public Task<ChatIntentClassificationResultDto> ClassifyAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Task.FromResult(new ChatIntentClassificationResultDto
            {
                Intent = ChatIntent.Unknown,
                Confidence = 0,
                OriginalQuery = query ?? string.Empty,
                NormalizedQuery = string.Empty
            });
        }

        TrainIfNeeded();

        var normalized = NormalizeText(query);
        var tokens = Tokenize(normalized);

        if (tokens.Count == 0)
        {
            return Task.FromResult(new ChatIntentClassificationResultDto
            {
                Intent = ChatIntent.Unknown,
                Confidence = 0,
                OriginalQuery = query,
                NormalizedQuery = normalized
            });
        }

        var logScores = new Dictionary<ChatIntent, double>();
        int vocabSize = _vocabulary.Count == 0 ? 1 : _vocabulary.Count;

        foreach (var intentKey in _priors.Keys)
        {
            // log P(intent)
            double logScore = Math.Log(_priors[intentKey]);

            _tokenCountsByIntent.TryGetValue(intentKey, out var tokenCounts);
            int totalTokens = _totalTokensByIntent.TryGetValue(intentKey, out var t) ? t : 0;

            foreach (var token in tokens)
            {
                int count = tokenCounts != null && tokenCounts.TryGetValue(token, out var c) ? c : 0;
                // Laplace smoothing: (count + 1) / (totalTokens + |V|)
                double likelihood = (count + 1.0) / (totalTokens + vocabSize);
                logScore += Math.Log(likelihood);
            }

            logScores[intentKey] = logScore;
        }

        // Chuyển log-score về xác suất tương đối
        // để lấy confidence ~ softmax.
        var maxLog = logScores.Values.Max();
        var expScores = logScores.ToDictionary(
            kvp => kvp.Key,
            kvp => Math.Exp(kvp.Value - maxLog)
        );
        var sumExp = expScores.Values.Sum();

        var probs = expScores.ToDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value / sumExp
        );

        var best = probs.OrderByDescending(p => p.Value).First();

        // Ngưỡng tối thiểu để coi là có ý nghĩa (có thể điều chỉnh)
        var intent = best.Value >= 0.5 ? best.Key : ChatIntent.Unknown;

        var result = new ChatIntentClassificationResultDto
        {
            Intent = intent,
            Confidence = best.Value,
            OriginalQuery = query,
            NormalizedQuery = normalized,
            Scores = probs
        };

        result.SuggestedEndpoint = MapIntentToEndpoint(intent);

        return Task.FromResult(result);
    }

    private void TrainIfNeeded()
    {
        if (_isTrained)
        {
            return;
        }

        lock (_tokenCountsByIntent)
        {
            if (_isTrained)
            {
                return;
            }

            try
            {
                var samples = ChatbotTrainingSamples.GetSamples();
                if (samples == null || samples.Count == 0)
                {
                    _logger.LogWarning("ChatbotTrainingSamples không có dữ liệu, không thể huấn luyện classifier.");
                    _isTrained = true;
                    return;
                }

                int totalDocuments = 0;
                var documentsPerIntent = new Dictionary<ChatIntent, int>();

                foreach (var pair in samples)
                {
                    var intent = pair.Key;
                    var texts = pair.Value ?? Array.Empty<string>();

                    if (!_tokenCountsByIntent.ContainsKey(intent))
                    {
                        _tokenCountsByIntent[intent] = new Dictionary<string, int>();
                        _totalTokensByIntent[intent] = 0;
                    }

                    foreach (var text in texts)
                    {
                        if (string.IsNullOrWhiteSpace(text))
                        {
                            continue;
                        }

                        totalDocuments++;
                        if (!documentsPerIntent.ContainsKey(intent))
                        {
                            documentsPerIntent[intent] = 0;
                        }
                        documentsPerIntent[intent]++;

                        var normalized = NormalizeText(text);
                        var tokens = Tokenize(normalized);

                        foreach (var token in tokens)
                        {
                            _vocabulary.Add(token);

                            if (!_tokenCountsByIntent[intent].ContainsKey(token))
                            {
                                _tokenCountsByIntent[intent][token] = 0;
                            }

                            _tokenCountsByIntent[intent][token]++;
                            _totalTokensByIntent[intent]++;
                        }
                    }
                }

                // Tính prior P(intent)
                foreach (var kvp in documentsPerIntent)
                {
                    _priors[kvp.Key] = (double)kvp.Value / Math.Max(1, totalDocuments);
                }

                _isTrained = true;
                _logger.LogInformation("NaiveBayesTextClassifier đã được huấn luyện với {DocCount} mẫu.", totalDocuments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi huấn luyện NaiveBayesTextClassifier.");
                _isTrained = true;
            }
        }
    }

    private static string NormalizeText(string text)
    {
        var lower = text.ToLowerInvariant().Trim();
        var noDiacritics = RemoveDiacritics(lower);
        return noDiacritics;
    }

    private List<string> Tokenize(string text)
    {
        var matches = TokenRegex.Matches(text);
        var tokens = new List<string>();

        foreach (Match match in matches)
        {
            var token = match.Value.Trim();
            if (token.Length == 0)
            {
                continue;
            }

            if (_stopWords.Contains(token))
            {
                continue;
            }

            tokens.Add(token);
        }

        return tokens;
    }

    private static HashSet<string> BuildStopWords()
    {
        // Danh sách stop-word tiếng Việt cơ bản (có thể mở rộng sau).
        var words = new[]
        {
            "la", "là", "cua", "của", "va", "và", "thi", "thì",
            "lại", "lại", "mot", "một", "cac", "các", "nhung", "những",
            "tren", "trên", "duoi", "dưới", "trong", "ngoai", "ngoài",
            "toi", "tôi", "ban", "bạn", "cho", "giup", "giúp",
            "muon", "muốn", "can", "cần", "hay", "hoac", "hoặc",
            "là", "làm", "lam", "de", "để", "ve", "về",
            "nay", "này", "kia", "do", "đó", "day", "đây"
        };

        return new HashSet<string>(words.Select(RemoveDiacritics).Select(w => w.ToLowerInvariant()));
    }

    private static string RemoveDiacritics(string text)
    {
        if (string.IsNullOrEmpty(text))
        {
            return text;
        }

        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalized)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }

    private static string? MapIntentToEndpoint(ChatIntent intent)
    {
        return intent switch
        {
            ChatIntent.TraCuuThietBi => "/api/devices",
            ChatIntent.BaoCaoSuCo => "/api/incidentreport",
            ChatIntent.ThongKeThietBiTheoPhongBan => "/api/ai-reports/process",
            ChatIntent.HuongDanSuDung => "/api/ai-chat/help", // endpoint gợi ý, có thể điều chỉnh sau
            ChatIntent.KiemTraTinhTrangSuaChua => "/api/repair",
            _ => null
        };
    }
}


