import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  MenuItem,
  Box,
  Collapse,
  CircularProgress,
  Fade,
} from '@mui/material';
import { useEffect, useState, forwardRef } from 'react';
import { RegisterUserDto, UserDto } from '../../types/UserDto';
import { getAllDepartments } from '../../services/departmentService';
import { DepartmentDto } from '../../types/DepartmentDto';
import { TransitionProps } from '@mui/material/transitions';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterUserDto | UserDto) => void;
  user?: UserDto | null;
}

const commonPositions = ['Nhân viên', 'Trưởng phòng', 'Kỹ thuật', 'Khác'];

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />;
});

const UserDialog = ({ open, onClose, onSubmit, user }: Props) => {
  const [form, setForm] = useState<RegisterUserDto | UserDto>({
    fullName: '',
    email: '',
    password: '',
    role: 'User',
    departmentId: '',
    position: '',
  });

  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    if (user) {
      setForm({ ...user, password: '' });
    } else {
      setForm({
        fullName: '',
        email: '',
        password: '',
        role: 'User',
        departmentId: '',
        position: '',
      });
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getAllDepartments(false); // chỉ lấy phòng ban đang hoạt động
        setDepartments(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách phòng ban', err);
      }
    };

    fetchDepartments();
    resetForm();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const finalData = {
        ...form,
        position:
          form.position === 'Khác'
            ? (form as any).customPosition || ''
            : form.position,
      };
      await onSubmit(finalData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
    >
      <DialogTitle>
        {user ? 'Cập nhật người dùng' : 'Thêm người dùng'}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? 'none' : 'auto',
        }}
      >
        <DialogContentText sx={{ mb: 2 }}>
          {user
            ? 'Cập nhật thông tin chi tiết của người dùng trong hệ thống.'
            : 'Nhập thông tin để thêm người dùng mới vào hệ thống.'}
        </DialogContentText>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              name="fullName"
              label="Họ tên"
              fullWidth
              variant="outlined"
              value={form.fullName}
              onChange={handleChange}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={form.email}
              onChange={handleChange}
            />
          </Box>

          {!user && (
            <TextField
              name="password"
              type="password"
              label="Mật khẩu"
              fullWidth
              variant="outlined"
              value={(form as RegisterUserDto).password || ''}
              onChange={handleChange}
            />
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              name="role"
              label="Vai trò"
              select
              fullWidth
              variant="outlined"
              value={form.role}
              onChange={handleChange}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>

            <TextField
              name="departmentId"
              label="Phòng ban"
              select
              fullWidth
              variant="outlined"
              value={form.departmentId || ''}
              onChange={handleChange}
            >
              {departments.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>
                  {dep.departmentName}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <TextField
              name="position"
              label="Vị trí"
              select
              fullWidth
              variant="outlined"
              value={form.position || ''}
              onChange={handleChange}
            >
              {commonPositions.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </TextField>

            <Collapse in={form.position === 'Khác'} timeout="auto" unmountOnExit>
              <TextField
                name="customPosition"
                label="Nhập vị trí khác"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                value={(form as any).customPosition || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customPosition: e.target.value,
                  }))
                }
              />
            </Collapse>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => {
            resetForm();
            onClose();
          }}
          color="secondary"
          sx={{ borderRadius: 2 }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
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
};

export default UserDialog;
