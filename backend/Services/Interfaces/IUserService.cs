public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync(bool? isDeleted = null);
    Task<UserDto?> GetByIdAsync(Guid id);
    Task<UserDto?> UpdateAsync(Guid id, UserDto dto);
    Task<bool> DeleteAsync(Guid id);

    Task<UserDto> CreateAsync(RegisterUserDto dto);
    Task<bool> RestoreAsync(Guid id);
    

}
