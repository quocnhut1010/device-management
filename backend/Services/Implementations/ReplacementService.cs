using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AutoMapper;

namespace backend.Services.Implementations
{
    public class ReplacementService : IReplacementService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ReplacementService> _logger;
        private readonly IDeviceHistoryService _deviceHistoryService;

        public ReplacementService(
            DeviceManagementDbContext context,
            IMapper mapper,
            ILogger<ReplacementService> logger,
            IDeviceHistoryService deviceHistoryService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _deviceHistoryService = deviceHistoryService;
        }

        public async Task<IEnumerable<SuggestedDeviceDto>> GetSuggestedReplacementDevicesAsync(Guid oldDeviceId)
        {
            _logger.LogInformation("Getting suggested replacement devices for device {DeviceId}", oldDeviceId);

            var oldDevice = await _context.Devices
                .Include(d => d.Model)
                .ThenInclude(m => m!.DeviceType)
                .FirstOrDefaultAsync(d => d.Id == oldDeviceId);

            if (oldDevice == null)
            {
                _logger.LogWarning("Old device {DeviceId} not found", oldDeviceId);
                return Enumerable.Empty<SuggestedDeviceDto>();
            }

            // Lấy thiết bị có cùng model và trạng thái available
            var sameModelDevices = await _context.Devices
                .Include(d => d.Model)
                .ThenInclude(m => m!.DeviceType)
                .Where(d => d.ModelId == oldDevice.ModelId 
                           && d.Status == "Sẵn sàng" || d.Status == "Chưa cấp phát"
                           && d.Id != oldDeviceId
                           && d.IsDeleted == false)
                .OrderBy(d => d.PurchaseDate)
                .ToListAsync();

            var result = sameModelDevices.Select(d => new SuggestedDeviceDto
            {
                Id = d.Id,
                DeviceCode = d.DeviceCode ?? string.Empty,
                DeviceName = d.DeviceName ?? string.Empty,
                ModelName = d.Model?.ModelName ?? string.Empty,
                TypeName = d.Model?.DeviceType?.TypeName ?? string.Empty,
                Status = d.Status ?? string.Empty,
                PurchaseDate = d.PurchaseDate,
                PurchasePrice = d.PurchasePrice,
                DeviceImageUrl = d.DeviceImageUrl,
                IsSameModel = true
            }).ToList();

            _logger.LogInformation("Found {Count} same model devices for replacement", result.Count);
            return result;
        }

        public async Task<IEnumerable<SuggestedDeviceDto>> GetAllAvailableDevicesAsync()
        {
            _logger.LogInformation("Getting all available devices for replacement");

            var availableDevices = await _context.Devices
                .Include(d => d.Model)
                .ThenInclude(m => m!.DeviceType)
                .Where(d => d.Status == "Sẵn sàng" || d.Status == "Chưa cấp phát" && d.IsDeleted == false)
                .OrderBy(d => d.Model.DeviceType.TypeName)
                .ThenBy(d => d.Model.ModelName)
                .ThenBy(d => d.PurchaseDate)
                .ToListAsync();

            var result = availableDevices.Select(d => new SuggestedDeviceDto
            {
                Id = d.Id,
                DeviceCode = d.DeviceCode ?? string.Empty,
                DeviceName = d.DeviceName ?? string.Empty,
                ModelName = d.Model?.ModelName ?? string.Empty,
                TypeName = d.Model?.DeviceType?.TypeName ?? string.Empty,
                Status = d.Status ?? string.Empty,
                PurchaseDate = d.PurchaseDate,
                PurchasePrice = d.PurchasePrice,
                DeviceImageUrl = d.DeviceImageUrl,
                IsSameModel = false // Will be set by frontend if needed
            }).ToList();

            _logger.LogInformation("Found {Count} available devices", result.Count);
            return result;
        }

