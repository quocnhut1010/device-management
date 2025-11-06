// Updated DeviceService.cs
using AutoMapper;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Services.Implementations
{
    public class DeviceService : IDeviceService
    {
        private readonly IDeviceRepository _repository;
        private readonly IMapper _mapper;
        private readonly DeviceManagementDbContext _context;
        private readonly IDeviceHistoryService _deviceHistoryService;
        

        public DeviceService(IDeviceRepository repository, IMapper mapper, DeviceManagementDbContext context, IDeviceHistoryService deviceHistoryService)
        {
            _repository = repository;
            _mapper = mapper;
            _context = context;
            _deviceHistoryService = deviceHistoryService;
        }

        public async Task<IEnumerable<DeviceDto>> GetAllDevicesAsync()
        {
            var devices = await _repository.GetAllAsync(false); // Chỉ lấy thiết bị chưa xóa
            return _mapper.Map<IEnumerable<DeviceDto>>(devices);
        }

        public async Task<IEnumerable<DeviceDto>> GetAllDevicesAsync(bool includeDeleted)
        {
            var devices = includeDeleted 
                ? await _repository.GetAllAsync() // Lấy tất cả
                : await _repository.GetAllAsync(false); // Chỉ lấy chưa xóa
            return _mapper.Map<IEnumerable<DeviceDto>>(devices);
        }

        public async Task<IEnumerable<DeviceDto>> GetDevicesByUserAsync(Guid userId)
        {
            var all = await _repository.GetAllAsync();
            // var filtered = all.Where(d => d.CurrentUserId == userId);
            var filtered = all
                .Where(d => d.CurrentUserId == userId && d.IsDeleted != true)
                .Where(d => !d.IncidentReports.Any(r =>
                    r.Status == IncidentStatus.ChoDuyet || 
                    r.Status == IncidentStatus.DaTaoLenhSua));
            return _mapper.Map<IEnumerable<DeviceDto>>(filtered);
        }

        public async Task<DeviceDto?> GetDeviceByIdAsync(Guid id, Guid? currentUserId, bool isAdmin)
        {
            var device = await _repository.GetByIdAsync(id);
            if (device == null) return null;

            if (!isAdmin && device.CurrentUserId != currentUserId)
                return null;

            return _mapper.Map<DeviceDto>(device);
        }

        public async Task<bool> CreateDeviceAsync(CreateDeviceDto dto)
        {
            var device = _mapper.Map<Device>(dto);
            device.Id = Guid.NewGuid();
            device.CreatedAt = DateTime.UtcNow;
            device.IsDeleted = false;
            
            // Auto-generate DeviceCode if not provided
            if (string.IsNullOrEmpty(device.DeviceCode))
            {
                device.DeviceCode = await GenerateNextDeviceCodeAsync();
            }
            
            // Auto-generate Barcode if not provided
            if (string.IsNullOrEmpty(device.Barcode))
            {
                device.Barcode = GenerateBarcode();
            }
            
            await _repository.AddAsync(device);
            await _repository.SaveChangesAsync();

            // Generate QR token for the device
            await GenerateQrTokenAsync(device.Id, dto.CreatedBy ?? Guid.Empty);
            
            // Log device creation - using system user since CreatedBy field not available
            await _deviceHistoryService.LogActionAsync(
                device.Id,
                "Device Created",
                Guid.Empty, // Will be replaced with actual user ID when available
                $"Device '{device.DeviceName}' (Code: {device.DeviceCode}) was created",
                "CREATE");
            
            return true;
        }
        
        public async Task<DeviceDto> CreateDeviceWithReturnAsync(CreateDeviceDto dto)
        {
            var device = _mapper.Map<Device>(dto);
            device.Id = Guid.NewGuid();
            device.CreatedAt = DateTime.UtcNow;
            device.IsDeleted = false;
            
            // Auto-generate DeviceCode if not provided
            if (string.IsNullOrEmpty(device.DeviceCode))
            {
                device.DeviceCode = await GenerateNextDeviceCodeAsync();
            }
            
            // Auto-generate Barcode if not provided
            if (string.IsNullOrEmpty(device.Barcode))
            {
                device.Barcode = GenerateBarcode();
            }
            
            await _repository.AddAsync(device);
            await _repository.SaveChangesAsync();
            
            // Log device creation - using system user since CreatedBy field not available
            await _deviceHistoryService.LogActionAsync(
                device.Id,
                "Device Created",
                dto.CreatedBy ?? Guid.Empty, // Will be replaced with actual user ID when available
                $"Device '{device.DeviceName}' (Code: {device.DeviceCode}) was created",
                "CREATE");
            
            // Return the created device with all generated fields
            var createdDevice = await _repository.GetByIdAsync(device.Id);
            // Ensure QR token exists
            await GenerateQrTokenAsync(device.Id, dto.CreatedBy ?? Guid.Empty);
            return _mapper.Map<DeviceDto>(createdDevice!);
        }
        
        private async Task<string> GenerateNextDeviceCodeAsync()
        {
            var allDevices = await _repository.GetAllAsync();
            var existingCodes = allDevices
                .Where(d => d.DeviceCode != null && d.DeviceCode.StartsWith("DEV-"))
                .Select(d => d.DeviceCode!)
                .ToList();
            
            int nextNumber = 1;
            if (existingCodes.Any())
            {
                var numbers = existingCodes
                    .Select(code => {
                        var parts = code.Split('-');
                        if (parts.Length == 2 && int.TryParse(parts[1], out int num))
                            return num;
                        return 0;
                    })
                    .Where(num => num > 0)
                    .ToList();
                
                if (numbers.Any())
                {
                    nextNumber = numbers.Max() + 1;
                }
            }
            
            return $"DEV-{nextNumber:D3}"; // DEV-001, DEV-002, etc.
        }
        
        private string GenerateBarcode()
        {
            // Generate a unique barcode using timestamp and random number
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var random = new Random().Next(1000, 9999);
            return $"{timestamp}{random}";
        }

        public async Task<bool> UpdateDeviceAsync(Guid id, UpdateDeviceDto dto)
        {
            var device = await _repository.GetByIdAsync(id);
            if (device == null) return false;

            var oldDeviceName = device.DeviceName;
            _mapper.Map(dto, device);
            device.UpdatedAt = DateTime.UtcNow;
            await _repository.SaveChangesAsync();
            
            // Log device update
            if (device.UpdatedBy.HasValue)
            {
                await _deviceHistoryService.LogActionAsync(
                    device.Id,
                    "Device Updated",
                    device.UpdatedBy.Value,
                    $"Device '{oldDeviceName}' was updated to '{device.DeviceName}'",
                    "UPDATE");
            }
            
            return true;
        }

        public async Task<bool> DeleteDeviceAsync(Guid id, Guid userId)
        {
            var device = await _repository.GetByIdAsync(id);
            if (device == null) return false;

            device.IsDeleted = true;
            device.UpdatedAt = DateTime.UtcNow;
            device.UpdatedBy = userId;
            await _repository.SaveChangesAsync();
            
            // Log device deletion
            await _deviceHistoryService.LogActionAsync(
                device.Id,
                "Device Deleted",
                userId,
                $"Device '{device.DeviceName}' (Code: {device.DeviceCode}) was deleted",
                "DELETE");
            
            return true;
        }

        public async Task<object> GetPagedDevicesAsync(int page, int pageSize, string? search, string? status, Guid? modelId)
        {
            var allDevices = await _repository.GetAllAsync();
            var query = allDevices.Where(d => d.IsDeleted != true);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d => d.DeviceName.Contains(search) || d.DeviceCode.Contains(search));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(d => d.Status == status);
            }

            if (modelId.HasValue)
            {
                query = query.Where(d => d.ModelId == modelId.Value);
            }

            var total = query.Count();
            var devices = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            var deviceDtos = _mapper.Map<IEnumerable<DeviceDto>>(devices);

            return new
            {
                devices = deviceDtos,
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)total / pageSize)
            };
        }

        public async Task<IEnumerable<DeviceDto>> GetDeletedDevicesAsync()
        {
            var allDevices = await _repository.GetAllAsync();
            var deletedDevices = allDevices.Where(d => d.IsDeleted == true);
            return _mapper.Map<IEnumerable<DeviceDto>>(deletedDevices);
        }

        public async Task<bool> RestoreDeviceAsync(Guid id)
        {
            var device = await _repository.GetByIdAsync(id);
            if (device == null || device.IsDeleted != true) return false;

            device.IsDeleted = false;
            device.UpdatedAt = DateTime.UtcNow;
            await _repository.SaveChangesAsync();
            
            // Log device restoration
            if (device.UpdatedBy.HasValue)
            {
                await _deviceHistoryService.LogActionAsync(
                    device.Id,
                    "Device Restored",
                    device.UpdatedBy.Value,
                    $"Device '{device.DeviceName}' (Code: {device.DeviceCode}) was restored from deletion",
                    "RESTORE");
            }
            
            return true;
        }

        public async Task<IEnumerable<DeviceDto>> GetDevicesByManagedDepartmentAsync(Guid userId)
        {
            // Lấy user với thông tin department
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == userId && u.IsDeleted == false);
                
            if (user == null)
            {
                Console.WriteLine($"[DEBUG] User not found for ID: {userId}");
                return new List<DeviceDto>();
            }
            
            Console.WriteLine($"[DEBUG] User found - ID: {user.Id}, Position: {user.Position}, DepartmentId: {user.DepartmentId}");
            
            var managedDepartmentIds = new List<Guid>();
            
            // Logic đơn giản: Nếu là Trưởng phòng, lấy thiết bị của department mình
            if (user.Position == "Trưởng phòng" && user.DepartmentId.HasValue)
            {
                managedDepartmentIds.Add(user.DepartmentId.Value);
                Console.WriteLine($"[DEBUG] Manager found - Added department: {user.DepartmentId.Value}");
            }
            else if (user.DepartmentId.HasValue)
            {
                // Nếu không phải trưởng phòng, vẫn lấy department của mình
                managedDepartmentIds.Add(user.DepartmentId.Value);
                Console.WriteLine($"[DEBUG] Regular user - Added department: {user.DepartmentId.Value}");
            }
            
            Console.WriteLine($"[DEBUG] Total managed departments: {managedDepartmentIds.Count}");
            
            if (!managedDepartmentIds.Any())
            {
                Console.WriteLine($"[DEBUG] No managed departments found");
                return new List<DeviceDto>();
            }
            
            // Lấy thiết bị thuộc các departments được quản lý
            var devices = await _context.Devices
                .Include(d => d.Model!).ThenInclude(m => m.DeviceType)
                .Include(d => d.Supplier)
                .Include(d => d.CurrentUser)
                .Include(d => d.CurrentDepartment)
                .Where(d => d.IsDeleted != true && 
                           managedDepartmentIds.Contains(d.CurrentDepartmentId ?? Guid.Empty))
                .ToListAsync();
                
            Console.WriteLine($"[DEBUG] Found {devices.Count} devices for departments: [{string.Join(", ", managedDepartmentIds)}]");
            
            // Debug: Hiển thị thông tin các device tìm thấy
            foreach (var device in devices.Take(5)) // Chỉ hiển thị 5 device đầu tiên
            {
                Console.WriteLine($"[DEBUG] Device: {device.DeviceCode} - {device.DeviceName} - Dept: {device.CurrentDepartmentId}");
            }
                
            return _mapper.Map<IEnumerable<DeviceDto>>(devices);
        }

        public async Task<DeviceDto?> ScanDeviceAsync(string qrCode)
        {
            var allDevices = await _repository.GetAllAsync();
            var device = allDevices.FirstOrDefault(d => d.DeviceCode == qrCode && d.IsDeleted != true);
            return device != null ? _mapper.Map<DeviceDto>(device) : null;
        }

        public async Task<DeviceQrDto?> GetDeviceByCodeAsync(string code, Guid userId, string role, string? position)
        {
            // Query device with all necessary includes
            var device = await _context.Devices
                .Include(d => d.Model)
                    .ThenInclude(m => m!.DeviceType)
                .Include(d => d.CurrentUser)
                .Include(d => d.CurrentDepartment)
                .Include(d => d.Repairs)
                .Include(d => d.IncidentReports)
                .Where(d => d.DeviceCode == code && d.IsDeleted != true)
                .FirstOrDefaultAsync();

            if (device == null)
                return null;

            // Check authorization based on role
            bool hasAccess = false;

            if (role == "Admin")
            {
                // Admin can access all devices
                hasAccess = true;
            }
            else if (role == "User" && position == "Kỹ thuật viên")
            {
                // Technician can only access devices in their assigned repairs
                hasAccess = device.Repairs.Any(r => r.AssignedToTechnicianId == userId);
            }
            else if (role == "User")
            {
                // Regular user can only access their own devices
                hasAccess = device.CurrentUserId == userId;
            }

            if (!hasAccess)
                return null;

            // Get repair history statistics
            var repairs = device.Repairs.Where(r => r.DeviceId == device.Id).ToList();
            var incidents = device.IncidentReports.Where(i => i.DeviceId == device.Id).ToList();

            var lastRepairDate = repairs.Any() 
                ? repairs.Max(r => r.EndDate ?? r.StartDate ?? (DateTime?)null)
                : null;

            // Map to DeviceQrDto
            var dto = new DeviceQrDto
            {
                Id = device.Id,
                DeviceCode = device.DeviceCode,
                DeviceName = device.DeviceName,
                Status = device.Status,
                Barcode = device.Barcode,
                SerialNumber = device.SerialNumber,
                ModelName = device.Model?.ModelName,
                DeviceTypeName = device.Model?.DeviceType?.TypeName,
                Manufacturer = device.Model?.Manufacturer,
                CurrentUserName = device.CurrentUser?.FullName,
                DepartmentName = device.CurrentDepartment?.DepartmentName,
                LastRepairDate = lastRepairDate,
                RepairCount = repairs.Count,
                IncidentCount = incidents.Count,
                PurchaseDate = device.PurchaseDate,
                WarrantyExpiry = device.WarrantyExpiry,
                DeviceImageUrl = device.DeviceImageUrl
            };

            return dto;
        }

        public async Task<DeviceQrDto?> GetDeviceByBarcodeAsync(string barcode, Guid userId, string role, string? position)
        {
            var device = await _context.Devices
                .Include(d => d.Model)
                    .ThenInclude(m => m!.DeviceType)
                .Include(d => d.CurrentUser)
                .Include(d => d.CurrentDepartment)
                .Include(d => d.Repairs)
                .Include(d => d.IncidentReports)
                .Where(d => d.Barcode == barcode && d.IsDeleted != true)
                .FirstOrDefaultAsync();

            if (device == null)
                return null;

            bool hasAccess = false;
            if (role == "Admin")
            {
                hasAccess = true;
            }
            else if (role == "User" && position == "Kỹ thuật viên")
            {
                hasAccess = device.Repairs.Any(r => r.AssignedToTechnicianId == userId);
            }
            else if (role == "User")
            {
                hasAccess = device.CurrentUserId == userId;
            }

            if (!hasAccess)
                return null;

            var repairs = device.Repairs.Where(r => r.DeviceId == device.Id).ToList();
            var incidents = device.IncidentReports.Where(i => i.DeviceId == device.Id).ToList();
            var lastRepairDate = repairs.Any()
                ? repairs.Max(r => r.EndDate ?? r.StartDate ?? (DateTime?)null)
                : null;

            var dto = new DeviceQrDto
            {
                Id = device.Id,
                DeviceCode = device.DeviceCode,
                DeviceName = device.DeviceName,
                Status = device.Status,
                Barcode = device.Barcode,
                SerialNumber = device.SerialNumber,
                ModelName = device.Model?.ModelName,
                DeviceTypeName = device.Model?.DeviceType?.TypeName,
                Manufacturer = device.Model?.Manufacturer,
                CurrentUserName = device.CurrentUser?.FullName,
                DepartmentName = device.CurrentDepartment?.DepartmentName,
                LastRepairDate = lastRepairDate,
                RepairCount = repairs.Count,
                IncidentCount = incidents.Count,
                PurchaseDate = device.PurchaseDate,
                WarrantyExpiry = device.WarrantyExpiry,
                DeviceImageUrl = device.DeviceImageUrl
            };

            return dto;
        }

        public async Task<string> GenerateQrTokenAsync(Guid deviceId, Guid actorId)
        {
            // Revoke existing active tokens
            var activeTokens = await _context.DeviceQrTokens
                .Where(t => t.DeviceId == deviceId && t.IsActive)
                .ToListAsync();
            foreach (var t in activeTokens)
            {
                t.IsActive = false;
                t.RevokedAt = DateTime.UtcNow;
            }

            var token = Guid.NewGuid().ToString();
            var entity = new DeviceQrToken
            {
                Id = Guid.NewGuid(),
                DeviceId = deviceId,
                Token = token,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.DeviceQrTokens.Add(entity);
            await _context.SaveChangesAsync();
            return token;
        }

        public async Task<DeviceQrDto?> GetDeviceByTokenAsync(string token, Guid userId, string role, string? position)
        {
            var tokenEntity = await _context.DeviceQrTokens
                .Include(t => t.Device)!
                    .ThenInclude(d => d!.Model)!
                        .ThenInclude(m => m!.DeviceType)
                .Include(t => t.Device)!
                    .ThenInclude(d => d!.CurrentUser)
                .Include(t => t.Device)!
                    .ThenInclude(d => d!.CurrentDepartment)
                .Include(t => t.Device)!
                    .ThenInclude(d => d!.Repairs)
                .Include(t => t.Device)!
                    .ThenInclude(d => d!.IncidentReports)
                .Where(t => t.Token == token && t.IsActive)
                .FirstOrDefaultAsync();

            var device = tokenEntity?.Device;
            if (device == null || device.IsDeleted == true)
                return null;

            bool hasAccess = false;
            if (role == "Admin") hasAccess = true;
            else if (role == "User" && position == "Kỹ thuật viên")
                hasAccess = device.Repairs.Any(r => r.AssignedToTechnicianId == userId);
            else if (role == "User")
                hasAccess = device.CurrentUserId == userId;

            if (!hasAccess) return null;

            var repairs = device.Repairs.Where(r => r.DeviceId == device.Id).ToList();
            var incidents = device.IncidentReports.Where(i => i.DeviceId == device.Id).ToList();
            var lastRepairDate = repairs.Any() ? repairs.Max(r => r.EndDate ?? r.StartDate ?? (DateTime?)null) : null;

            return new DeviceQrDto
            {
                Id = device.Id,
                DeviceCode = device.DeviceCode,
                DeviceName = device.DeviceName,
                Status = device.Status,
                Barcode = device.Barcode,
                SerialNumber = device.SerialNumber,
                ModelName = device.Model?.ModelName,
                DeviceTypeName = device.Model?.DeviceType?.TypeName,
                Manufacturer = device.Model?.Manufacturer,
                CurrentUserName = device.CurrentUser?.FullName,
                DepartmentName = device.CurrentDepartment?.DepartmentName,
                LastRepairDate = lastRepairDate,
                RepairCount = repairs.Count,
                IncidentCount = incidents.Count,
                PurchaseDate = device.PurchaseDate,
                WarrantyExpiry = device.WarrantyExpiry,
                DeviceImageUrl = device.DeviceImageUrl
            };
        }

        public async Task<string?> GetActiveQrTokenAsync(Guid deviceId)
        {
            var token = await _context.DeviceQrTokens
                .Where(t => t.DeviceId == deviceId && t.IsActive)
                .Select(t => t.Token)
                .FirstOrDefaultAsync();
            return token;
        }
    }
}
