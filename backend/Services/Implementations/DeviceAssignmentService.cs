using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
    public class DeviceAssignmentService : IDeviceAssignmentService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IDeviceHistoryService _deviceHistoryService;

        public DeviceAssignmentService(DeviceManagementDbContext context, IDeviceHistoryService deviceHistoryService)
        {
            _context = context;
            _deviceHistoryService = deviceHistoryService;
        }

        public async Task<List<DeviceAssignmentDto>> GetAllAsync()
        {
            var assignments = await _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .Where(da => !da.IsDeleted)
                .ToListAsync();

            return assignments.Select(MapToDto).ToList();
        }

        public async Task<object> GetAllPagedAsync(int page, int pageSize, string? status = null)
        {
            var query = _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .Where(da => !da.IsDeleted)
                .AsQueryable();

            // Apply status filter
            if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
            {
                if (status.ToLower() == "active")
                {
                    query = query.Where(da => da.ReturnedDate == null);
                }
                else if (status.ToLower() == "returned")
                {
                    query = query.Where(da => da.ReturnedDate != null);
                }
            }

            // Sort: Priority to "Đang cấp phát" (returnedDate == null) first, then by AssignedDate DESC
            query = query.OrderBy(da => da.ReturnedDate != null ? 1 : 0)
                        .ThenByDescending(da => da.AssignedDate);

            // Get total count before pagination
            var total = await query.CountAsync();

            // Apply pagination
            var assignments = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var assignmentDtos = assignments.Select(MapToDto).ToList();

            return new
            {
                items = assignmentDtos,
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)total / pageSize)
            };
        }

        public async Task<DeviceAssignmentDto?> GetByIdAsync(Guid id)
        {
            var assignment = await _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .FirstOrDefaultAsync(da => da.Id == id && !da.IsDeleted);

            return assignment != null ? MapToDto(assignment) : null;
        }

        public async Task<DeviceAssignmentDto?> CreateAsync(CreateDeviceAssignmentDto createDto, Guid currentUserId)
        {
            // Check if device already has an active or pending assignment
            var existingAssignment = await _context.DeviceAssignments
                .FirstOrDefaultAsync(da =>
                    da.DeviceId == createDto.DeviceId &&
                    !da.IsDeleted &&
                    da.ReturnedDate == null &&
                    (da.Status == "Pending" || da.Status == "Accepted"));

            if (existingAssignment != null)
            {
                throw new InvalidOperationException("Device already has an active or pending assignment");
            }

            // Create assignment in Pending state - waiting for employee confirmation
            var assignment = new DeviceAssignment
            {
                Id = Guid.NewGuid(),
                DeviceId = createDto.DeviceId,
                AssignedToUserId = createDto.AssignedToUserId,
                AssignedToDepartmentId = createDto.AssignedToDepartmentId,
                AssignedDate = createDto.AssignedDate?.Date ?? DateTime.UtcNow.Date,
                Note = createDto.Note,
                Status = "Pending",
                AssignedByUserId = currentUserId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUserId,
                IsDeleted = false
            };

            _context.DeviceAssignments.Add(assignment);

            // Lưu lại assignment Pending, KHÔNG cập nhật trạng thái thiết bị và người dùng hiện tại
            await _context.SaveChangesAsync();

            // Reload with includes
            assignment = await _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .FirstAsync(da => da.Id == assignment.Id);

            return MapToDto(assignment);
        }

        public async Task<bool> SoftDeleteAsync(Guid id, Guid currentUserId)
        {
            var assignment = await _context.DeviceAssignments.FindAsync(id);
            if (assignment == null)
                return false;

            // Chỉ trả thiết bị về trạng thái sẵn sàng nếu assignment đang được chấp nhận và chưa trả
            if (!assignment.IsDeleted &&
                assignment.ReturnedDate == null &&
                string.Equals(assignment.Status, "Accepted", StringComparison.OrdinalIgnoreCase))
            {
                var device = await _context.Devices.FindAsync(assignment.DeviceId);
                if (device != null)
                {
                    device.Status = "Sẵn sàng";
                    device.CurrentUserId = null;         // Clear current user
                    device.CurrentDepartmentId = null;   // Clear current department
                    device.UpdatedAt = DateTime.UtcNow;
                    device.UpdatedBy = currentUserId;
                }
            }

            assignment.IsDeleted = true;
            assignment.DeletedAt = DateTime.UtcNow;
            assignment.DeletedBy = currentUserId;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RevokeAsync(Guid id, Guid currentUserId)
        {
            var assignment = await _context.DeviceAssignments.FindAsync(id);
            if (assignment == null || assignment.IsDeleted || assignment.ReturnedDate != null)
                return false;

            // Chỉ thu hồi các assignment đã được chấp nhận
            if (!string.Equals(assignment.Status, "Accepted", StringComparison.OrdinalIgnoreCase))
                return false;

            assignment.ReturnedDate = DateTime.UtcNow.Date;
            assignment.UpdatedAt = DateTime.UtcNow;
            assignment.UpdatedBy = currentUserId;

            // Update device status and clear current user/department info
            var device = await _context.Devices.FindAsync(assignment.DeviceId);
            if (device != null)
            {
                device.Status = "Sẵn sàng";
                device.CurrentUserId = null;         // Clear current user
                device.CurrentDepartmentId = null;   // Clear current department
                device.UpdatedAt = DateTime.UtcNow;
                device.UpdatedBy = currentUserId;
            }

            await _context.SaveChangesAsync();
            
            // Log device revocation
            if (device != null)
            {
                await _deviceHistoryService.LogActionAsync(
                    device.Id,
                    "Thu hồi thiết bị",
                    currentUserId,
                    $"Thiết bị '{device.DeviceName}' đã được thu hồi và chuyển về trạng thái sẵn sàng",
                    "REVOCATION");
            }
            
            return true;
        }

        public async Task<DeviceAssignmentDto?> TransferAsync(Guid id, CreateDeviceAssignmentDto transferDto, Guid currentUserId)
        {
            var assignment = await _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .FirstOrDefaultAsync(da => da.Id == id && !da.IsDeleted && da.ReturnedDate == null);

            if (assignment == null)
                throw new InvalidOperationException("Assignment not found or not active");

            // Chỉ cho phép transfer từ assignment đã được chấp nhận
            if (!string.Equals(assignment.Status, "Accepted", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Only accepted assignments can be transferred");

            // Mark current assignment as returned
            assignment.ReturnedDate = DateTime.UtcNow.Date;
            assignment.UpdatedAt = DateTime.UtcNow;
            assignment.UpdatedBy = currentUserId;

            // Create new assignment for the new user
            var newAssignment = new DeviceAssignment
            {
                Id = Guid.NewGuid(),
                DeviceId = assignment.DeviceId,
                AssignedToUserId = transferDto.AssignedToUserId,
                AssignedToDepartmentId = transferDto.AssignedToDepartmentId,
                AssignedDate = DateTime.UtcNow.Date,
                Note = transferDto.Note,
                Status = "Accepted", // Transfer là hành động chủ động, coi như đã được chấp nhận
                AssignedByUserId = currentUserId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUserId,
                IsDeleted = false
            };

            _context.DeviceAssignments.Add(newAssignment);
            
            // Update device with new user/department info
            var device = await _context.Devices.FindAsync(assignment.DeviceId);
            if (device != null)
            {
                device.CurrentUserId = transferDto.AssignedToUserId;
                device.CurrentDepartmentId = transferDto.AssignedToDepartmentId;
                device.UpdatedAt = DateTime.UtcNow;
                device.UpdatedBy = currentUserId;
                // Status remains "Đang sử dụng" since it's a transfer, not a return
            }
            
            await _context.SaveChangesAsync();

            // Reload with includes
            newAssignment = await _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .FirstAsync(da => da.Id == newAssignment.Id);

            return MapToDto(newAssignment);
        }

        public async Task<DeviceAssignmentDto?> ConfirmAsync(Guid id, Guid currentUserId, string action, string? rejectionReason = null)
        {
            if (string.IsNullOrWhiteSpace(action))
            {
                throw new ArgumentException("Action is required", nameof(action));
            }

            action = action.ToLowerInvariant();

            var assignment = await _context.DeviceAssignments
                .Include(da => da.Device)
                .FirstOrDefaultAsync(da => da.Id == id && !da.IsDeleted);

            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            // Chỉ cho phép xác nhận khi đang ở trạng thái Pending
            if (!string.Equals(assignment.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only pending assignments can be confirmed");
            }

            // Chỉ chính nhân viên được gán mới được xác nhận
            if (assignment.AssignedToUserId == null || assignment.AssignedToUserId.Value != currentUserId)
            {
                throw new UnauthorizedAccessException("You are not allowed to confirm this assignment");
            }

            assignment.UserConfirmedAt = DateTime.UtcNow;
            assignment.UserConfirmedBy = currentUserId;
            assignment.UpdatedAt = DateTime.UtcNow;
            assignment.UpdatedBy = currentUserId;

            var device = await _context.Devices.FindAsync(assignment.DeviceId);

            if (action == "accept")
            {
                assignment.Status = "Accepted";

                if (device != null)
                {
                    device.Status = "Đang sử dụng";
                    device.CurrentUserId = assignment.AssignedToUserId;
                    device.CurrentDepartmentId = assignment.AssignedToDepartmentId;
                    device.UpdatedAt = DateTime.UtcNow;
                    device.UpdatedBy = currentUserId;
                }
            }
            else if (action == "reject")
            {
                assignment.Status = "Rejected";
                assignment.RejectionReason = rejectionReason; // Lưu lý do từ chối
                // Không cập nhật device: vẫn ở trạng thái cho phép cấp phát tiếp
            }
            else
            {
                throw new ArgumentException("Invalid action. Must be 'accept' or 'reject'.", nameof(action));
            }

            await _context.SaveChangesAsync();

            // Reload with includes for DTO mapping
            assignment = await _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .FirstAsync(da => da.Id == assignment.Id);

            return MapToDto(assignment);
        }

        public async Task<List<DeviceAssignmentDto>> GetAssignmentsByUserIdAsync(Guid userId)
        {
            var assignments = await _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .Where(da => da.AssignedToUserId == userId && !da.IsDeleted)
                .ToListAsync();

            return assignments.Select(MapToDto).ToList();
        }

        public async Task<List<DeviceAssignmentDto>> GetAssignmentsByDeviceIdAsync(Guid deviceId)
        {
            var assignments = await _context.DeviceAssignments
                .Include(da => da.Device)
                .Include(da => da.AssignedToUser)
                .Include(da => da.AssignedToDepartment)
                .Include(da => da.AssignedByUser)
                .Where(da => da.DeviceId == deviceId)
                .OrderByDescending(da => da.AssignedDate)
                .ToListAsync();

            return assignments.Select(MapToDto).ToList();
        }

        private static DeviceAssignmentDto MapToDto(DeviceAssignment assignment)
        {
            return new DeviceAssignmentDto
            {
                Id = assignment.Id,
                DeviceId = assignment.DeviceId ?? Guid.Empty,
                DeviceCode = assignment.Device?.DeviceCode ?? "Unknown",
                DeviceName = assignment.Device?.DeviceName ?? "Unknown Device",
                AssignedToUserId = assignment.AssignedToUserId ?? Guid.Empty,
                AssignedToUserName = assignment.AssignedToUser?.FullName ?? "Unknown User",
                AssignedToDepartmentId = assignment.AssignedToDepartmentId ?? Guid.Empty,
                AssignedToDepartmentName = assignment.AssignedToDepartment?.DepartmentName ?? "Unknown Department",
                AssignedByUserId = assignment.AssignedByUserId,
                AssignedByUserName = assignment.AssignedByUser?.FullName ?? "Unknown",
                AssignedDate = assignment.AssignedDate ?? DateTime.MinValue,
                Note = assignment.Note,
                Status = assignment.Status,
                ReturnedDate = assignment.ReturnedDate,
                CreatedAt = assignment.CreatedAt,
                CreatedBy = assignment.CreatedBy,
                UpdatedAt = assignment.UpdatedAt,
                UpdatedBy = assignment.UpdatedBy,
                IsDeleted = assignment.IsDeleted,
                DeletedAt = assignment.DeletedAt,
                DeletedBy = assignment.DeletedBy,
                UserConfirmedAt = assignment.UserConfirmedAt,
                UserConfirmedBy = assignment.UserConfirmedBy,
                RejectionReason = assignment.RejectionReason
            };
        }
    }
}