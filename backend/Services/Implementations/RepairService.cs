using AutoMapper;
using backend.Data;
using backend.Models.Dtos;
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

        public async Task<IEnumerable<UserDto>> GetAvailableTechniciansAsync()
        {
            try
            {
                var technicians = await _context.Users
                    .Include(u => u.Department)
                    .Where(u => (u.IsDeleted == null || u.IsDeleted == false) && 
                               u.IsActive == true && 
                               u.Position == "Kỹ thuật viên")
                    .ToListAsync();

                Console.WriteLine($"Found {technicians.Count} technicians");
                return _mapper.Map<IEnumerable<UserDto>>(technicians);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAvailableTechniciansAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> AssignTechnicianAsync(Guid repairId, Guid technicianId, Guid adminId, string? note = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var repair = await _context.Repairs
                    .Include(r => r.Device)
                    .FirstOrDefaultAsync(r => r.Id == repairId);
                
                if (repair == null || repair.Status != RepairStatus.ChoThucHien) 
                    return false;

                // Kiểm tra kỹ thuật viên có tồn tại và đang hoạt động
                var technician = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == technicianId && 
                                            (u.IsDeleted == null || u.IsDeleted == false) && 
                                            u.IsActive == true && 
                                            u.Position == "Kỹ thuật viên");
                
                if (technician == null) return false;

                // Phân công kỹ thuật viên
                repair.AssignedToTechnicianId = technicianId;
                
                // Ghi lại lịch sử thiết bị
                var deviceHistory = new DeviceHistory
                {
                    Id = Guid.NewGuid(),
                    DeviceId = repair.DeviceId,
                    Action = "Phân công kỹ thuật viên sửa chữa",
                    ActionDate = DateTime.UtcNow,
                    ActionBy = adminId,
                    Description = $"Phân công cho kỹ thuật viên: {technician.FullName}. {note}"
                };
                
                _context.DeviceHistories.Add(deviceHistory);
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
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

        //     // Xử lý ảnh (nếu có)
        //    if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
        //     {
        //         foreach (var url in dto.ImageUrls)
        //         {
        //             repair.RepairImages.Add(new RepairImage
        //             {
        //                 Id = Guid.NewGuid(),
        //                 RepairId = repairId,
        //                 ImageUrl = url,
        //                 IsAfterRepair = true,
        //                 UploadedAt = DateTime.UtcNow,
        //                 UploadedBy = technicianId
        //             });
        //         }
        //     }
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
            device.Status = DeviceStatus.InUse;
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var repair = await _context.Repairs
                    .Include(r => r.Device)
                    .Include(r => r.IncidentReport)
                    .FirstOrDefaultAsync(r => r.Id == repairId);
                    
                if (repair == null || repair.AssignedToTechnicianId != technicianId) 
                    return false;
                    
                // Chỉ cho phép từ chối khi ở trạng thái Chờ thực hiện hoặc Đang sửa
                if (repair.Status != RepairStatus.ChoThucHien && repair.Status != RepairStatus.DangSua)
                    return false;

                // Cập nhật trạng thái repair - Từ chối
                repair.Status = RepairStatus.TuChoi;
                repair.RejectedBy = technicianId;
                repair.RejectedReason = reason;
                repair.RejectedAt = DateTime.UtcNow;
                repair.EndDate = DateTime.UtcNow;

                // Thiết bị giữ nguyên trạng thái hiện tại (thường là "Hỏng" hoặc "Chờ sửa")
                // Không thay đổi device.Status
                
                // Ghi vào lịch sử thiết bị
                var deviceHistory = new DeviceHistory
                {
                    Id = Guid.NewGuid(),
                    DeviceId = repair.DeviceId,
                    Action = "Từ chối sửa chữa",
                    ActionDate = DateTime.UtcNow,
                    ActionBy = technicianId,
                    Description = $"Kỹ thuật viên từ chối sửa chữa. Lý do: {reason}"
                };
                
                _context.DeviceHistories.Add(deviceHistory);

                // Cập nhật trạng thái incident report - Đóng báo cáo
                if (repair.IncidentReport != null)
                {
                    repair.IncidentReport.Status = IncidentStatus.DaDong;
                    repair.IncidentReport.UpdatedAt = DateTime.UtcNow;
                    repair.IncidentReport.UpdatedBy = technicianId.ToString();
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<bool> MarkAsNotNeededAsync(Guid repairId, string note, Guid technicianId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var repair = await _context.Repairs
                    .Include(r => r.Device)
                    .Include(r => r.IncidentReport)
                    .FirstOrDefaultAsync(r => r.Id == repairId);

                if (repair == null || repair.AssignedToTechnicianId != technicianId) 
                    return false;
                    
                // Chỉ cho phép không cần sửa khi ở trạng thái Chờ thực hiện hoặc Đang sửa
                if (repair.Status != RepairStatus.ChoThucHien && repair.Status != RepairStatus.DangSua)
                    return false;

                // Cập nhật trạng thái repair - Không cần sửa
                repair.Status = RepairStatus.KhongCanSua;
                repair.Description = note;
                repair.EndDate = DateTime.UtcNow;

                // Cập nhật thiết bị trở về trạng thái "Đang sử dụng" (vì thực tế không hỏng)
                var device = repair.Device!;
                device.Status = DeviceStatus.InUse;  // Thay đổi từ Available thành InUse
                device.UpdatedAt = DateTime.UtcNow;
                device.UpdatedBy = technicianId;

                // Ghi vào lịch sử thiết bị
                var deviceHistory = new DeviceHistory
                {
                    Id = Guid.NewGuid(),
                    DeviceId = device.Id,
                    Action = "Không cần sửa chữa",
                    ActionDate = DateTime.UtcNow,
                    ActionBy = technicianId,
                    Description = $"Thiết bị không có vấn đề thật sự, quay về dùng bình thường. Ghi chú: {note}"
                };

                _context.DeviceHistories.Add(deviceHistory);

                // Cập nhật trạng thái incident report - Đóng báo cáo
                if (repair.IncidentReport != null)
                {
                    repair.IncidentReport.Status = IncidentStatus.DaDong;
                    repair.IncidentReport.UpdatedAt = DateTime.UtcNow;
                    repair.IncidentReport.UpdatedBy = technicianId.ToString();
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<bool> RejectOrMarkNotNeededAsync(Guid repairId, RejectOrNotNeededDto dto, Guid technicianId)
        {
            // Gọi method tương ứng dựa trên status được chọn
            if (dto.Status == RepairStatus.TuChoi) // 4
            {
                return await RejectRepairAsync(repairId, dto.Reason, technicianId);
            }
            else if (dto.Status == RepairStatus.KhongCanSua) // 5
            {
                return await MarkAsNotNeededAsync(repairId, dto.Reason, technicianId);
            }

            return false; // Status không hợp lệ
        }
       public async Task<IEnumerable<RepairDto>> GetRepairHistoryByDeviceAsync(Guid deviceId)
        {
            var repairs = await _context.Repairs
                .Include(r => r.Device)
                .Include(r => r.AssignedToTechnician)
                .Include(r => r.RepairImages)
                .Where(r => r.DeviceId == deviceId)
                .OrderByDescending(r => r.StartDate)
                .ToListAsync();

            // ⚙️ Tính toán cảnh báo cơ bản
            var dtoList = _mapper.Map<List<RepairDto>>(repairs);

            // Lấy thông tin thiết bị để so sánh
            var device = await _context.Devices.FindAsync(deviceId);
            var deviceValue = device?.PurchasePrice ?? 0;

            decimal totalCost = dtoList.Sum(r => r.Cost ?? 0);
            int repairCount = dtoList.Count;
            var lastRepair = dtoList.OrderByDescending(r => r.EndDate ?? r.StartDate).FirstOrDefault();

            // ⚠️ Thêm cảnh báo tổng quan (đưa lên DTO)
            foreach (var r in dtoList)
            {
                r.Warning = "";
            }

            if (repairCount >= 3)
                dtoList.First().Warning += $"Thiết bị đã được sửa {repairCount} lần. ";

            if (deviceValue > 0 && totalCost > deviceValue * 0.5M)
                dtoList.First().Warning += $"Tổng chi phí sửa ({totalCost:N0}₫) vượt quá 50% giá trị thiết bị ({deviceValue:N0}₫). ";

            if (lastRepair?.EndDate != null && (DateTime.UtcNow - lastRepair.EndDate.Value).TotalDays < 30)
                dtoList.First().Warning += "Thiết bị vừa mới được sửa gần đây (<30 ngày).";

            return dtoList;
        }
        public async Task<DeviceRepairAnalysisDto> AnalyzeDeviceRepairHistoryAsync(Guid deviceId)
        {
            var repairs = await _context.Repairs
                .Include(r => r.Device)
                .Where(r => r.DeviceId == deviceId)
                .OrderByDescending(r => r.EndDate ?? r.StartDate)
                .ToListAsync();

            var device = await _context.Devices.FindAsync(deviceId);
            if (device == null)
                throw new Exception("Không tìm thấy thiết bị.");

            var analysis = new DeviceRepairAnalysisDto
            {
                DeviceId = device.Id,
                DeviceName = device.DeviceName ?? device.DeviceCode ?? "Thiết bị không xác định",
                DeviceValue = device.PurchasePrice ?? 0,
                RepairCount = repairs.Count,
                TotalCost = repairs.Sum(r => r.Cost ?? 0),
                LastRepairDate = repairs.FirstOrDefault()?.EndDate ?? repairs.FirstOrDefault()?.StartDate
            };

            // ⚠️ Cảnh báo nghiệp vụ
            if (analysis.RepairCount >= 3)
                analysis.Warnings.Add($"Thiết bị đã được sửa {analysis.RepairCount} lần.");

            if (analysis.DeviceValue > 0 && analysis.TotalCost > analysis.DeviceValue * 0.5M)
                analysis.Warnings.Add($"Tổng chi phí sửa ({analysis.TotalCost:N0}₫) vượt quá 50% giá trị thiết bị ({analysis.DeviceValue:N0}₫).");

            if (analysis.LastRepairDate.HasValue && (DateTime.UtcNow - analysis.LastRepairDate.Value).TotalDays < 30)
                analysis.Warnings.Add("Thiết bị vừa được sửa gần đây (<30 ngày).");

            // ⚙️ Gợi ý hành động
            if (analysis.Warnings.Count == 0)
                analysis.Suggestion = "Thiết bị hoạt động ổn định.";
            else if (analysis.Warnings.Count == 1)
                analysis.Suggestion = "Nên theo dõi thêm tình trạng thiết bị.";
            else if (analysis.TotalCost > analysis.DeviceValue)
                analysis.Suggestion = "Chi phí sửa vượt giá trị thiết bị. Nên thanh lý.";
            else
                analysis.Suggestion = "Nên xem xét thay thế hoặc thanh lý thiết bị.";

            return analysis;
        }


    }
}
