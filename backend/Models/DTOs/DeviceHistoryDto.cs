using System;
using System.Collections.Generic;

namespace backend.Models.DTOs
{
    public class DeviceHistoryDto
    {
        public Guid Id { get; set; }
        public Guid DeviceId { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid ActionBy { get; set; }
        public string ActionByName { get; set; } = string.Empty;
        public DateTime ActionDate { get; set; }
        public string ActionType { get; set; } = string.Empty; // CREATE, UPDATE, DELETE, MAINTENANCE, etc.
    }

    public class DeviceHistoryFilterDto
    {
        public Guid? DeviceId { get; set; }
        public Guid? UserId { get; set; }
        public string? Action { get; set; }
        public string? ActionType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "ActionDate";
        public string SortOrder { get; set; } = "desc";
    }

    public class DeviceHistoryTimelineDto
    {
        public DateTime Date { get; set; }
        public List<DeviceHistoryDto> Events { get; set; } = new List<DeviceHistoryDto>();
        public int EventCount { get; set; }
    }

    public class DeviceHistoryStatsDto
    {
        public int TotalEvents { get; set; }
        public int RecentEvents { get; set; } // Last 7 days
        public Dictionary<string, int> EventsByType { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> EventsByAction { get; set; } = new Dictionary<string, int>();
        public List<DeviceHistoryDto> RecentActivities { get; set; } = new List<DeviceHistoryDto>();
    }

    public class CreateDeviceHistoryDto
    {
        public Guid DeviceId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
    }

    public class BulkDeviceHistoryDto
    {
        public List<CreateDeviceHistoryDto> Histories { get; set; } = new List<CreateDeviceHistoryDto>();
    }
}