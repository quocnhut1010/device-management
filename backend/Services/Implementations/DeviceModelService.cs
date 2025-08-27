// Services/Implementations/DeviceModelService.cs
using AutoMapper;
using backend.Data;
using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

public class DeviceModelService : IDeviceModelService
{
    private readonly DeviceManagementDbContext _context;

    private readonly IMapper _mapper;

    public DeviceModelService(DeviceManagementDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

   public async Task<IEnumerable<DeviceModelDto>> GetAllAsync()
{
    var models = await _context.DeviceModels
        .Where(x => x.IsDeleted != true)
        .ToListAsync();

    return _mapper.Map<IEnumerable<DeviceModelDto>>(models);
}


    public async Task<DeviceModelDto?> GetByIdAsync(Guid id)
        {
            var model = await _context.DeviceModels.FindAsync(id);
            if (model is null || model.IsDeleted == true)
                return null;

            return _mapper.Map<DeviceModelDto>(model);
        }
    public async Task<DeviceModelDto> CreateAsync(DeviceModelDto dto)
    {
        var entity = _mapper.Map<DeviceModel>(dto);
        entity.Id = Guid.NewGuid();
        _context.DeviceModels.Add(entity);
        await _context.SaveChangesAsync();
        return _mapper.Map<DeviceModelDto>(entity);
    }

   public async Task<DeviceModelDto?> UpdateAsync(Guid id, DeviceModelDto dto)
    {
        var model = await _context.DeviceModels.FindAsync(id);
        if (model == null || model.IsDeleted == true) return null;

        _mapper.Map(dto, model);
        model.UpdatedAt = DateTime.UtcNow;

        _context.DeviceModels.Update(model);
        await _context.SaveChangesAsync();

        return _mapper.Map<DeviceModelDto>(model);
    }


public async Task<bool> DeleteAsync(Guid id)
        {
            var model = await _context.DeviceModels.FindAsync(id);
            if (model == null || model.IsDeleted == true) return false;

            model.IsDeleted = true;
            model.DeletedAt = DateTime.UtcNow;
            _context.DeviceModels.Update(model);
            await _context.SaveChangesAsync();

            return true;
        }

}