      public async Task<ReplacementDto> CreateReplacementAsync(CreateReplacementDto createReplacementDto, Guid performedBy)
        {
            _logger.LogInformation("Creating replacement: Old device {OldDeviceId} -> New device {NewDeviceId}", 
                createReplacementDto.OldDeviceId, createReplacementDto.NewDeviceId);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1️⃣ Xác thực thiết bị cũ
                var oldDevice = await _context.Devices
                    .Include(d => d.CurrentUser)
                    .Include(d => d.CurrentDepartment)
                    .FirstOrDefaultAsync(d => d.Id == createReplacementDto.OldDeviceId);

                if (oldDevice == null)
                    throw new ArgumentException($"Old device {createReplacementDto.OldDeviceId} not found");

                // 2️⃣ Kiểm tra trạng thái hợp lệ để thay thế
                if (oldDevice.Status != DeviceStatus.InUse 
                    && oldDevice.Status != DeviceStatus.Repairing 
                    && oldDevice.Status != DeviceStatus.PendingLiquidation)
                {
                    throw new InvalidOperationException(
                        $"Thiết bị cũ {oldDevice.DeviceCode} hiện ở trạng thái '{oldDevice.Status}' nên không thể thay thế.");
                }

                // 3️⃣ Xác thực thiết bị mới
                var newDevice = await _context.Devices
                    .FirstOrDefaultAsync(d => d.Id == createReplacementDto.NewDeviceId);

                if (newDevice == null)
                    throw new ArgumentException($"New device {createReplacementDto.NewDeviceId} not found");

                if (newDevice.Status != "Sẵn sàng" && newDevice.Status != "Chưa cấp phát")
                    throw new InvalidOperationException($"Thiết bị mới {newDevice.DeviceCode} không sẵn sàng để cấp phát.");

                // 4️⃣ Lấy thông tin cấp phát hiện tại (nếu có)
                var currentAssignment = await _context.DeviceAssignments
                    .FirstOrDefaultAsync(da => da.DeviceId == oldDevice.Id 
                                            && da.ReturnedDate == null 
                                            && !da.IsDeleted);

                // 5️⃣ Tạo bản ghi thay thế
                var replacement = new Replacement
                {
                    Id = Guid.NewGuid(),
                    OldDeviceId = createReplacementDto.OldDeviceId,
                    NewDeviceId = createReplacementDto.NewDeviceId,
                    ReplacementDate = DateTime.Now,
                    Reason = createReplacementDto.Reason
                };
                _context.Replacements.Add(replacement);

                // 6️⃣ Cập nhật trạng thái thiết bị cũ
                if (oldDevice.Status == "Chờ thanh lý")
                {
                    // Giữ nguyên trạng thái — chỉ log thêm lịch sử
                    await _deviceHistoryService.LogActionAsync(
                        oldDevice.Id,
                        "Device Replacement Before Liquidation",
                        performedBy,
                        $"Thiết bị đang chờ thanh lý được thay thế bằng {newDevice.DeviceCode}. Lý do: {createReplacementDto.Reason}"
                    );
                }
                else
                {
                    oldDevice.Status = "Đã thay thế";
                    oldDevice.CurrentUserId = null;
                    oldDevice.CurrentDepartmentId = null;
                    oldDevice.UpdatedAt = DateTime.Now;
                }

                // 7️⃣ Trả lại thiết bị cũ (nếu đang được gán)
                if (currentAssignment != null)
                {
                    currentAssignment.ReturnedDate = DateTime.Now;
                    currentAssignment.UpdatedAt = DateTime.Now;
                    currentAssignment.UpdatedBy = performedBy;

                    await _deviceHistoryService.LogActionAsync(
                        oldDevice.Id,
                        "Device Returned for Replacement",
                        performedBy,
                        $"Thiết bị {oldDevice.DeviceCode} được thu hồi để thay thế. Lý do: {createReplacementDto.Reason}"
                    );
                }

                // 8️⃣ Cấp phát thiết bị mới
                if (currentAssignment != null)
                {
                    var newAssignment = new DeviceAssignment
                    {
                        Id = Guid.NewGuid(),
                        DeviceId = createReplacementDto.NewDeviceId,
                        AssignedToUserId = currentAssignment.AssignedToUserId,
                        AssignedToDepartmentId = currentAssignment.AssignedToDepartmentId,
                        AssignedByUserId = performedBy,
                        AssignedDate = DateTime.Now,
                        Note = $"Device replacement. Old device: {oldDevice.DeviceCode}. Reason: {createReplacementDto.Reason}",
                        CreatedAt = DateTime.Now,
                        CreatedBy = performedBy
                    };

                    _context.DeviceAssignments.Add(newAssignment);

                    newDevice.Status = "Đang sử dụng";
                    newDevice.CurrentUserId = currentAssignment.AssignedToUserId;
                    newDevice.CurrentDepartmentId = currentAssignment.AssignedToDepartmentId;
                }
                else
                {
                    // Nếu không có cấp phát cũ, chỉ đánh dấu sẵn sàng
                    newDevice.Status = "Sẵn sàng";
                }

                newDevice.UpdatedAt = DateTime.Now;

                // 9️⃣ Ghi lịch sử thay thế
                await _deviceHistoryService.LogActionAsync(
                    oldDevice.Id,
                    "Device Replaced",
                    performedBy,
                    $"Thiết bị {oldDevice.DeviceCode} được thay bằng {newDevice.DeviceCode}. Lý do: {createReplacementDto.Reason}"
                );

                await _deviceHistoryService.LogActionAsync(
                    newDevice.Id,
                    "Device Assigned as Replacement",
                    performedBy,
                    $"Thiết bị {newDevice.DeviceCode} được gán thay thế cho {oldDevice.DeviceCode}."
                );

                // 🔟 Cập nhật báo cáo sự cố nếu có
                if (createReplacementDto.IncidentReportId.HasValue)
                {
                    var incidentReport = await _context.IncidentReports
                        .FirstOrDefaultAsync(ir => ir.Id == createReplacementDto.IncidentReportId);

                    if (incidentReport != null)
                    {
                        incidentReport.Status = 3; // "Resolved"
                        await _deviceHistoryService.LogActionAsync(
                            oldDevice.Id,
                            "Incident Resolved by Replacement",
                            performedBy,
                            $"Báo cáo sự cố {incidentReport.Id} được xử lý bằng việc thay thế thiết bị."
                        );
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 🔁 Trả về bản ghi đầy đủ
                var createdReplacement = await GetReplacementByIdAsync(replacement.Id)
                    ?? throw new InvalidOperationException("Không thể lấy thông tin thay thế sau khi tạo.");

                _logger.LogInformation("Successfully created replacement {ReplacementId}", replacement.Id);
                return createdReplacement;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating replacement: Old device {OldDeviceId} -> New device {NewDeviceId}", 
                    createReplacementDto.OldDeviceId, createReplacementDto.NewDeviceId);
                throw;
            }
        }


