import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type DepartmentDto, deleteDepartment, restoreDepartment } from '../../services/departmentService';
import { useUserRole } from '../../services/useUserRole'; // 👈 Import đúng từ services
import { useNotification } from '../../hooks/useNotification';


interface Props {
  data: DepartmentDto[];
  refresh: () => void;
  onEdit: (data: DepartmentDto) => void;
}


const DepartmentTable = ({ data, refresh, onEdit }: Props) => {
  const role = useUserRole(); // 👈 Lấy role hiện tại từ token
    const { notify } = useNotification();
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá phòng ban này?')) {
      await deleteDepartment(id);
      notify('Đã xoá phòng ban', 'info');
      refresh();
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
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tên phòng ban</TableCell>
            <TableCell>Mã phòng ban</TableCell>
            <TableCell>Vị trí</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((dept) => (
            <TableRow key={dept.id} style={{ opacity: dept.isDeleted ? 0.5 : 1 }}>
              <TableCell>{dept.departmentName}</TableCell>
              <TableCell>{dept.departmentCode}</TableCell>
              <TableCell>{dept.location}</TableCell>
              <TableCell align="right">
                {dept.isDeleted ? (
                  role === 'Admin' && (
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => handleRestore(dept.id)}
                    >
                      Khôi phục
                    </Button>
                  )
                ) : (
                  role === 'Admin' && (
                    <>
                      <IconButton onClick={() => onEdit(dept)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(dept.id)}><DeleteIcon /></IconButton>
                    </>
                  )
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DepartmentTable;
