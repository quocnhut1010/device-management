import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Box,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import DevicesIcon from '@mui/icons-material/Devices';
import { DeviceModelDto } from '../../types/DeviceModelDto';
import { DeviceTypeDto } from '../../types/DeviceTypeDto';

interface Props {
  data: DeviceModelDto[];
  onEdit: (model: DeviceModelDto) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  isAdmin: boolean;
  deviceTypes: DeviceTypeDto[];
  statusFilter: 'all' | 'active' | 'deleted';
}

const DeviceModelTable = ({
  data,
  onEdit,
  onDelete,
  onRestore,
  isAdmin,
  statusFilter,
}: Props) => {
  const renderRow = (row: DeviceModelDto) => (
    <TableRow key={row.id} hover>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <DevicesIcon color="primary" />
          {row.modelName}
        </Box>
      </TableCell>
      <TableCell>{row.typeName || '-'}</TableCell>
      <TableCell>{row.manufacturer || '-'}</TableCell>
      <TableCell>
        {row.specifications && row.specifications.length > 50 ? (
          <Tooltip title={row.specifications}>
            <span>{row.specifications.slice(0, 50)}...</span>
          </Tooltip>
        ) : (
          row.specifications || '-'
        )}
      </TableCell>
      <TableCell>
        {row.isDeleted ? (
          <Chip label="Đã xoá" color="error" size="small" />
        ) : (
          <Chip label="Đang sử dụng" color="success" size="small" />
        )}
      </TableCell>
      <TableCell align="center">
        {row.isDeleted ? (
          <Tooltip title="Khôi phục">
            <IconButton onClick={() => onRestore(row.id)}>
              <RestoreIcon color="success" />
            </IconButton>
          </Tooltip>
        ) : (
          isAdmin && (
            <>
              <Tooltip title="Chỉnh sửa">
                <IconButton onClick={() => onEdit(row)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xoá">
                <IconButton onClick={() => onDelete(row.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Tooltip>
            </>
          )
        )}
      </TableCell>
    </TableRow>
  );

  const activeModels = data.filter((m) => !m.isDeleted);
  const deletedModels = data.filter((m) => m.isDeleted);

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, p: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Danh sách model thiết bị
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tên model</TableCell>
            <TableCell>Loại thiết bị</TableCell>
            <TableCell>Hãng</TableCell>
            <TableCell>Thông số kỹ thuật</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {statusFilter === 'all' ? (
            <>
              {/* {activeModels.length > 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      ➤ Model đang sử dụng
                    </Typography>
                  </TableCell>
                </TableRow>
              )} */}
              {activeModels.map(renderRow)}

              {deletedModels.length > 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      ➤ Model đã xoá
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {deletedModels.map(renderRow)}
            </>
          ) : (
            data.map(renderRow)
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default DeviceModelTable;