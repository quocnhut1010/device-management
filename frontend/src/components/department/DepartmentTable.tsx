import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { DepartmentDto } from '../../types/DepartmentDto';
import { deleteDepartment, restoreDepartment } from '../../services/departmentService';
import  useNotification  from '../../hooks/useNotification';
import useUserRole from '../../services/useUserRole';
import axios from 'axios';

interface Props {
  data: DepartmentDto[];
  refresh: () => void;
  onEdit: (data: DepartmentDto) => void;
  role: string;
  position: string;
}

const DepartmentTable = ({ data, refresh, onEdit, position }: Props) => {
  const { notify } = useNotification();
  const { user, role } = useUserRole();

  const isAdmin = role === 'Admin';
  const isManager = role === 'User' && position === 'Trưởng phòng';
  const showUserCount = isAdmin || isManager;

const handleDelete = async (id: string) => {
  if (!confirm('Bạn có chắc muốn xoá phòng ban này?')) return;

  try {
    await deleteDepartment(id);
    notify('✅ Đã xoá phòng ban', 'success');
    refresh();
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || 'Không thể xoá phòng ban đang chứa thiết bị hoặc nhân viên';

      // ✅ Nếu là lỗi nghiệp vụ → cảnh báo
      if (message.includes('Không thể xoá')) {
        notify(message, 'warning');
      } else {
        notify(message, 'error');
      }
    } else {
      notify('Lỗi không xác định khi xoá phòng ban', 'error');
    }
  }
};


  const handleRestore = async (id: string) => {
    if (confirm('Bạn có chắc muốn khôi phục phòng ban này?')) {
      await restoreDepartment(id);
      notify('Đã khôi phục phòng ban', 'success');
      refresh();
    }
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            <TableCell>Tên phòng ban</TableCell>
            <TableCell>Mã</TableCell>
            <TableCell>Vị trí</TableCell>
           {(role === 'Admin' || user?.position === 'Trưởng phòng') &&  <TableCell align="center">Số nhân viên</TableCell>}
            <TableCell align="center">Số thiết bị</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
            {isAdmin && <TableCell align="right">Thao tác</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((dept, index) => (
            <TableRow
              key={dept.id}
              sx={{
                bgcolor: index % 2 === 0 ? 'white' : '#fafafa',
                opacity: dept.isDeleted ? 0.6 : 1,
              }}
            >
              <TableCell>{dept.departmentName}</TableCell>
              <TableCell>{dept.departmentCode}</TableCell>
              <TableCell>{dept.location}</TableCell>

              {(role === 'Admin' || user?.position === 'Trưởng phòng') && (
                <TableCell align="center">
                  <Chip label={dept.userCount} color="primary" size="small" />
                </TableCell>
              )}

              <TableCell align="center">
                <Chip
                  label={dept.deviceCount}
                  color={dept.deviceCount > 0 ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>

              <TableCell align="center">
                {dept.isDeleted ? (
                  <Chip label="Đã xoá" color="error" size="small" />
                ) : (
                  <Chip label="Hoạt động" color="success" size="small" />
                )}
              </TableCell>

              {isAdmin && (
                <TableCell align="right">
                  {dept.isDeleted ? (
                    <Tooltip title="Khôi phục">
                      <IconButton onClick={() => handleRestore(dept.id)} color="success">
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={() => onEdit(dept)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xoá">
                        <IconButton onClick={() => handleDelete(dept.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DepartmentTable;
