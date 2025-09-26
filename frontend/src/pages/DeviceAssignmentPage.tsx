import {
  Box,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { DeviceAssignmentDto, DeviceAssignmentFilters } from '../types/deviceAssignment';
import {
  createAssignment,
  getAllAssignments,
  getUnassignedDevices,
  getInUseDevices,
  revokeAssignment,
  transferAssignment,
} from '../services/deviceAssignmentService';
import DeviceAssignmentTable from '../components/deviceAssignment/DeviceAssignmentTable';
import UnassignedDeviceTable from '../components/deviceAssignment/UnassignedDeviceTable';
import AssignmentDialog from '../components/deviceAssignment/AssignmentDialog';
import TransferDialog from '../components/deviceAssignment/TransferDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import  useNotification  from '../hooks/useNotification';

const DeviceAssignmentPage = () => {
  const [tab, setTab] = useState(0);
  const [assignments, setAssignments] = useState<DeviceAssignmentDto[]>([]);
  const [unassigned, setUnassigned] = useState<DeviceAssignmentDto[]>([]);
  const [inUse, setInUse] = useState<DeviceAssignmentDto[]>([]);
  const [selected, setSelected] = useState<DeviceAssignmentDto | null>(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<DeviceAssignmentFilters>({});

  const { showSuccess, showError } = useNotification();
  

  const fetchData = async (searchFilters?: DeviceAssignmentFilters) => {
    try {
      const [a, u, i] = await Promise.all([
        getAllAssignments(),
        getUnassignedDevices(searchFilters),
        getInUseDevices(),
      ]);
      setAssignments(a);
      setUnassigned(u);
      setInUse(i);
    } catch (error) {
      showError('Không thể tải dữ liệu');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (device: DeviceAssignmentDto) => {
    setSelected(device);
    setOpenAssignDialog(true);
  };

  const handleTransfer = (record: DeviceAssignmentDto) => {
    setSelected(record);
    setOpenTransferDialog(true);
  };

  const handleRevoke = (record: DeviceAssignmentDto) => {
    setSelected(record);
    setOpenConfirm(true);
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: DeviceAssignmentFilters) => {
    setFilters(newFilters);
  };
  
  const handleSearch = () => {
    fetchData(filters);
  };
  
  const handleClearFilters = () => {
    setFilters({});
    fetchData({});
  };

  const handleAssignSubmit = async (data: any) => {
    try {
      await createAssignment(data);
      showSuccess('Cấp phát thiết bị thành công');
      fetchData(filters); // Maintain current filters
      setOpenAssignDialog(false);
    } catch (error) {
      showError('Cấp phát thiết bị thất bại');
    }
  };

  const handleTransferSubmit = async (data: any) => {
    try {
      await transferAssignment(data);
      showSuccess('Chuyển giao thiết bị thành công');
      fetchData(filters); // Maintain current filters
      setOpenTransferDialog(false);
    } catch (error) {
      showError('Chuyển giao thiết bị thất bại');
    }
  };

  const confirmRevoke = async () => {
    if (!selected) return;
    try {
      await revokeAssignment(selected.id);
      showSuccess('Thu hồi thiết bị thành công');
      fetchData(filters); // Maintain current filters
    } catch {
      showError('Thu hồi thất bại');
    } finally {
      setOpenConfirm(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Cấp phát thiết bị
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Chưa cấp phát" />
          <Tab label="Đang sử dụng" />
        </Tabs>

        <Box mt={2}>
          {tab === 0 && (
            <UnassignedDeviceTable
              devices={unassigned}
              onAssign={handleAssign}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
            />
          )}

          {tab === 1 && (
            <DeviceAssignmentTable
              assignments={inUse}
              onTransfer={handleTransfer}
              onRevoke={handleRevoke}
            />
          )}
        </Box>

        {/* Dialogs */}
        <AssignmentDialog
          open={openAssignDialog}
          onClose={() => setOpenAssignDialog(false)}
          device={selected}
          onSubmit={handleAssignSubmit}
        />

        <TransferDialog
          open={openTransferDialog}
          onClose={() => setOpenTransferDialog(false)}
          assignment={selected}
          onSubmit={handleTransferSubmit}
        />

        <ConfirmDialog
          open={openConfirm}
          title="Thu hồi thiết bị"
          content="Bạn có chắc muốn thu hồi thiết bị này?"
          onClose={() => setOpenConfirm(false)}
          onConfirm={confirmRevoke}
        />
      </CardContent>
    </Card>
  );
};

export default DeviceAssignmentPage;
