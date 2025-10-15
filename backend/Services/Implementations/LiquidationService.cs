using AutoMapper;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class LiquidationService : ILiquidationService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IMapper _mapper;

        public LiquidationService(DeviceManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<LiquidationEligibleDeviceDto>> GetEligibleDevicesAsync()
        {
            var eligibleDevices = new List<LiquidationEligibleDeviceDto>();

            // 1. Thiết bị có Status = "Chờ thanh lý", "Hỏng", "Mất"
            var devicesWithEligibleStatus = await _context.Devices
                .Include(d => d.Model).ThenInclude(m => m!.DeviceType)
                .Include(d => d.CurrentUser)
                .Include(d => d.CurrentDepartment)
                .Include(d => d.Repairs)
                .Where(d => d.IsDeleted != true && 
                           (d.Status == "Chờ thanh lý" || 
                            d.Status == "Đã hỏng" || 
                            d.Status == "Mất"))
                .ToListAsync();

            foreach (var device in devicesWithEligibleStatus)
            {
                // Kiểm tra không đang sửa chữa
                var hasActiveRepair = device.Repairs.Any(r => r.Status == 1 || r.Status == 2); // Đang sửa hoặc Chờ duyệt hoàn tất
                
                if (!hasActiveRepair)
                {
                    eligibleDevices.Add(new LiquidationEligibleDeviceDto
                    {
                        Id = device.Id,
                        DeviceCode = device.DeviceCode,
                        DeviceName = device.DeviceName,
                        Status = device.Status,
                        PurchaseDate = device.PurchaseDate,
                        PurchasePrice = device.PurchasePrice,
                        CurrentUserName = device.CurrentUser?.FullName,
                        CurrentUserFullName = device.CurrentUser?.FullName,
                        CurrentDepartmentName = device.CurrentDepartment?.DepartmentName,
                        EligibilityReason = $"Thiết bị có trạng thái: {device.Status}",
                        HasActiveRepair = false,
                        ModelName = device.Model?.ModelName,
                        TypeName = device.Model?.DeviceType?.TypeName
                    });
                }
            }

            // 2. Thiết bị từ incident reports có loại "Mất mát thiết bị" hoặc "Hỏng hóc phần cứng"
            var devicesFromIncidents = await _context.IncidentReports
                .Include(ir => ir.Device).ThenInclude(d => d!.Model).ThenInclude(m => m!.DeviceType)
                .Include(ir => ir.Device).ThenInclude(d => d!.CurrentUser)
                .Include(ir => ir.Device).ThenInclude(d => d!.CurrentDepartment)
                .Include(ir => ir.Device).ThenInclude(d => d!.Repairs)
                .Where(ir => ir.Device != null && 
                            ir.Device.IsDeleted != true &&
                            ir.Device.Status != "Đã thanh lý" &&
                            (ir.ReportType == "Mất mát thiết bị" || 
                             ir.ReportType == "Hỏng hóc phần cứng") &&
                            ir.Status != 2) // Chưa bị từ chối
                .ToListAsync();

            foreach (var incident in devicesFromIncidents)
            {
                var device = incident.Device!;
                
                // Tránh duplicate
                if (eligibleDevices.Any(e => e.Id == device.Id))
                    continue;

                var hasActiveRepair = device.Repairs.Any(r => r.Status == 1 || r.Status == 2);
                
                if (!hasActiveRepair)
                {
                    eligibleDevices.Add(new LiquidationEligibleDeviceDto
                    {
                        Id = device.Id,
                        DeviceCode = device.DeviceCode,
                        DeviceName = device.DeviceName,
                        Status = device.Status,
                        PurchaseDate = device.PurchaseDate,
                        PurchasePrice = device.PurchasePrice,
                        CurrentUserName = device.CurrentUser?.FullName,
                        CurrentUserFullName = device.CurrentUser?.FullName,
                        CurrentDepartmentName = device.CurrentDepartment?.DepartmentName,
                        EligibilityReason = $"Báo cáo sự cố: {incident.ReportType}",
                        HasActiveRepair = false,
                        ModelName = device.Model?.ModelName,
                        TypeName = device.Model?.DeviceType?.TypeName
                    });
                }
            }

            // 3. Thiết bị hết hạn khấu hao (>5 năm từ ngày mua)
            var deprecationCutoff = DateTime.Now.AddYears(-5);
            var depreciatedDevices = await _context.Devices
                .Include(d => d.Model).ThenInclude(m => m!.DeviceType)
                .Include(d => d.CurrentUser)
                .Include(d => d.CurrentDepartment)
                .Include(d => d.Repairs)
                .Where(d => d.IsDeleted != true &&
                           d.Status != "Đã thanh lý" &&
                           d.PurchaseDate.HasValue &&
                           d.PurchaseDate.Value <= deprecationCutoff)
                .ToListAsync();

            foreach (var device in depreciatedDevices)
            {
                // Tránh duplicate
                if (eligibleDevices.Any(e => e.Id == device.Id))
                    continue;

                var hasActiveRepair = device.Repairs.Any(r => r.Status == 1 || r.Status == 2);
                
                if (!hasActiveRepair)
                {
                    eligibleDevices.Add(new LiquidationEligibleDeviceDto
                    {
                        Id = device.Id,
                        DeviceCode = device.DeviceCode,
                        DeviceName = device.DeviceName,
                        Status = device.Status,
                        PurchaseDate = device.PurchaseDate,
                        PurchasePrice = device.PurchasePrice,
                        CurrentUserName = device.CurrentUser?.FullName,
                        CurrentUserFullName = device.CurrentUser?.FullName,
                        CurrentDepartmentName = device.CurrentDepartment?.DepartmentName,
                        EligibilityReason = "Hết hạn khấu hao (>5 năm)",
                        HasActiveRepair = false,
                        ModelName = device.Model?.ModelName,
                        TypeName = device.Model?.DeviceType?.TypeName
                    });
                }
            }

            return eligibleDevices.OrderBy(d => d.DeviceCode);
        }

        public async Task<bool> IsDeviceEligibleForLiquidationAsync(Guid deviceId)
        {
            var device = await _context.Devices
                .Include(d => d.Repairs)
                .FirstOrDefaultAsync(d => d.Id == deviceId && d.IsDeleted != true);

            if (device == null)
                return false;

            // Kiểm tra các điều kiện
            if (device.Status == "Đã thanh lý")
                return false;

            if (device.Status == "Đang sử dụng")
                return false;

            // Kiểm tra không đang sửa chữa
            var hasActiveRepair = device.Repairs.Any(r => r.Status == 1 || r.Status == 2);
            if (hasActiveRepair)
                return false;

            // Kiểm tra điều kiện đủ để thanh lý
            var isEligibleStatus = device.Status == "Chờ thanh lý" || 
                                  device.Status == "Đã hỏng" || 
                                  device.Status == "Mất";

            var hasIncidentReport = await _context.IncidentReports
                .AnyAsync(ir => ir.DeviceId == deviceId &&
                               (ir.ReportType == "Mất mát thiết bị" || 
                                ir.ReportType == "Hỏng hóc phần cứng") &&
                               ir.Status != 2);

            var isDepreciated = device.PurchaseDate.HasValue && 
                               device.PurchaseDate.Value <= DateTime.Now.AddYears(-5);

            return isEligibleStatus || hasIncidentReport || isDepreciated;
        }

        public async Task<LiquidationDto> LiquidateDeviceAsync(CreateLiquidationDto dto, Guid approvedBy)
        {
            // Validate device eligibility
            var isEligible = await IsDeviceEligibleForLiquidationAsync(dto.DeviceId);
            if (!isEligible)
            {
                throw new InvalidOperationException("Thiết bị không đủ điều kiện thanh lý");
            }

            var device = await _context.Devices
                .Include(d => d.CurrentUser)
                .FirstOrDefaultAsync(d => d.Id == dto.DeviceId);

            if (device == null)
            {
                throw new InvalidOperationException("Thiết bị không tồn tại");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Tạo bản ghi liquidation
                var liquidation = new Liquidation
                {
                    Id = Guid.NewGuid(),
                    DeviceId = dto.DeviceId,
                    Reason = dto.Reason,
                    LiquidationDate = dto.LiquidationDate,
                    ApprovedBy = approvedBy
                };

                _context.Liquidations.Add(liquidation);

                // 2. Cập nhật device status
                device.Status = "Đã thanh lý";
                device.CurrentUserId = null;
                device.CurrentDepartmentId = null;
                device.UpdatedAt = DateTime.UtcNow;
                device.UpdatedBy = approvedBy;

                // 3. Ghi log history
                var deviceHistory = new DeviceHistory
                {
                    Id = Guid.NewGuid(),
                    DeviceId = dto.DeviceId,
                    Action = "Thanh lý thiết bị",
                    ActionDate = DateTime.UtcNow,
                    ActionBy = approvedBy,
                    Description = $"Lý do: {dto.Reason}"
                };

                _context.DeviceHistories.Add(deviceHistory);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Return DTO
                var result = _mapper.Map<LiquidationDto>(liquidation);
                result.DeviceCode = device.DeviceCode;
                result.DeviceName = device.DeviceName;

                return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<LiquidationDto>> LiquidateBatchAsync(BatchLiquidationDto dto, Guid approvedBy)
        {
            var results = new List<LiquidationDto>();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var deviceId in dto.DeviceIds)
                {
                    var singleDto = new CreateLiquidationDto
                    {
                        DeviceId = deviceId,
                        Reason = dto.Reason,
                        LiquidationDate = dto.LiquidationDate
                    };

                    // Validate each device
                    var isEligible = await IsDeviceEligibleForLiquidationAsync(deviceId);
                    if (!isEligible)
                    {
                        throw new InvalidOperationException($"Thiết bị {deviceId} không đủ điều kiện thanh lý");
                    }
                }

                // If all devices are eligible, proceed with liquidation
                foreach (var deviceId in dto.DeviceIds)
                {
                    var singleDto = new CreateLiquidationDto
                    {
                        DeviceId = deviceId,
                        Reason = dto.Reason,
                        LiquidationDate = dto.LiquidationDate
                    };

                    var result = await LiquidateDeviceInternalAsync(singleDto, approvedBy);
                    results.Add(result);
                }

                await transaction.CommitAsync();
                return results;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<LiquidationDto> LiquidateDeviceInternalAsync(CreateLiquidationDto dto, Guid approvedBy)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.Id == dto.DeviceId);
            if (device == null)
                throw new InvalidOperationException("Thiết bị không tồn tại");

            // Create liquidation record
            var liquidation = new Liquidation
            {
                Id = Guid.NewGuid(),
                DeviceId = dto.DeviceId,
                Reason = dto.Reason,
                LiquidationDate = dto.LiquidationDate,
                ApprovedBy = approvedBy
            };

            _context.Liquidations.Add(liquidation);

            // Update device
            device.Status = "Đã thanh lý";
            device.CurrentUserId = null;
            device.CurrentDepartmentId = null;
            device.UpdatedAt = DateTime.UtcNow;
            device.UpdatedBy = approvedBy;

            // Add history
            var deviceHistory = new DeviceHistory
            {
                Id = Guid.NewGuid(),
                DeviceId = dto.DeviceId,
                Action = "Thanh lý thiết bị",
                ActionDate = DateTime.UtcNow,
                ActionBy = approvedBy,
                Description = $"Lý do: {dto.Reason}"
            };

            _context.DeviceHistories.Add(deviceHistory);

            await _context.SaveChangesAsync();

            var result = _mapper.Map<LiquidationDto>(liquidation);
            result.DeviceCode = device.DeviceCode;
            result.DeviceName = device.DeviceName;

            return result;
        }

        public async Task<IEnumerable<LiquidationDto>> GetLiquidationHistoryAsync()
        {
            var liquidations = await _context.Liquidations
                .Include(l => l.Device)
                .Include(l => l.ApprovedByNavigation)
                .OrderByDescending(l => l.LiquidationDate)
                .ToListAsync();

            var results = liquidations.Select(l => new LiquidationDto
            {
                Id = l.Id,
                DeviceId = l.DeviceId,
                Reason = l.Reason,
                LiquidationDate = l.LiquidationDate,
                ApprovedBy = l.ApprovedBy,
                DeviceCode = l.Device?.DeviceCode,
                DeviceName = l.Device?.DeviceName,
                ApprovedByName = l.ApprovedByNavigation?.FullName,
                CreatedAt = l.LiquidationDate // Using LiquidationDate as CreatedAt for now
            });

            return results;
        }

        public async Task<LiquidationDto?> GetLiquidationByIdAsync(Guid id)
        {
            var liquidation = await _context.Liquidations
                .Include(l => l.Device)
                .Include(l => l.ApprovedByNavigation)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (liquidation == null)
                return null;

            return new LiquidationDto
            {
                Id = liquidation.Id,
                DeviceId = liquidation.DeviceId,
                Reason = liquidation.Reason,
                LiquidationDate = liquidation.LiquidationDate,
                ApprovedBy = liquidation.ApprovedBy,
                DeviceCode = liquidation.Device?.DeviceCode,
                DeviceName = liquidation.Device?.DeviceName,
                ApprovedByName = liquidation.ApprovedByNavigation?.FullName
            };
        }
    }
}