// Services/DeviceTypeService.cs
using AutoMapper;
using backend.Data;
using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

public class DeviceTypeService : IDeviceTypeService
{
    private readonly DeviceManagementDbContext _context;
    private readonly IMapper _mapper;

    public DeviceTypeService(DeviceManagementDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DeviceTypeDto>> GetAllAsync()
    {
        var types = await _context.DeviceTypes.ToListAsync();
        return _mapper.Map<IEnumerable<DeviceTypeDto>>(types);
    }

    public async Task<DeviceTypeDto?> GetByIdAsync(Guid id)
    {
        var type = await _context.DeviceTypes.FindAsync(id);
        return type == null ? null : _mapper.Map<DeviceTypeDto>(type);
    }

    public async Task<DeviceTypeDto> CreateAsync(DeviceTypeDto dto)
    {
        var type = _mapper.Map<DeviceType>(dto);
        type.Id = Guid.NewGuid();

        _context.DeviceTypes.Add(type);
        await _context.SaveChangesAsync();

        return _mapper.Map<DeviceTypeDto>(type);
    }

    public async Task<DeviceTypeDto?> UpdateAsync(Guid id, DeviceTypeDto dto)
    {
        var type = await _context.DeviceTypes.FindAsync(id);
        if (type == null) return null;

        type.TypeName = dto.TypeName;
        type.Description = dto.Description;

        await _context.SaveChangesAsync();
        return _mapper.Map<DeviceTypeDto>(type);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var type = await _context.DeviceTypes.FindAsync(id);
        if (type == null) return false;

        _context.DeviceTypes.Remove(type);
        await _context.SaveChangesAsync();
        return true;
    }
}