        public async Task<IEnumerable<ReplacementDto>> GetReplacementHistoryAsync(Guid? deviceId, Guid userId, string role)
        {
            var query = _context.Replacements
                .Include(r => r.OldDevice).ThenInclude(d => d!.CurrentUser)
                .Include(r => r.NewDevice)
                .AsQueryable();

            // 🔒 Nếu không phải Admin, chỉ hiển thị thiết bị thuộc user này
            if (role != "Admin")
            {
                query = query.Where(r =>
                    (r.OldDevice != null && r.OldDevice.CurrentUserId == userId) ||
                    (r.NewDevice != null && r.NewDevice.CurrentUserId == userId)
                );
            }

            if (deviceId.HasValue)
                query = query.Where(r => r.OldDeviceId == deviceId || r.NewDeviceId == deviceId);

            var replacements = await query.OrderByDescending(r => r.ReplacementDate).ToListAsync();

            return replacements.Select(r => new ReplacementDto
            {
                Id = r.Id,
                OldDeviceId = r.OldDeviceId,
                NewDeviceId = r.NewDeviceId,
                ReplacementDate = r.ReplacementDate,
                Reason = r.Reason,
                OldDeviceCode = r.OldDevice?.DeviceCode,
                OldDeviceName = r.OldDevice?.DeviceName,
                NewDeviceCode = r.NewDevice?.DeviceCode,
                NewDeviceName = r.NewDevice?.DeviceName,
                UserId = r.OldDevice?.CurrentUserId,
                UserFullName = r.OldDevice?.CurrentUser?.FullName,
                UserEmail = r.OldDevice?.CurrentUser?.Email
            }).ToList();
        }


        public async Task<ReplacementDto?> GetReplacementByIdAsync(Guid id)
        {
            _logger.LogInformation("Getting replacement by ID {ReplacementId}", id);

            var replacement = await _context.Replacements
                .Include(r => r.OldDevice)
                .ThenInclude(d => d!.CurrentUser)
                .Include(r => r.NewDevice)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (replacement == null)
            {
                _logger.LogWarning("Replacement {ReplacementId} not found", id);
                return null;
            }

            var result = new ReplacementDto
            {
                Id = replacement.Id,
                OldDeviceId = replacement.OldDeviceId,
                NewDeviceId = replacement.NewDeviceId,
                ReplacementDate = replacement.ReplacementDate,
                Reason = replacement.Reason,
                OldDeviceCode = replacement.OldDevice?.DeviceCode,
                OldDeviceName = replacement.OldDevice?.DeviceName,
                NewDeviceCode = replacement.NewDevice?.DeviceCode,
                NewDeviceName = replacement.NewDevice?.DeviceName,
                UserId = replacement.OldDevice?.CurrentUserId,
                UserFullName = replacement.OldDevice?.CurrentUser?.FullName,
                UserEmail = replacement.OldDevice?.CurrentUser?.Email
            };

            _logger.LogInformation("Found replacement {ReplacementId}", id);
            return result;
        }
    }
}