using System;

namespace backend.Models.DTOs
{
    public class AIReportRequestDto
    {
        public string Query { get; set; } = string.Empty;
    }

    public class AIReportResponseDto
    {
        public bool IsReportQuery { get; set; }
        public ExportRequestDto? ExportRequest { get; set; }
        public string? Message { get; set; }
        public string? Error { get; set; }
        public byte[]? FileData { get; set; }
        public string? FileName { get; set; }
        public string? ContentType { get; set; }
    }
}

