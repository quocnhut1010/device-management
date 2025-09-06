// src/components/devicetypes/DeviceTypeTable.tsx
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
} from '@mui/material';
import MonitorIcon from '@mui/icons-material/Monitor';
import DevicesIcon from '@mui/icons-material/Devices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeviceTypeDto } from '../../types/DeviceTypeDto';

interface Props {
  data: DeviceTypeDto[];
  onEdit: (row: DeviceTypeDto) => void;
  onDelete: (id: string) => void;
}

const DeviceTypeTable = ({ data, onEdit, onDelete }: Props) => {
  return (
    <Paper elevation={3} sx={{ borderRadius: 2, p: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Danh sách loại thiết bị
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Loại thiết bị</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <DevicesIcon color="primary" />
                  <Typography fontWeight={500}>{row.typeName}</Typography>
                </Box>
              </TableCell>

              <TableCell>
                {row.description ? (
                  <Typography color="text.secondary">{row.description}</Typography>
                ) : (
                  <Chip label="Chưa có mô tả" size="small" variant="outlined" />
                )}
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Chỉnh sửa">
                  <IconButton onClick={() => onEdit(row)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xoá">
                  <IconButton onClick={() => row.id && onDelete(row.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default DeviceTypeTable;
