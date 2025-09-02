// src/components/user/UserProfileDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Stack,
  Button,
  Avatar,
  Typography,
  Divider
} from '@mui/material';
import { useState, useEffect } from 'react';
import { UserDto } from '../../types/UserDto';
import useUserRole from '../../services/useUserRole';
import { toZonedTime, format } from 'date-fns-tz';
import { vi } from 'date-fns/locale';
import UserAvatar from '../common/UserAvatar';

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserDto;
  onSubmit: (data: Partial<UserDto>) => void;
}


const UserProfileDialog = ({ open, onClose, user, onSubmit }: Props) => {
  const { role } = useUserRole();
  const [form, setForm] = useState<Partial<UserDto>>({});

  useEffect(() => {
    setForm(user);
  }, [user]);

  const handleChange = (field: keyof UserDto, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

const initials = user?.fullName
  ? user.fullName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  : '?';


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="column" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 84, height: 84 }}>
            <UserAvatar
              name={user?.fullName || ''}
              // imageUrl={user?.}
              isOnline={true} // sau này có thể truyền từ API trạng thái
              editable={true}
              onImageSelect={(file) => {
                console.log('Selected avatar file:', file);
                // TODO: gửi API upload sau này
              }}
            />
            {initials}
            </Avatar>
          <Typography variant="h6">Thông tin cá nhân</Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            label="Họ tên"
            value={form.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            fullWidth
            />
          <TextField
            label="Email"
            value={form.email}
            InputProps={{ readOnly: true }}
            fullWidth
          />
          <TextField
            label="Vai trò"
            value={form.role}
            InputProps={{ readOnly: role !== 'Admin' }}
            fullWidth
          />
          <TextField
            label="Phòng ban"
            value={form.departmentName}
            InputProps={{ readOnly: role !== 'Admin' }}
            fullWidth
          />
          <TextField
            label="Vị trí"
            value={form.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
    {user?.updatedAt && (
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mt: 1 }}
      >
        Lần cập nhật:{" "}
        {format(
          new Date(new Date(user.updatedAt).getTime() + 7 * 60 * 60 * 1000),
          "dd/MM/yyyy 'lúc' HH:mm",
          { locale: vi }
        )}
      </Typography>
    )}
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={() => onSubmit(form)}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileDialog;
