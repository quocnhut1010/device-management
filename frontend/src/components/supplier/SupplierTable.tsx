import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { SupplierDto } from '../../types/SupplierDto';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Props {
  data: SupplierDto[];
  onEdit: (item: SupplierDto) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  isAdmin: boolean;
}

const SupplierTable = ({ data, onEdit, onDelete, onRestore, isAdmin }: Props) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Tên nhà cung cấp</TableCell>
          <TableCell>Trạng thái</TableCell>
          <TableCell>Liên hệ</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Điện thoại</TableCell>
          <TableCell>Số thiết bị</TableCell>
          <TableCell>Cập nhật</TableCell>
          {isAdmin && <TableCell align="center">Hành động</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id} hover>
            {/* Tên */}
            <TableCell>{row.supplierName}</TableCell>

            {/* Trạng thái */}
            <TableCell>
              {row.isDeleted ? (
                <Chip size="small" color="warning" label="Đã xoá" />
              ) : (
                <Chip size="small" color="success" label="Đang hoạt động" />
              )}
            </TableCell>

            {/* Liên hệ */}
            <TableCell>{row.contactPerson || '-'}</TableCell>

            {/* Email */}
            <TableCell>{row.email || '-'}</TableCell>

            {/* Điện thoại */}
            <TableCell>{row.phone || '-'}</TableCell>

            {/* Số thiết bị */}
            <TableCell>{row.deviceCount ?? 0}</TableCell>

            {/* Cập nhật */}
            <TableCell>
              {row.updatedAt ? format(new Date(new Date(row.updatedAt).getTime() +  7 * 60 * 60 * 1000), 'dd/MM/yyyy HH:mm',{locale:vi}) : '—'}
            </TableCell>

            {/* Hành động */}
            {isAdmin && (
              <TableCell align="center">
                {row.isDeleted ? (
                  <Tooltip title="Khôi phục">
                    <IconButton onClick={() => onRestore(row.id)}>
                      <RestoreIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton onClick={() => onEdit(row)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xoá">
                      <IconButton onClick={() => onDelete(row.id)}>
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
  );
};

export default SupplierTable;
