using backend.Models.Entities;

namespace backend.Services.Interfaces;

public interface INotificationService
{
    // Get notifications for a user
    Task<List<Notification>> GetUserNotificationsAsync(Guid userId, bool? isRead = null);
    
    // Get unread count for a user
    Task<int> GetUnreadCountAsync(Guid userId);
    
    // Mark notification as read
    Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId);
    
    // Mark all notifications as read for a user
    Task<bool> MarkAllAsReadAsync(Guid userId);
    
    // Create and send notification to a specific user
    Task<bool> CreateNotificationAsync(Guid userId, string title, string content);
    
    // Create and send notification to multiple users
    Task<bool> CreateNotificationsAsync(List<Guid> userIds, string title, string content);
    
    // Notification triggers for specific scenarios
    Task NotifyNewIncidentReportAsync(Guid incidentReportId);
    Task NotifyIncidentReportStatusChangedAsync(Guid incidentReportId, bool isApproved, string? rejectionReason = null);
    Task NotifyRepairCompletedAsync(Guid repairId);
    Task NotifyRepairRejectedAsync(Guid repairId, string rejectionReason);
    Task NotifyRepairAssignedAsync(Guid repairId, Guid technicianId);
    Task NotifyDeviceAssignedAsync(Guid deviceAssignmentId);
    Task NotifyDeviceReplacedAsync(Guid replacementId);
    Task NotifyRepairFeedbackCreatedAsync(Guid repairFeedbackId);
}