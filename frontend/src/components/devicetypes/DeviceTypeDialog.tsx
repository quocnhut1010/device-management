import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Slide,
  Stack,
  CircularProgress,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  onSubmit: (data: Partial<DeviceTypeDto>) => void;
  initialData?: DeviceTypeDto | null;
  isLoading?: boolean;
}

const DeviceTypeDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<DeviceTypeDto>>({
    defaultValues: {
      typeName: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          typeName: initialData.typeName || '',
          description: initialData.description || '',
        });
      } else {
        reset({
          typeName: '',
          description: '',
        });
      }
    }
  }, [open, initialData, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onFormSubmit = (data: Partial<DeviceTypeDto>) => {
    const payload = {
      ...data,
      id: initialData?.id, // Thêm id nếu đang cập nhật
    };
    onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{initialData ? 'Cập nhật' : 'Thêm'} loại thiết bị</DialogTitle>

      <DialogContent dividers>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Tên loại thiết bị *"
              fullWidth
              required
              {...register('typeName', {
                required: 'Tên loại thiết bị không được để trống',
                maxLength: {
                  value: 100,
                  message: 'Không vượt quá 100 ký tự',
                },
              })}
              error={!!errors.typeName}
              helperText={errors.typeName?.message}
            />

            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={2}
              {...register('description', {
                maxLength: {
                  value: 255,
                  message: 'Không vượt quá 255 ký tự',
                },
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Stack>

          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={handleClose} disabled={isLoading}>
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {initialData ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceTypeDialog;
