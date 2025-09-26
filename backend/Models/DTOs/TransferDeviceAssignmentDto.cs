namespace backend.Models.DTOs
{
    public class TransferDeviceAssignmentDto
    {
        public Guid OldAssignmentId { get; set; }
        public Guid NewUserId { get; set; }
        public Guid NewDepartmentId { get; set; }
        public string? Note { get; set; }
    }
}