using AutoMapper;
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

            // map ngược lại từ UserDto -> User (dùng cho Update)
            CreateMap<UserDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())              // không override Id
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())    // không cho sửa password
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore());

            // RegisterUserDto -> User (dùng cho Create)
            CreateMap<RegisterUserDto, User>();

            // Device -> DeviceDto
            CreateMap<Device, DeviceDto>()
                .ForMember(dest => dest.ModelName,
                    opt => opt.MapFrom(src => src.Model != null ? src.Model.ModelName : null))
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.CurrentDepartment != null ? src.CurrentDepartment.DepartmentName : null))
                .ForMember(dest => dest.CurrentUserName,
                    opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.FullName : null));

            // IncidentReport
            CreateMap<CreateIncidentReportDto, IncidentReport>();

            // Repair
            CreateMap<RepairRequestDto, Repair>();

            // DeviceModel
            CreateMap<DeviceModel, DeviceModelDto>().ReverseMap();

            // Supplier
            CreateMap<Supplier, SupplierDto>().ReverseMap();

            // Department <-> DepartmentDto
            CreateMap<Department, DepartmentDto>()
                .ForMember(dest => dest.DeviceCount,
                    opt => opt.MapFrom(src => src.Devices != null ? src.Devices.Count(d => !d.IsDeleted.GetValueOrDefault()) : 0))
                .ForMember(dest => dest.UserCount,
                    opt => opt.MapFrom(src => src.Users != null ? src.Users.Count(u => !u.IsDeleted.GetValueOrDefault()) : 0))
                .ReverseMap();
        }
    }
}
