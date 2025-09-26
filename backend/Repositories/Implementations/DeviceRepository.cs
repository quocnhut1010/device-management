using backend.Data;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using backend.Models.DTOs;


public class DeviceRepository : IDeviceRepository
{
    private readonly DeviceManagementDbContext _context;

    public DeviceRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Device>> GetAllAsync(bool? isDeleted = null)
    {
        var query = _context.Devices
            .Include(d => d.Model!).ThenInclude(m => m.DeviceType)
            .Include(d => d.Supplier)
            .Include(d => d.CurrentUser)
            .Include(d => d.CurrentDepartment)
            .AsQueryable();

        if (isDeleted != null)
            query = query.Where(d => d.IsDeleted == isDeleted);

        return await query.ToListAsync();
    }

   public async Task<PaginatedResult<Device>> GetPagedAsync(int page, int pageSize)
        {
            var query = _context.Devices
                .Include(d => d.Model!).ThenInclude(m => m.DeviceType!)
                .Include(d => d.Supplier)
                .Include(d => d.CurrentUser)
                .Include(d => d.CurrentDepartment)
                .Where(d => d.IsDeleted != true);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResult<Device>
            {
                TotalCount = totalCount,
                Items = items
            };
        }


    public async Task<Device?> GetByIdAsync(Guid id)
    {
        return await _context.Devices
            .Include(d => d.Model!).ThenInclude(m => m.DeviceType!)
            .Include(d => d.Supplier)
            .Include(d => d.CurrentUser)
            .Include(d => d.CurrentDepartment)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IEnumerable<Device>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Devices
            .Include(d => d.Model!).ThenInclude(m => m.DeviceType!)
            .Include(d => d.Supplier)
            .Include(d => d.CurrentUser)
            .Include(d => d.CurrentDepartment)
            .Where(d => d.CurrentUserId == userId && d.IsDeleted != true)
            .ToListAsync();
    }

    public async Task<IEnumerable<Device>> GetByDepartmentIdAsync(Guid departmentId)
    {
        return await _context.Devices
            .Include(d => d.Model!).ThenInclude(m => m.DeviceType!)
            .Include(d => d.Supplier)
            .Include(d => d.CurrentUser)
            .Include(d => d.CurrentDepartment)
            .Where(d => d.CurrentDepartmentId == departmentId && d.IsDeleted != true)
            .ToListAsync();
    }

    public async Task AddAsync(Device device)
    {
        await _context.Devices.AddAsync(device);
    }

    public void Update(Device device)
    {
        _context.Devices.Update(device);
    }

    public async Task SoftDeleteAsync(Guid id, Guid deletedBy)
    {
        var device = await _context.Devices.FindAsync(id);
        if (device != null)
        {
            device.IsDeleted = true;
            device.DeletedAt = DateTime.UtcNow;
            device.DeletedBy = deletedBy;
        }
    }

    public async Task RestoreAsync(Guid id)
    {
        var device = await _context.Devices.FindAsync(id);
        if (device != null)
        {
            device.IsDeleted = false;
            device.DeletedAt = null;
            device.DeletedBy = null;
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
