// Updated DeviceService.cs
using AutoMapper;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
    public class DeviceService : IDeviceService
    {
        private readonly IDeviceRepository _repository;
        private readonly IMapper _mapper;

        public DeviceService(IDeviceRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
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
            
            // Return the created device with all generated fields
            var createdDevice = await _repository.GetByIdAsync(device.Id);
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

            _mapper.Map(dto, device);
            device.UpdatedAt = DateTime.UtcNow;
            await _repository.SaveChangesAsync();
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
            return true;
        }

        public async Task<IEnumerable<DeviceDto>> GetDevicesByManagedDepartmentAsync(Guid userId)
        {
            // This would need user context to get managed department
            // For now, return empty collection
            var allDevices = await _repository.GetAllAsync();
            var devices = allDevices.Where(d => d.IsDeleted != true);
            return _mapper.Map<IEnumerable<DeviceDto>>(devices);
        }

        public async Task<DeviceDto?> ScanDeviceAsync(string qrCode)
        {
            var allDevices = await _repository.GetAllAsync();
            var device = allDevices.FirstOrDefault(d => d.DeviceCode == qrCode && d.IsDeleted != true);
            return device != null ? _mapper.Map<DeviceDto>(device) : null;
        }
    }
}
