namespace backend.Models;
public class RepairImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? Description { get; set; }  // nếu có
}
