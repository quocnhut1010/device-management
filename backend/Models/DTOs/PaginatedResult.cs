namespace backend.Models.DTOs
{
    public class PaginatedResult<T>
    {
        public int TotalCount { get; set; }
         public IEnumerable<T> Items { get; set; } = new List<T>();
    }
}
