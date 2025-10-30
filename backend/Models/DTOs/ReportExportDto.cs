using System;
using System.Collections.Generic;

namespace backend.Models.DTOs
{
    public class ReportExportDto
    {
        public Guid Id { get; set; }
        public string ReportType { get; set; } = string.Empty;
        public DateTime ExportDate { get; set; }
        public string ExportedByName { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
    }

    public class ExportRequestDto
    {
        public string ReportType { get; set; } = string.Empty; // "Devices", "Repairs", "Incidents", "Liquidation"
        public string Format { get; set; } = string.Empty; // "Excel", "PDF"
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool SaveToHistory { get; set; } = false;
        public Dictionary<string, string>? Filters { get; set; }
    }
}
