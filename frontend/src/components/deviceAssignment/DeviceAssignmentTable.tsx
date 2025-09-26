import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import UndoIcon from '@mui/icons-material/Undo';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DeviceAssignmentDto } from '../../types/deviceAssignment';
import { formatDateVN } from '../../utils/dateUtils';

interface Props {
  assignments: DeviceAssignmentDto[];
  onTransfer: (assignment: DeviceAssignmentDto) => void;
  onRevoke: (assignment: DeviceAssignmentDto) => void;
}


const DeviceAssignmentTable: React.FC<Props> = ({ assignments, onTransfer, onRevoke }) => {

  const columns: GridColDef[] = [
    { field: 'deviceName', headerName: 'Thiết bị', flex: 1.5 },
    { field: 'assignedToUserName', headerName: 'Người dùng', flex: 1 },
    { field: 'assignedToDepartmentName', headerName: 'Phòng ban', flex: 1 },
    {
      field: 'assignedDate',
      headerName: 'Ngày cấp phát',
      flex: 1.2,
      renderCell: (params) => {
        const assignedDate = new Date(params.value);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - assignedDate.getTime()) / (1000 * 60));

        if (diffMinutes <= 3) {
          return (
            <Typography variant="body2" color="info.main">
              Vừa chuyển giao
            </Typography>
          );
        }

        return (
          <Typography variant="body2">
            {formatDateVN(params.value, false)}
          </Typography>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      flex: 0.6,
      sortable: false,
      renderCell: (params) => {
        const assignment = params.row as DeviceAssignmentDto;
        return (
          <>
            <Tooltip title="Chuyển giao thiết bị">
              <IconButton onClick={() => onTransfer(assignment)}>
                <SwapHorizIcon color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Thu hồi thiết bị">
              <IconButton onClick={() => onRevoke(assignment)}>
                <UndoIcon color="error" />
              </IconButton>
            </Tooltip>
          </>
        );
      },
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Thiết bị đang cấp phát</Typography>
      </Stack>
      <Box height={500}>
        <DataGrid
          rows={assignments}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: 'Không có thiết bị nào đang được cấp phát' }}
        />
      </Box>
    </Paper>
  );
};

export default DeviceAssignmentTable;
