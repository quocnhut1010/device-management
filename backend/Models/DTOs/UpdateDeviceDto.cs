
namespace backend.Models.DTOs
{
    public class UpdateDeviceDto : CreateDeviceDto
    {
        public Guid? UpdatedBy { get; set; }
    }
}
