import { MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { getUsers, getUsersByDepartment }  from '../../services/userService';
import { UserDto } from '../../types/UserDto';

interface Props {
  value: string;
  onChange: (value: string) => void;
  departmentId?: string; // Thêm prop để lọc user theo department
  label?: string; // Cho phép tùy chỉnh label
  fullWidth?: boolean; // Cho phép tùy chỉnh fullWidth
  required?: boolean; // Cho phép tùy chỉnh required
}

const UserDropdown = ({ value, onChange, departmentId, label = "Người quản lý", fullWidth = true, required = false }: Props) => {
  const [users, setUsers] = useState<UserDto[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (departmentId) {
          // Sử dụng API mới để lấy users theo department (chỉ active và chưa xóa)
          const users = await getUsersByDepartment(departmentId);
          setUsers(users);
        } else {
          // Nếu không có department, lấy tất cả active users
          const res = await getUsers();
          const filteredUsers = res.data.filter(user => user.isActive);
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, [departmentId]); // Thêm departmentId vào dependencies

  return (
    <TextField
      select
      fullWidth={fullWidth}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      {users.map((user) => (
        <MenuItem key={user.id} value={user.id}>
          {user.fullName}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default UserDropdown;
