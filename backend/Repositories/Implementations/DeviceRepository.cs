using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

public class DeviceRepository : IDeviceRepository
{
    private readonly DeviceManagementDbContext _context;

    public DeviceRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Device>> GetAllAsync()
    {
    return await _context.Devices
        .Include(d => d.Model)
        .Include(d => d.CurrentUser)
        .Include(d => d.CurrentDepartment)
        .ToListAsync();
    }

    public async Task<Device?> GetByIdAsync(Guid id)
    {
        return await _context.Devices.FindAsync(id);
    }

    public async Task AddAsync(Device device)
    {
        await _context.Devices.AddAsync(device);
    }

    public void Update(Device device)
    {
        _context.Devices.Update(device);
    }

    public void Delete(Device device)
    {
        _context.Devices.Remove(device);
    }

    public async Task DeleteAsync(Device device)
    {
        _context.Devices.Remove(device);
        await Task.CompletedTask; // hoặc bạn có thể gọi SaveChangesAsync() ở đây nếu cần
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
