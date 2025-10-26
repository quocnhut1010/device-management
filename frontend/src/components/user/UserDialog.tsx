import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Collapse,
  CircularProgress,
  Fade,
} from '@mui/material';
import { forwardRef, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RegisterUserDto, UserDto } from '../../types/UserDto';
import { getAllDepartments } from '../../services/departmentService';
import { DepartmentDto } from '../../types/DepartmentDto';
import { TransitionProps } from '@mui/material/transitions';

// ================== SCHEMA ==================
const validationSchema = yup.object({
  fullName: yup.string().required('Vui lòng nhập họ tên'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: yup
    .string()
    .when('isEdit', {
      is: false,
      then: (schema) =>
        schema
          .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
          .required('Vui lòng nhập mật khẩu'),
    }),
  confirmPassword: yup
    .string()
    .when('isEdit', {
      is: false,
      then: (schema) =>
        schema
          .oneOf([yup.ref('password')], 'Mật khẩu nhập lại không khớp')
          .required('Vui lòng xác nhận mật khẩu'),
    }),
  role: yup.string().required('Vui lòng chọn vai trò'),
  departmentId: yup.string().required('Vui lòng chọn phòng ban'),
  position: yup.string().required('Vui lòng chọn vị trí'),
});

const commonPositions = ['Nhân viên', 'Trưởng phòng', 'Kỹ thuật', 'Khác'];

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />;
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterUserDto | UserDto) => void;
  user?: UserDto | null;
}

// ================== COMPONENT ==================
export default function UserDialog({ open, onClose, onSubmit, user }: Props) {
  const isEdit = Boolean(user);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'User',
      departmentId: '',
      position: '',
      customPosition: '',
      isEdit: isEdit,
    },
  });

  // Load departments & set form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllDepartments(false);
        setDepartments(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách phòng ban', err);
      }
    };
    fetchData();

    if (user) {
      reset({
        ...user,
        password: '',
        confirmPassword: '',
        isEdit: true,
      });
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'User',
        departmentId: '',
        position: '',
        customPosition: '',
        isEdit: false,
      });
    }
  }, [user, reset]);

  const position = watch('position');
  const customPosition = watch('customPosition');

  const onSubmitForm = async (data: any) => {
    setLoading(true);
    try {
      const finalData = {
        ...data,
        position: data.position === 'Khác' ? customPosition : data.position,
      };
      delete finalData.confirmPassword;
      delete finalData.isEdit;

      await onSubmit(finalData);
    } finally {
      setLoading(false);
    }
  };

  // ================== UI ==================
  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
    >
      <DialogTitle>{isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng'}</DialogTitle>

      <DialogContent
        dividers
        sx={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? 'none' : 'auto',
        }}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Họ tên + Email */}
          <Box display="flex" gap={2}>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Họ tên"
                  fullWidth
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message as string}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message as string}
                />
              )}
            />
          </Box>

          {/* Mật khẩu & Xác nhận mật khẩu (chỉ khi thêm mới) */}
          {!isEdit && (
            <>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mật khẩu"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message as string}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nhập lại mật khẩu"
                    type="password"
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message as string}
                  />
                )}
              />
            </>
          )}

          {/* Vai trò & Phòng ban */}
          <Box display="flex" gap={2}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Vai trò"
                  fullWidth
                  error={!!errors.role}
                  helperText={errors.role?.message as string}
                >
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Phòng ban"
                  fullWidth
                  error={!!errors.departmentId}
                  helperText={errors.departmentId?.message as string}
                >
                  {departments.map((dep) => (
                    <MenuItem key={dep.id} value={dep.id}>
                      {dep.departmentName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>

          {/* Vị trí */}
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Vị trí"
                fullWidth
                error={!!errors.position}
                helperText={errors.position?.message as string}
              >
                {commonPositions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {pos}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Collapse in={position === 'Khác'} timeout="auto" unmountOnExit>
            <Controller
              name="customPosition"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nhập vị trí khác"
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            />
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => {
            reset();
            onClose();
          }}
          color="secondary"
          sx={{ borderRadius: 2 }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit(onSubmitForm)}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
          sx={{ borderRadius: 2 }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
