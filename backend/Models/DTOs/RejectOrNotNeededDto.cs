namespace backend.Models.DTOs
{
    public class RejectOrNotNeededDto
    {
        public int Status { get; set; } // 4 = TuChoi, 5 = KhongCanSua
        public string Reason { get; set; } = string.Empty;
    }
}