using AutoMapper;
using backend.Data;
using backend.Models.Dtos.IncidentReports;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class IncidentReportService : IIncidentReportService
    {
        private readonly DeviceManagementDbContext _context;
        private readonly IMapper _mapper;
        public IncidentReportService(DeviceManagementDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<IncidentReportDto>> GetAllAsync()
        {
            var reports = await _context.IncidentReports
                .Include(r => r.Device)
                .Include(r => r.ReportedByUser)
                .ToListAsync();

            return _mapper.Map<IEnumerable<IncidentReportDto>>(reports);
        }

        public async Task<IEnumerable<IncidentReportDto>> GetMyReportsAsync(Guid userId)
        {
            var reports = await _context.IncidentReports
                .Include(r => r.Device)
                .Include(r => r.ReportedByUser)
                .Where(r => r.ReportedByUserId == userId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<IncidentReportDto>>(reports);
        }

        public async Task<IncidentReportDto?> GetByIdAsync(Guid id)
        {
            var report = await _context.IncidentReports
                .Include(r => r.Device)
                .Include(r => r.ReportedByUser)
                .FirstOrDefaultAsync(r => r.Id == id);

            return report == null ? null : _mapper.Map<IncidentReportDto>(report);
        }

        public async Task<IncidentReportDto> CreateAsync(CreateIncidentReportDto dto, Guid userId)
        {
            var report = _mapper.Map<IncidentReport>(dto);
            report.Id = Guid.NewGuid();
            report.ReportedByUserId = userId;
            report.ReportDate = DateTime.UtcNow;
            report.Status = IncidentStatus.ChoDuyet;
            var hasOpenIncident = await _context.IncidentReports
                .AnyAsync(r => r.DeviceId == dto.DeviceId &&
                    (r.Status == IncidentStatus.ChoDuyet || 
                    r.Status == IncidentStatus.DaTaoLenhSua));

            if (hasOpenIncident)
            {
                throw new InvalidOperationException("Thiết bị này đã có sự cố đang xử lý. Không thể tạo mới.");
            }
            
            _context.IncidentReports.Add(report);
            await _context.SaveChangesAsync();

            // Reload with includes to get nested data
            var createdReport = await _context.IncidentReports
                .Include(r => r.Device)
                .Include(r => r.ReportedByUser)
                .FirstOrDefaultAsync(r => r.Id == report.Id);

            return _mapper.Map<IncidentReportDto>(createdReport);
        }

        public async Task<IncidentReportDto?> UpdateStatusAsync(Guid id, UpdateIncidentReportDto dto, string updatedBy)
        {
            var report = await _context.IncidentReports.FirstOrDefaultAsync(r => r.Id == id);
            if (report == null) return null;

            report.Status = IncidentStatus.DaTaoLenhSua;
            report.UpdatedAt = DateTime.UtcNow;
            report.UpdatedBy = updatedBy;

            await _context.SaveChangesAsync();

            return _mapper.Map<IncidentReportDto>(report);
        }

        public async Task<(bool Success, string Message, object? Data)> ApproveAndCreateRepairAsync(Guid reportId, string updatedBy)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var report = await _context.IncidentReports
                    .Include(r => r.Device)
                    .Include(r => r.ReportedByUser)
                    .FirstOrDefaultAsync(r => r.Id == reportId);

                if (report == null)
                    return (false, "Không tìm thấy báo cáo sự cố", null);

                if (report.Status != IncidentStatus.ChoDuyet)
                    return (false, "Báo cáo không còn ở trạng thái 'Chờ duyệt'", null);

                if (report.Device == null)
                    return (false, "Thiết bị không hợp lệ", null);
                    
                // Kiểm tra thêm về device ID
                if (report.DeviceId == null || report.DeviceId == Guid.Empty)
                    return (false, "ID thiết bị không hợp lệ", null);

                // Cập nhật trạng thái IncidentReport
                report.Status = IncidentStatus.DaTaoLenhSua;
                report.UpdatedAt = DateTime.UtcNow;
                report.UpdatedBy = updatedBy;

                // Cập nhật trạng thái thiết bị (không cập nhật UpdatedBy vì có thể là nullable)
                report.Device.Status = DeviceStatus.Repairing;
                report.Device.UpdatedAt = DateTime.UtcNow;
                // Bỏ UpdatedBy nếu không bắt buộc

                // Tạo bản sửa chữa với minimal fields
                var repair = new Repair
                {
                    Id = Guid.NewGuid(),
                    IncidentReportId = report.Id,
                    DeviceId = report.DeviceId,
                    Description = $"Tự động tạo từ báo cáo: {report.Description}",
                    Status = RepairStatus.ChoThucHien,
                    StartDate = DateTime.UtcNow
                };

                _context.Repairs.Add(repair);
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();
                return (true, "Đã duyệt và tạo lệnh sửa chữa", repair);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                
                // Log detailed error for debugging
                Console.WriteLine($"Error in ApproveAndCreateRepairAsync: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                
                // Return more specific error message
                string errorMsg = ex.InnerException?.Message ?? ex.Message;
                return (false, $"Lỗi hệ thống: {errorMsg}", null);
            }
        }

        public async Task<bool> RejectAsync(Guid reportId, string reason, string rejectedBy)
        {
            var report = await _context.IncidentReports.FirstOrDefaultAsync(r => r.Id == reportId);
            if (report == null) return false;

            report.Status = IncidentStatus.DaTuChoi;
            report.RejectedReason = reason;
            report.RejectedBy = null; // Có thể gán Guid của user nếu cần
            report.RejectedAt = DateTime.UtcNow;
            report.UpdatedBy = rejectedBy;
            report.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
