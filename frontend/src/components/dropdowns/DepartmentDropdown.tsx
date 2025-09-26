import { MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllDepartments } from '../../services/departmentService';
import { DepartmentDto } from '../../types/DepartmentDto';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string; // Cho phép tùy chỉnh label
  fullWidth?: boolean; // Cho phép tùy chỉnh fullWidth
  required?: boolean; // Cho phép tùy chỉnh required
}

const DepartmentDropdown = ({ value, onChange, label = "Phòng ban", fullWidth = true, required = false }: Props) => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      // Chỉ lấy phòng ban chưa bị xóa (isDeleted = false)
      const res = await getAllDepartments(false);
      setDepartments(res.data);
    };
    fetchDepartments();
  }, []);

  return (
    <TextField
      select
      fullWidth={fullWidth}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      {departments.map((dept) => (
        <MenuItem key={dept.id} value={dept.id}>
          {dept.departmentName}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default DepartmentDropdown;
