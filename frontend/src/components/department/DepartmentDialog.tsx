// src/components/department/DepartmentDialog.tsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack
} from '@mui/material';
import { useEffect } from 'react';
import { DepartmentDto } from '../../types/DepartmentDto';
import { createDepartment, updateDepartment } from '../../services/departmentService';
import { useNotification } from '../../hooks/useNotification';
import { useForm } from 'react-hook-form';

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  selected: DepartmentDto | null;
}

const DepartmentDialog = ({ open, onClose, refresh, selected }: Props) => {
  const { notify } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      departmentName: '',
      departmentCode: '',
      location: '',
    },
  });

  // Load dữ liệu khi sửa
  useEffect(() => {
    if (selected) {
      setValue('departmentName', selected.departmentName);
      setValue('departmentCode', selected.departmentCode || '');
      setValue('location', selected.location || '');
    } else {
      reset();
    }
  }, [selected, setValue, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (selected) {
        await updateDepartment(selected.id, data);
        notify('Cập nhật phòng ban thành công', 'success');
      } else {
        await createDepartment(data);
        notify('Tạo mới phòng ban thành công', 'success');
      }
      refresh();
      handleClose();
    } catch (err) {
      console.error('Lỗi lưu phòng ban:', err);
      notify('Đã xảy ra lỗi khi lưu phòng ban', 'error');
    }
  };

  const handleClose = () => {
    onClose();
    reset(); // reset form khi đóng
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>{selected ? 'Cập nhật' : 'Thêm mới'} phòng ban</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Tên phòng ban *"
              fullWidth
              {...register('departmentName', {
                required: 'Tên phòng ban không được để trống',
                maxLength: {
                  value: 100,
                  message: 'Tên phòng ban không vượt quá 100 ký tự',
                },
              })}
              error={!!errors.departmentName}
              helperText={errors.departmentName?.message}
            />

            <TextField
              label="Mã phòng ban"
              fullWidth
              {...register('departmentCode', {
                maxLength: {
                  value: 50,
                  message: 'Mã phòng ban không vượt quá 50 ký tự',
                },
              })}
              error={!!errors.departmentCode}
              helperText={errors.departmentCode?.message}
            />

            <TextField
              label="Vị trí"
              fullWidth
              {...register('location', {
                maxLength: {
                  value: 100,
                  message: 'Vị trí không vượt quá 100 ký tự',
                },
              })}
              error={!!errors.location}
              helperText={errors.location?.message}
            />
          </Stack>

          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained">
              {selected ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentDialog;
