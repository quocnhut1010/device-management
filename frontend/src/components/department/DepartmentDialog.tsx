// src/components/department/DepartmentDialog.tsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack
} from '@mui/material';
import { useEffect, useState } from 'react';
import { DepartmentDto } from '../../types/DepartmentDto';
import {
  createDepartment,
  updateDepartment,
} from '../../services/departmentService';
import { useNotification } from '../../hooks/useNotification';
interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  selected: DepartmentDto | null;
}

const DepartmentDialog = ({ open, onClose, refresh, selected }: Props) => {
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    location: '',
  });
const { notify } = useNotification();
  useEffect(() => {
    if (selected) {
      setFormData({
        departmentName: selected.departmentName,
        departmentCode: selected.departmentCode || '',
        location: selected.location || '',
      });
    } else {
      setFormData({
        departmentName: '',
        departmentCode: '',
        location: '',
      });
    }
  }, [selected]);

  const handleSubmit = async () => {
    try {
      if (selected) {
        await updateDepartment(selected.id, formData);
        notify('Cập nhật phòng ban thành công', 'success');
      } else {
        await createDepartment(formData);
        notify('Tạo mới phòng ban thành công', 'success');
      }
      refresh();
      onClose();
    } catch (err) {
      console.error('Lỗi lưu phòng ban:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{selected ? 'Cập nhật' : 'Thêm mới'} phòng ban</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Tên phòng ban"
            fullWidth
            value={formData.departmentName}
            onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
          />
          <TextField
            label="Mã phòng ban"
            fullWidth
            value={formData.departmentCode}
            onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
          />
          <TextField
            label="Vị trí"
            fullWidth
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          {selected ? 'Cập nhật' : 'Thêm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentDialog;
