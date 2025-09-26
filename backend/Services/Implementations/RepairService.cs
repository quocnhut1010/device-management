using AutoMapper;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class RepairService : IRepairService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IMapper _mapper;

        public RepairService(DeviceManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<RepairDto>> GetAllAsync()
        {
            var repairs = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.IncidentReport)
                .Include(r => r.AssignedToTechnician)
                .Include(r => r.RepairImages)
                .ToListAsync();

            return _mapper.Map<IEnumerable<RepairDto>>(repairs);
        }

        public async Task<IEnumerable<RepairDto>> GetMyRepairsAsync(Guid technicianId)
        {
            var repairs = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.IncidentReport)
                .Include(r => r.AssignedToTechnician)
                .Include(r => r.RepairImages)
                .Where(r => r.AssignedToTechnicianId == technicianId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<RepairDto>>(repairs);
        }

        public async Task<RepairDto?> GetByIdAsync(Guid id)
        {
            var repair = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.IncidentReport)
                .Include(r => r.AssignedToTechnician)
                .Include(r => r.RepairImages)
                .FirstOrDefaultAsync(r => r.Id == id);

            return repair == null ? null : _mapper.Map<RepairDto>(repair);
        }

        public async Task<RepairDto> CreateRepairFromIncidentAsync(Guid incidentReportId, Guid adminId)
        {
            var incident = await _context.IncidentReports
                .Include(i => i.Device)
                .FirstOrDefaultAsync(i => i.Id == incidentReportId);

            if (incident == null || incident.Status != IncidentStatus.ChoDuyet)
                throw new InvalidOperationException("Không thể tạo lệnh sửa cho báo cáo không hợp lệ");

            var device = incident.Device!;

            var repair = new Repair
            {
                Id = Guid.NewGuid(),
                DeviceId = device.Id,
                IncidentReportId = incident.Id,
                Description = $"Tự động tạo từ báo cáo: {incident.Description}",
                Status = RepairStatus.ChoThucHien,
                StartDate = DateTime.UtcNow
            };

            _context.Repairs.Add(repair);
            await _context.SaveChangesAsync();

            return _mapper.Map<RepairDto>(repair);
        }

        public async Task<bool> AcceptRepairAsync(Guid repairId, Guid technicianId)
        {
            var repair = await _context.Repairs.FindAsync(repairId);
            if (repair == null || repair.Status != RepairStatus.ChoThucHien) 
                return false;

            repair.Status = RepairStatus.DangSua;
            repair.AssignedToTechnicianId = technicianId;
            repair.StartDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CompleteRepairAsync(Guid repairId, RepairRequestDto dto, Guid technicianId)
        {
            var repair = await _context.Repairs
                .Include(r => r.RepairImages)
                .FirstOrDefaultAsync(r => r.Id == repairId);

            if (repair == null || repair.Status != RepairStatus.DangSua) 
                return false;
            
            if (repair.AssignedToTechnicianId != technicianId) 
                return false;

            repair.Description = dto.Description;
            repair.Cost = dto.Cost;
            repair.LaborHours = dto.LaborHours;
            repair.RepairCompany = dto.RepairCompany;
            repair.EndDate = DateTime.UtcNow;
            repair.Status = RepairStatus.ChoDuyetHoanTat;

            // Xử lý ảnh (nếu có)
            if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
            {
                foreach (var url in dto.ImageUrls)
                {
                    repair.RepairImages.Add(new RepairImage
                    {
                        Id = Guid.NewGuid(),
                        RepairId = repairId,
                        ImageUrl = url
                    });
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ConfirmCompletionAsync(Guid repairId, Guid adminId)
        {
            var repair = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.IncidentReport)
                .FirstOrDefaultAsync(r => r.Id == repairId);

            if (repair == null || repair.Status != RepairStatus.ChoDuyetHoanTat) 
                return false;

            // Cập nhật trạng thái repair
            repair.Status = RepairStatus.DaHoanTat;
            // repair.ApprovedBy = adminId; // Temporarily commented out until DB schema is updated
            // repair.ApprovedAt = DateTime.UtcNow; // Temporarily commented out until DB schema is updated

            // Cập nhật thiết bị về trạng thái sẵn sàng
            var device = repair.Device!;
            device.Status = DeviceStatus.Available;
            device.UpdatedAt = DateTime.UtcNow;
            device.UpdatedBy = adminId;

            // Ghi vào lịch sử thiết bị
            var deviceHistory = new DeviceHistory
            {
                Id = Guid.NewGuid(),
                DeviceId = device.Id,
                Action = "Hoàn tất sửa chữa",
                ActionDate = DateTime.UtcNow,
                ActionBy = adminId,
                Description = $"Hoàn tất sửa chữa từ báo cáo sự cố. Chi phí: {repair.Cost:C}"
            };

            _context.DeviceHistories.Add(deviceHistory);

            // Cập nhật trạng thái incident report
            if (repair.IncidentReport != null)
            {
                repair.IncidentReport.Status = IncidentStatus.DaDong;
                repair.IncidentReport.UpdatedAt = DateTime.UtcNow;
                repair.IncidentReport.UpdatedBy = adminId.ToString();
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectRepairAsync(Guid repairId, string reason, Guid technicianId)
        {
            var repair = await _context.Repairs.FindAsync(repairId);
            if (repair == null || repair.AssignedToTechnicianId != technicianId) 
                return false;

            repair.Status = RepairStatus.TuChoi;
            repair.RejectedBy = technicianId;
            repair.RejectedReason = reason;
            repair.RejectedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAsNotNeededAsync(Guid repairId, string note, Guid technicianId)
        {
            var repair = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.IncidentReport)
                .FirstOrDefaultAsync(r => r.Id == repairId);

            if (repair == null || repair.AssignedToTechnicianId != technicianId) 
                return false;

            repair.Status = RepairStatus.KhongCanSua;
            repair.Description = note;
            repair.EndDate = DateTime.UtcNow;

            // Cập nhật thiết bị về trạng thái sẵn sàng
            var device = repair.Device!;
            device.Status = DeviceStatus.Available;
            device.UpdatedAt = DateTime.UtcNow;

            // Ghi vào lịch sử thiết bị
            var deviceHistory = new DeviceHistory
            {
                Id = Guid.NewGuid(),
                DeviceId = device.Id,
                Action = "Không cần sửa chữa",
                ActionDate = DateTime.UtcNow,
                ActionBy = technicianId,
                Description = note
            };

            _context.DeviceHistories.Add(deviceHistory);

            // Cập nhật trạng thái incident report
            if (repair.IncidentReport != null)
            {
                repair.IncidentReport.Status = IncidentStatus.DaDong;
                repair.IncidentReport.UpdatedAt = DateTime.UtcNow;
                repair.IncidentReport.UpdatedBy = technicianId.ToString();
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}