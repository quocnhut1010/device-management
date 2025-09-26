// src/components/deviceModels/DeviceModelDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Slide,
  Stack,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DeviceModelDto } from '../../types/DeviceModelDto';
import { DeviceTypeDto } from '../../types/DeviceTypeDto';

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DeviceModelDto>) => void;
  initialData?: DeviceModelDto | null;
  isLoading?: boolean;
  deviceTypes: DeviceTypeDto[];
}

const DeviceModelDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  deviceTypes,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<DeviceModelDto>>({
    defaultValues: {
      modelName: '',
      deviceTypeId: '',
      manufacturer: '',
      specifications: '',
    },
  });

  // Khi mở dialog → set lại dữ liệu từ initialData
useEffect(() => {
  if (open && deviceTypes.length > 0) {
    reset({
      id: initialData?.id || undefined,
      modelName: initialData?.modelName || '',
      deviceTypeId: initialData?.deviceTypeId?.toString() || '', // <- chuyển thành string
      manufacturer: initialData?.manufacturer || '',
      specifications: initialData?.specifications || '',
    });
  }
}, [open, initialData, deviceTypes, reset]);



  const handleClose = () => {
    reset(); // reset về default
    onClose();
  };

  const onFormSubmit = (data: Partial<DeviceModelDto>) => {
    const payload = { ...data, id: initialData?.id };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={handleClose} TransitionComponent={Transition} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Cập nhật' : 'Thêm'} model thiết bị</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Tên model *"
              fullWidth
              required
              {...register('modelName', { required: 'Không được để trống' })}
              error={!!errors.modelName}
              helperText={errors.modelName?.message}
            />

           <TextField
            select
            label="Loại thiết bị *"
            fullWidth
            required
            {...register('deviceTypeId', { required: 'Chọn loại thiết bị' })}
            error={!!errors.deviceTypeId}
            helperText={errors.deviceTypeId?.message}
          >
          {deviceTypes.length === 0 ? (
            <MenuItem disabled>Đang tải...</MenuItem>
          ) : (
            deviceTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.typeName}
              </MenuItem>
            ))
          )}
          </TextField>

            <TextField
              label="Hãng sản xuất"
              fullWidth
              {...register('manufacturer')}
            />

            <TextField
              label="Thông số kỹ thuật"
              fullWidth
              multiline
              minRows={2}
              {...register('specifications')}
            />
          </Stack>

          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={handleClose} disabled={isLoading}>Huỷ</Button>
            <Button type="submit" variant="contained" disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}>
              {initialData ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceModelDialog;
