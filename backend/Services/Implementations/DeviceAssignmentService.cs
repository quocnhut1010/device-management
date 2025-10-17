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
            // Check if device is already assigned
            var existingAssignment = await _context.DeviceAssignments
                .FirstOrDefaultAsync(da => da.DeviceId == createDto.DeviceId && !da.IsDeleted && da.ReturnedDate == null);

            if (existingAssignment != null)
            {
                throw new InvalidOperationException("Device is already assigned to another user");
            }

            var assignment = new DeviceAssignment
            {
                Id = Guid.NewGuid(),
                DeviceId = createDto.DeviceId,
                AssignedToUserId = createDto.AssignedToUserId,
                AssignedToDepartmentId = createDto.AssignedToDepartmentId,
                AssignedDate = createDto.AssignedDate ?? DateTime.UtcNow,
                Note = createDto.Note,
                AssignedByUserId = currentUserId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUserId,
                IsDeleted = false
            };

            _context.DeviceAssignments.Add(assignment);
            
            // Update device status and current user info
            var device = await _context.Devices.FindAsync(createDto.DeviceId);
            if (device != null)
            {
                device.Status = "Đang sử dụng";
                device.CurrentUserId = createDto.AssignedToUserId;
                device.CurrentDepartmentId = createDto.AssignedToDepartmentId;
                device.UpdatedAt = DateTime.UtcNow;
                device.UpdatedBy = currentUserId;
            }

            await _context.SaveChangesAsync();

            // Log device assignment
            if (device != null)
            {
                var assignedUser = await _context.Users.FindAsync(createDto.AssignedToUserId);
                var assignedDept = createDto.AssignedToDepartmentId != Guid.Empty 
                    ? await _context.Departments.FindAsync(createDto.AssignedToDepartmentId)
                    : null;
                    
                var assignedToInfo = assignedUser != null 
                    ? $"user {assignedUser.FullName}"
                    : assignedDept != null 
                        ? $"department {assignedDept.DepartmentName}"
                        : "unknown";
                        
                await _deviceHistoryService.LogActionAsync(
                    device.Id,
                    "Device Assigned",
                    currentUserId,
                    $"Device '{device.DeviceName}' was assigned to {assignedToInfo}",
                    "ASSIGNMENT");
            }

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

            assignment.ReturnedDate = DateTime.UtcNow;
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
                    "Device Assignment Revoked",
                    currentUserId,
                    $"Device '{device.DeviceName}' assignment was revoked and device is now available",
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

            // Mark current assignment as returned
            assignment.ReturnedDate = DateTime.UtcNow;
            assignment.UpdatedAt = DateTime.UtcNow;
            assignment.UpdatedBy = currentUserId;

            // Create new assignment for the new user
            var newAssignment = new DeviceAssignment
            {
                Id = Guid.NewGuid(),
                DeviceId = assignment.DeviceId,
                AssignedToUserId = transferDto.AssignedToUserId,
                AssignedToDepartmentId = transferDto.AssignedToDepartmentId,
                AssignedDate = DateTime.UtcNow,
                Note = transferDto.Note,
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
                ReturnedDate = assignment.ReturnedDate,
                CreatedAt = assignment.CreatedAt,
                CreatedBy = assignment.CreatedBy,
                UpdatedAt = assignment.UpdatedAt,
                UpdatedBy = assignment.UpdatedBy,
                IsDeleted = assignment.IsDeleted,
                DeletedAt = assignment.DeletedAt,
                DeletedBy = assignment.DeletedBy
            };
        }
    }
}