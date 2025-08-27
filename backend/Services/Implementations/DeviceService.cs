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
            var devices = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<DeviceDto>>(devices);
        }

        public async Task<IEnumerable<DeviceDto>> GetDevicesByUserAsync(Guid userId)
        {
            var all = await _repository.GetAllAsync();
            var filtered = all.Where(d => d.CurrentUserId == userId);
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

        public async Task<bool> CreateDeviceAsync(DeviceDto dto)
        {
            var device = _mapper.Map<Device>(dto);
            device.Id = Guid.NewGuid();
            device.CreatedAt = DateTime.UtcNow;
            device.IsDeleted = false;
            await _repository.AddAsync(device);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateDeviceAsync(Guid id, DeviceDto dto)
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
    }
} 
