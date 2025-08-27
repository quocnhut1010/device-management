using AutoMapper;
using backend.Models.DTOs;
using backend.Models.Entities;

namespace backend.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // User -> UserDto
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.DepartmentId,
                        opt => opt.MapFrom(src => src.Department != null ? src.Department.DepartmentName : null));

            // Device -> DeviceDto
            CreateMap<Device, DeviceDto>()
                .ForMember(dest => dest.ModelName,
                        opt => opt.MapFrom(src => src.Model != null ? src.Model.ModelName : null))
                .ForMember(dest => dest.DepartmentName,
                        opt => opt.MapFrom(src => src.CurrentDepartment != null ? src.CurrentDepartment.DepartmentName : null))
                .ForMember(dest => dest.CurrentUserName,
                        opt => opt.MapFrom(src => src.CurrentUser != null ? src.CurrentUser.FullName : null));

            // LoginDto → không cần ánh xạ ngược

            // CreateIncidentReportDto -> IncidentReport
            CreateMap<CreateIncidentReportDto, IncidentReport>();

            // RepairRequestDto -> Repair
            CreateMap<RepairRequestDto, Repair>();

            CreateMap<DeviceModel, DeviceModelDto>().ReverseMap();

            CreateMap<Supplier, SupplierDto>().ReverseMap();

            CreateMap<Department, DepartmentDto>().ReverseMap();
            
            CreateMap<User, UserDto>()
    .ForMember(dest => dest.DepartmentName,
        opt => opt.MapFrom(src => src.Department != null ? src.Department.DepartmentName : null));

            CreateMap<RegisterUserDto, User>(); // ánh xạ tạo user


        }

    }
}
