using AutoMapper;
using backend.Models;
using backend.Models.Dtos.IncidentReports;
using backend.Models.DTOs;
using backend.Models.Entities;

namespace backend.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // User <-> UserDto
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.Department != null ? src.Department.DepartmentName : null));

            CreateMap<UserDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore());

            CreateMap<RegisterUserDto, User>();

            // ✅ Device → DeviceDto
            CreateMap<Device, DeviceDto>()
                .ForMember(dest => dest.ModelName,
                    opt => opt.MapFrom(src => src.Model != null ? src.Model.ModelName : null))
                .ForMember(dest => dest.DeviceTypeName,
                    opt => opt.MapFrom(src => src.Model != null && src.Model.DeviceType != null ? src.Model.DeviceType.TypeName : null))
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.CurrentDepartment != null ? src.CurrentDepartment.DepartmentName : null))
                .ForMember(dest => dest.CurrentUserName,
                    opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.FullName : null))
                .ForMember(dest => dest.SupplierName,
                    opt => opt.MapFrom(src => src.Supplier != null ? src.Supplier.SupplierName : null));

            // Device Create/Update
            CreateMap<CreateDeviceDto, Device>();

            CreateMap<UpdateDeviceDto, Device>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());



            // Repair
            CreateMap<RepairRequestDto, Repair>();

            // DeviceModel
            CreateMap<DeviceModel, DeviceModelDto>()
                .ForMember(dest => dest.TypeName,
                    opt => opt.MapFrom(src => src.DeviceType != null ? src.DeviceType.TypeName : null))
                .ReverseMap();

            // Supplier
            CreateMap<Supplier, SupplierDto>()
                .ForMember(dest => dest.DeviceCount,
                    opt => opt.MapFrom(src => src.Devices != null
                        ? src.Devices.Count(d => !d.IsDeleted.GetValueOrDefault())
                        : 0))
                .ReverseMap();

            CreateMap<SupplierDto, Supplier>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore());

            // Department
            CreateMap<Department, DepartmentDto>()
                .ForMember(dest => dest.DeviceCount,
                    opt => opt.MapFrom(src => src.Devices != null ? src.Devices.Count(d => !d.IsDeleted.GetValueOrDefault()) : 0))
                .ForMember(dest => dest.UserCount,
                    opt => opt.MapFrom(src => src.Users != null ? src.Users.Count(u => !u.IsDeleted.GetValueOrDefault()) : 0))
                .ReverseMap();

            // DeviceType
            CreateMap<DeviceType, DeviceTypeDto>().ReverseMap();

            // DeviceAssignment → DeviceAssignmentDto
            CreateMap<DeviceAssignment, DeviceAssignmentDto>()
                .ForMember(dest => dest.DeviceCode, opt => opt.MapFrom(src => src.Device!.DeviceCode))
                .ForMember(dest => dest.DeviceName, opt => opt.MapFrom(src => src.Device!.DeviceName))
                .ForMember(dest => dest.AssignedToUserName, opt => opt.MapFrom(src => src.AssignedToUser!.FullName))
                .ForMember(dest => dest.AssignedToDepartmentName, opt => opt.MapFrom(src => src.AssignedToDepartment!.DepartmentName))
                .ForMember(dest => dest.AssignedByUserName, opt => opt.MapFrom(src => src.AssignedByUser!.FullName));

            // CreateDeviceAssignmentDto → DeviceAssignment
            CreateMap<CreateDeviceAssignmentDto, DeviceAssignment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore());

            // IncidentReport
            CreateMap<CreateIncidentReportDto, IncidentReport>();

            // IncidentReport → IncidentReportDto (with nested objects)
            CreateMap<IncidentReport, IncidentReportDto>()
                .ForMember(dest => dest.Device, opt => opt.MapFrom(src => src.Device))
                .ForMember(dest => dest.ReportedByUser, opt => opt.MapFrom(src => src.ReportedByUser));

            // Device → IncidentDeviceDto (simplified for incident reports)
            CreateMap<Device, backend.Models.Dtos.IncidentReports.IncidentDeviceDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));


            // User → IncidentUserDto (simplified for incident reports)
            CreateMap<User, backend.Models.Dtos.IncidentReports.IncidentUserDto>();

            // IncidentReportDto → Entity: Không cần ánh xạ ngược

            // UpdateIncidentReportDto → IncidentReport
            CreateMap<UpdateIncidentReportDto, IncidentReport>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // tránh ghi đè Id
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore());
            CreateMap<RepairImage, RepairImageDto>(); // ánh xạ từng ảnh

            CreateMap<Repair, RepairDto>()
             .ForMember(dest => dest.DeviceCode, opt => opt.MapFrom(src => src.Device.DeviceCode))
             .ForMember(dest => dest.DeviceName, opt => opt.MapFrom(src => src.Device.DeviceName))
             .ForMember(dest => dest.TechnicianId, opt => opt.MapFrom(src => src.AssignedToTechnicianId ?? Guid.Empty))
             .ForMember(dest => dest.TechnicianName, opt => opt.MapFrom(src => src.AssignedToTechnician != null ? src.AssignedToTechnician.FullName : null))
             .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
             .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
             .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate))
             .ForMember(dest => dest.RepairImages, opt => opt.MapFrom(src => src.RepairImages))
            .ForMember(dest => dest.DeviceStatus, opt => opt.MapFrom(src => src.Device.Status));


            CreateMap<Replacement, ReplacementDto>()
            .ForMember(dest => dest.OldDeviceCode, opt => opt.MapFrom(src => src.OldDevice!.DeviceCode))
            .ForMember(dest => dest.OldDeviceName, opt => opt.MapFrom(src => src.OldDevice!.DeviceName))
            .ForMember(dest => dest.NewDeviceCode, opt => opt.MapFrom(src => src.NewDevice!.DeviceCode))
            .ForMember(dest => dest.NewDeviceName, opt => opt.MapFrom(src => src.NewDevice!.DeviceName))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.OldDevice!.CurrentUserId))
            .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.OldDevice!.CurrentUser!.FullName))
            .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.OldDevice!.CurrentUser!.Email));

            // Liquidation
            CreateMap<Liquidation, LiquidationDto>()
                .ForMember(dest => dest.DeviceCode, opt => opt.MapFrom(src => src.Device!.DeviceCode))
                .ForMember(dest => dest.DeviceName, opt => opt.MapFrom(src => src.Device!.DeviceName))
                .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedByNavigation!.FullName));

            CreateMap<CreateLiquidationDto, Liquidation>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedBy, opt => opt.Ignore());
        }
    }
}
