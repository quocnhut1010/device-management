import { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add, Delete, Edit, Restore } from '@mui/icons-material';

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
} from '../services/userService';
import { UserDto, RegisterUserDto } from '../types/UserDto';
import UserDialog from '../components/user/UserDialog';
import useUserRole from '../services/useUserRole';
import { useNotification } from '../hooks/useNotification';
import { getUserFromToken } from '../services/auth';
import CustomSearchInput from '../components/ui/CustomSearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';


const UserPage = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [potisionFilter, setPotisionFilter] = useState('');
  const uniqueRoles = Array.from(new Set(users.map((u) => u.role))).filter(Boolean);
  const uniqueDepartments = Array.from(new Set(users.map((u) => u.departmentName))).filter(Boolean) as string[];
  const uniquePotisions = Array.from(new Set(users.map((u) => u.position))).filter(Boolean) as string[];
  const filteredUsers = users.filter((user) => {
  const matchSearch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

  const matchRole = roleFilter ? user.role === roleFilter : true;
  const matchDepartment = departmentFilter ? user.departmentName === departmentFilter : true;
  const matchPotision = potisionFilter ? user.position == potisionFilter : true;

    return matchSearch && matchRole && matchDepartment && matchPotision;
  });



  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'delete' | 'restore' | null;
    id?: string;
  }>({ open: false, action: null });

  const { role } = useUserRole();
  const { notify } = useNotification();
  const { nameid: currentUserId } = getUserFromToken() || {};

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      const filtered =
      role === 'Admin'
        ? res.data.filter((user: UserDto) =>
            user.id !== currentUserId || (user.id === currentUserId && user.isDeleted))
        : res.data;
      console.log('📌 Users từ API:', filtered);
      setUsers(filtered);
    } catch {
      notify('Lỗi khi tải danh sách người dùng', 'error');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdd = () => {
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEdit = (user: UserDto) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({ open: true, action: 'delete', id });
  };

  const handleRestore = (id: string) => {
    setConfirmDialog({ open: true, action: 'restore', id });
  };

  const executeConfirm = async () => {
    if (!confirmDialog.id || !confirmDialog.action) return;
    try {
      if (confirmDialog.action === 'delete') {
        await deleteUser(confirmDialog.id);
        notify('Xoá người dùng thành công', 'success');
      } else {
        await restoreUser(confirmDialog.id);
        notify('Khôi phục người dùng thành công', 'success');
      }
      loadUsers();
    } catch {
      notify('Thao tác thất bại', 'error');
    } finally {
      setConfirmDialog({ open: false, action: null });
    }
  };

  const handleSubmit = async (data: RegisterUserDto | UserDto) => {
    try {
      if ('id' in data) {
        await updateUser(data.id, data);
        notify('Cập nhật người dùng thành công', 'success');
      } else {
        await createUser(data);
        notify('Thêm người dùng thành công', 'success');
      }
      setOpenDialog(false);
      loadUsers();
    } catch (err: any) {
      notify(err?.response?.data?.message || 'Thao tác thất bại', 'error');
    }
  };




  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="600">
          Quản lý người dùng
        </Typography>
        <CustomSearchInput value={search} onChange={setSearch} 
        placeholder="Tìm theo tên hoặc email" />
        {/* <FilterDropdown
        label="Vai trò"
        value={roleFilter}
        onChange={setRoleFilter}
        options={uniqueRoles}
      /> */}

      <FilterDropdown
        label="Phòng ban"
        value={departmentFilter ?? ''}
        onChange={setDepartmentFilter}
        options={uniqueDepartments}
      />
        <FilterDropdown
        label="Vị trí"
        value={potisionFilter ?? ''}
        onChange={setPotisionFilter}
        options={uniquePotisions}
      />

        {role === 'Admin' && (
          <Button
            startIcon={<Add />}
            variant="contained"
            color="primary"
            onClick={handleAdd}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Thêm người dùng
          </Button>
        )}
      </Paper>

      {/* Bảng danh sách */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Phòng ban</TableCell>
              <TableCell>Vị trí</TableCell>
              {role === 'Admin' && <TableCell align="center">Thao tác</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                hover
                sx={{
                  opacity: user.isDeleted ? 0.6 : 1,
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {user.fullName}
                    {user.isDeleted && <Chip label="Đã xoá" size="small" color="error" />}
                  </Stack>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.departmentName}</TableCell>
                <TableCell>{user.position}</TableCell>
                {role === 'Admin' && (
                  <TableCell align="center">
                    {user.isDeleted ? (
                      <Tooltip title="Khôi phục">
                        <Button
                          startIcon={<Restore />}
                          size="small"
                          variant="outlined"
                          color="success"
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                          onClick={() => handleRestore(user.id)}
                        >
                          Khôi phục
                        </Button>
                      </Tooltip>
                    ) : (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Sửa">
                          <span>
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(user)}
                              disabled={user.id === currentUserId}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Xoá">
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(user.id)}
                              disabled={user.id === currentUserId}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog thêm/sửa */}
      <UserDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
      />

      {/* Dialog xác nhận */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
      >
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === 'delete'
              ? 'Bạn có chắc chắn muốn xoá người dùng này không?'
              : 'Bạn có chắc chắn muốn khôi phục người dùng này không?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null })}>
            Hủy
          </Button>
          <Button
            onClick={executeConfirm}
            variant="contained"
            color={confirmDialog.action === 'delete' ? 'error' : 'success'}
          >
            {confirmDialog.action === 'delete' ? 'Xoá' : 'Khôi phục'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserPage;
