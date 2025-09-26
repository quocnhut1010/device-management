import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DeviceAssignmentDto, DeviceAssignmentFilters } from '../../types/deviceAssignment';
import DeviceAssignmentFiltersComponent from './DeviceAssignmentFilters';

interface Props {
  devices: DeviceAssignmentDto[]; // Nhận data từ parent
  onAssign: (device: DeviceAssignmentDto) => void; // Change to DeviceAssignmentDto
  filters: DeviceAssignmentFilters;
  onFiltersChange: (filters: DeviceAssignmentFilters) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

const UnassignedDeviceTable: React.FC<Props> = ({ 
  devices, 
  onAssign, 
  filters, 
  onFiltersChange, 
  onSearch, 
  onClearFilters 
}) => {
  // Không cần fetch data nữa vì đã nhận từ parent

  const columns: GridColDef[] = [
    { field: 'deviceCode', headerName: 'Mã thiết bị', flex: 1 },
    { field: 'deviceName', headerName: 'Tên thiết bị', flex: 1.5 },
    { field: 'modelName', headerName: 'Model', flex: 1 }, // Change to modelName
    { field: 'status', headerName: 'Trạng thái', flex: 1 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Cấp phát thiết bị">
          <IconButton onClick={() => onAssign(params.row as DeviceAssignmentDto)}>
            <AssignmentIcon color="primary" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      {/* Filter Component */}
      <DeviceAssignmentFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        onSearch={onSearch}
        onClear={onClearFilters}
      />
      
      {/* Device Table */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Thiết bị chưa cấp phát</Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng cộng: <strong>{devices.length}</strong> thiết bị
          </Typography>
        </Stack>
        <Box height={500}>
          <DataGrid
            rows={devices}
            columns={columns}
            getRowId={(row) => row.id || row.deviceId} // Handle both id and deviceId
            loading={false} // No loading since data comes from parent
            disableRowSelectionOnClick
            localeText={{ noRowsLabel: 'Không có thiết bị nào' }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default UnassignedDeviceTable;
