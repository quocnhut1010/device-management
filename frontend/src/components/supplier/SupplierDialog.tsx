// src/components/supplier/SupplierDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Slide,
  Stack,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SupplierDto } from '../../types/SupplierDto';

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SupplierDto>) => void;
  initialData?: SupplierDto | null;
}

const SupplierDialog = ({ open, onClose, onSubmit, initialData }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      supplierName: '',
      contactPerson: '',
      email: '',
      phone: '',
    },
  });

useEffect(() => {
  if (open) {
    if (initialData) {
      reset({
        supplierName: initialData.supplierName || '',
        contactPerson: initialData.contactPerson || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
      });
    } else {
      reset({
        supplierName: '',
        contactPerson: '',
        email: '',
        phone: '',
      });
    }
  }
}, [open, initialData, reset]);


  const onFormSubmit = (data: any) => {
  const payload = {
    ...data,
    id: initialData?.id, // nếu đang cập nhật
  };

  onSubmit(payload);
  handleClose();
};


  const handleClose = () => {
    onClose();
    reset(); // clear form
  };

  return (
    <Dialog open={open} TransitionComponent={Transition} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Cập nhật' : 'Thêm'} nhà cung cấp</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Tên nhà cung cấp *"
              fullWidth
              required
              {...register('supplierName', {
                required: 'Tên nhà cung cấp không được để trống',
                maxLength: {
                  value: 100,
                  message: 'Tên không vượt quá 100 ký tự',
                },
              })}
              error={!!errors.supplierName}
              helperText={errors.supplierName?.message}
            />

            <TextField
              label="Người liên hệ"
              fullWidth
              {...register('contactPerson', {
                maxLength: {
                  value: 100,
                  message: 'Người liên hệ không vượt quá 100 ký tự',
                },
              })}
              error={!!errors.contactPerson}
              helperText={errors.contactPerson?.message}
            />

            <TextField
              label="Email"
              fullWidth
              {...register('email', {
                maxLength: {
                  value: 100,
                  message: 'Email không vượt quá 100 ký tự',
                },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email không hợp lệ',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label="Số điện thoại"
              fullWidth
              {...register('phone', {
                maxLength: {
                  value: 20,
                  message: 'Số điện thoại không vượt quá 20 ký tự',
                },
                pattern: {
                  value: /^[0-9+\-()\s]*$/,
                  message: 'Số điện thoại không hợp lệ',
                },
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Stack>

          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={handleClose}>Huỷ</Button>
            <Button type="submit" variant="contained">
              {initialData ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierDialog;
