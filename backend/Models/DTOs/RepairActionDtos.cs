namespace backend.Models.DTOs
{
    public class RejectRepairDto
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class NotNeededRepairDto
    {
        public string Note { get; set; } = string.Empty;
    }

    // Bạn cũng có thể bổ sung các action DTO khác ở đây nếu muốn
}
