using backend.Data;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly DeviceManagementDbContext _context;

    public NotificationService(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(Guid userId, bool? isRead = null)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (isRead.HasValue)
        {
            query = query.Where(n => n.IsRead == isRead.Value);
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && n.IsRead == false);
    }

    public async Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && n.IsRead == false)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CreateNotificationAsync(Guid userId, string title, string content)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Content = content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CreateNotificationsAsync(List<Guid> userIds, string title, string content)
    {
        var notifications = userIds.Select(userId => new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Content = content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();
        return true;
    }

    // Specific notification scenarios
    public async Task NotifyNewIncidentReportAsync(Guid incidentReportId)
    {
        var incidentReport = await _context.IncidentReports
            .Include(ir => ir.Device)
            .Include(ir => ir.ReportedByUser)
            .FirstOrDefaultAsync(ir => ir.Id == incidentReportId);

        if (incidentReport == null) return;

        // Notify all Admins about new incident report
        var adminUsers = await _context.Users
            .Where(u => u.Role == "Admin" && u.IsActive == true && u.IsDeleted == false)
            .Select(u => u.Id)
            .ToListAsync();

        var title = "Có báo cáo sự cố mới";
        var content = $"Có báo cáo sự cố mới cho thiết bị {incidentReport.Device?.DeviceCode} từ nhân viên {incidentReport.ReportedByUser?.FullName} đang chờ bạn duyệt.";

        await CreateNotificationsAsync(adminUsers, title, content);
    }

    public async Task NotifyIncidentReportStatusChangedAsync(Guid incidentReportId, bool isApproved, string? rejectionReason = null)
    {
        var incidentReport = await _context.IncidentReports
            .Include(ir => ir.Device)
            .Include(ir => ir.ReportedByUser)
            .FirstOrDefaultAsync(ir => ir.Id == incidentReportId);

        if (incidentReport == null || incidentReport.ReportedByUserId == null) return;

        string title, content;
        if (isApproved)
        {
            title = "Báo cáo sự cố được duyệt";
            content = $"Báo cáo sự cố cho thiết bị {incidentReport.Device?.DeviceCode} của bạn đã được duyệt và đang được xử lý.";
        }
        else
        {
            title = "Báo cáo sự cố bị từ chối";
            content = $"Báo cáo sự cố cho thiết bị {incidentReport.Device?.DeviceCode} của bạn đã bị từ chối. Lý do: {rejectionReason}";
        }

        await CreateNotificationAsync(incidentReport.ReportedByUserId.Value, title, content);
    }

    public async Task NotifyRepairCompletedAsync(Guid repairId)
    {
        var repair = await _context.Repairs
            .Include(r => r.Device)
            .ThenInclude(d => d.CurrentUser)
            .FirstOrDefaultAsync(r => r.Id == repairId);

        if (repair == null) return;

        // Notify Admin about repair completion waiting for approval
        var adminUsers = await _context.Users
            .Where(u => u.Role == "Admin" && u.IsActive == true && u.IsDeleted == false)
            .Select(u => u.Id)
            .ToListAsync();

        var adminTitle = "Kỹ thuật viên hoàn thành sửa chữa";
        var adminContent = $"Kỹ thuật viên đã hoàn tất sửa chữa cho thiết bị {repair.Device?.DeviceCode}. Vui lòng vào xác nhận.";

        await CreateNotificationsAsync(adminUsers, adminTitle, adminContent);

        // If device has current user, notify them too
        if (repair.Device?.CurrentUserId != null)
        {
            var userTitle = "Thiết bị đã sửa xong";
            var userContent = $"Thiết bị {repair.Device.DeviceCode} của bạn đã được sửa chữa xong và sẵn sàng để nhận lại.";
            await CreateNotificationAsync(repair.Device.CurrentUserId.Value, userTitle, userContent);
        }
    }

    public async Task NotifyRepairRejectedAsync(Guid repairId, string rejectionReason)
    {
        var repair = await _context.Repairs
            .Include(r => r.Device)
            .FirstOrDefaultAsync(r => r.Id == repairId);

        if (repair == null) return;

        // Notify all Admins about repair rejection
        var adminUsers = await _context.Users
            .Where(u => u.Role == "Admin" && u.IsActive == true && u.IsDeleted == false)
            .Select(u => u.Id)
            .ToListAsync();

        var title = "Kỹ thuật viên từ chối lệnh sửa";
        var content = $"Lệnh sửa chữa cho thiết bị {repair.Device?.DeviceCode} đã bị từ chối. Vui lòng xem xét để có hướng xử lý tiếp theo.";

        await CreateNotificationsAsync(adminUsers, title, content);
    }

    public async Task NotifyRepairAssignedAsync(Guid repairId, Guid technicianId)
    {
        var repair = await _context.Repairs
            .Include(r => r.Device)
            .FirstOrDefaultAsync(r => r.Id == repairId);

        if (repair == null) return;

        var title = "Được giao lệnh sửa chữa mới";
        var content = $"Bạn có một lệnh sửa chữa mới được giao cho thiết bị {repair.Device?.DeviceCode}.";

        await CreateNotificationAsync(technicianId, title, content);
    }

    public async Task NotifyDeviceAssignedAsync(Guid deviceAssignmentId)
    {
        var assignment = await _context.DeviceAssignments
            .Include(da => da.Device)
            .Include(da => da.AssignedToUser)
            .FirstOrDefaultAsync(da => da.Id == deviceAssignmentId);

        if (assignment == null || assignment.AssignedToUserId == null) return;

        var title = "Được cấp phát thiết bị mới";
        var content = $"Bạn vừa được cấp phát thiết bị mới: {assignment.Device?.DeviceName} ({assignment.Device?.DeviceCode}).";

        await CreateNotificationAsync(assignment.AssignedToUserId.Value, title, content);
    }

    public async Task NotifyDeviceReplacedAsync(Guid replacementId)
    {
        var replacement = await _context.Replacements
            .Include(r => r.NewDevice)
            .Include(r => r.OldDevice)
            .ThenInclude(od => od.CurrentUser)
            .FirstOrDefaultAsync(r => r.Id == replacementId);

        if (replacement == null || replacement.OldDevice?.CurrentUserId == null) return;

        var title = "Được thay thế thiết bị";
        var content = $"Bạn vừa được thay thế thiết bị: {replacement.NewDevice?.DeviceName} ({replacement.NewDevice?.DeviceCode}) thay cho thiết bị {replacement.OldDevice?.DeviceCode}.";

        await CreateNotificationAsync(replacement.OldDevice.CurrentUserId.Value, title, content);
    }

    public async Task NotifyRepairFeedbackCreatedAsync(Guid repairFeedbackId)
    {
        var feedback = await _context.RepairFeedbacks
            .Include(rf => rf.Repair)
            .ThenInclude(r => r.Device)
            .FirstOrDefaultAsync(rf => rf.Id == repairFeedbackId);

        if (feedback == null) return;

        // Find the technician who worked on this repair
        // Assuming there's an AssignedToTechnicianId field in Repair entity
        // If not, we might need to get it from another way
        var repair = feedback.Repair;
        if (repair != null)
        {
            // For now, let's notify all technicians about feedback received
            // You might want to adjust this based on your actual repair assignment logic
            var technicianUsers = await _context.Users
                .Where(u => u.Role == "Kỹ thuật viên" && u.IsActive == true && u.IsDeleted == false)
                .Select(u => u.Id)
                .ToListAsync();

            var title = "Nhận được đánh giá";
            var content = $"Bạn vừa nhận được đánh giá {feedback.Rating} sao cho lượt sửa chữa thiết bị {repair.Device?.DeviceCode}.";

            await CreateNotificationsAsync(technicianUsers, title, content);
        }
    }
}