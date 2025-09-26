import { useEffect, useState } from 'react';
import { MenuItem, TextField } from '@mui/material';
import { getAllDeviceModels, getActiveDeviceModels } from '../../services/deviceModelService';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onlyActive?: boolean; // ✅ thêm prop để lọc
}

const DeviceModelDropdown = ({ value, onChange, onlyActive = false }: Props) => {
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (onlyActive) {
          const res = await getActiveDeviceModels(); // chỉ lấy model chưa xoá mềm
          setModels(res.data);
        } else {
          const res = await getAllDeviceModels(); // lấy tất cả
          setModels(res.data);
        }
      } catch (error) {
        console.error('Lỗi khi load device models:', error);
      }
    };
    fetchData();
  }, [onlyActive]);

  return (
    <TextField
      select
      fullWidth
      label="Model"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {models.map((model: any) => (
        <MenuItem key={model.id} value={model.id}>
          {model.modelName}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default DeviceModelDropdown;
