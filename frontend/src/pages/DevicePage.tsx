import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import  useNotification  from '../hooks/useNotification';


import { CreateDeviceDto, DeviceDto } from '../types/device';
import {
  createDeviceWithImage,
  updateDeviceWithImage,
  getDeviceById,
  getPagedDevices,
  getDeletedDevices,
  deleteDevice,
  restoreDevice,
  getMyDevices,
  getManagedDevices,
} from '../services/deviceService';
import DeviceTable from '../components/device/DeviceTable';
import DeviceDialog from '../components/device/DeviceDialog';
import useUserRole from '../services/useUserRole';
import QuickExportButton from '../components/reports/QuickExportButton';

const DevicePage = () => {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [viewDeleted, setViewDeleted] = useState(false);
  const [qrDevice, setQrDevice] = useState<DeviceDto | null>(null); // Thiết bị để hiện QR
  const [qrToken, setQrToken] = useState<string>('');
  const [currentTab, setCurrentTab] = useState(0); // Tab hiện tại cho Trưởng phòng

  const { showSuccess, showError } = useNotification();
  const { user, role } = useUserRole();
  const isAdmin = role === 'Admin';
  const position = user?.position;

  const fetchDevices = async () => {
    try {
      if (isAdmin) {
        // Admin: xem tất cả thiết bị (có phân trang và deleted)
        if (viewDeleted) {
          const deletedDevices = await getDeletedDevices();
          setDevices(deletedDevices);
          setTotalCount(deletedDevices.length);
        } else {
          const { items, totalCount } = await getPagedDevices({ page, pageSize });
          setDevices(items);
          setTotalCount(totalCount);
        }
      } else {
        // User: chỉ xem thiết bị của mình
        let userDevices: DeviceDto[] = [];
        
        if (position === 'Trưởng phòng') {
          if (currentTab === 0) {
            console.log('Trưởng phòng - Tab 0: Lấy thiết bị của tôi');
            userDevices = await getMyDevices();
          } else {
            console.log('Trưởng phòng - Tab 1: Lấy thiết bị phòng ban');
            userDevices = await getManagedDevices();
          }
        } else {
          console.log('Nhân viên - Lấy thiết bị của tôi');
          userDevices = await getMyDevices();
        }
        
        setDevices(userDevices);
        setTotalCount(userDevices.length);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách thiết bị:', error);
      if (error?.response?.status === 403) {
        showError('Bạn không có quyền xem danh sách thiết bị này.');
      } else {
        showError('Lỗi khi tải danh sách thiết bị.');
      }
    }
  };

  useEffect(() => {
    fetchDevices();
  }, isAdmin ? [page, pageSize, viewDeleted] : [viewDeleted, role, position, currentTab]);

  const handleAdd = () => {
    setSelectedDevice(null);
    setOpenDialog(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const data = await getDeviceById(id);
      setSelectedDevice(data);
      setOpenDialog(true);
    } catch (err) {
      showError('Không tìm thấy thiết bị.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const device = await getDeviceById(id);
      const forbiddenStatuses = ['Đang sử dụng', 'Đã hỏng', 'Đang bảo trì'];
      if (forbiddenStatuses.includes(device.status)) {
        showError(`Không thể xoá thiết bị đang ở trạng thái "${device.status}"`);
        return;
      }

      if (confirm('Bạn có chắc chắn muốn xoá thiết bị này không?')) {
        await deleteDevice(id);
        showSuccess('Đã xoá thiết bị.');
        fetchDevices();
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        showError(err.response.data.message);
      } else {
        showError('Lỗi khi xoá thiết bị.');
      }
    }
  };

  const handleRestore = async (id: string) => {
    if (confirm('Khôi phục thiết bị này?')) {
      try {
        await restoreDevice(id);
        showSuccess('Khôi phục thiết bị thành công.');
        fetchDevices();
      } catch (err) {
        showError('Khôi phục thiết bị thất bại.');
      }
    }
  };

  const handleSubmit = async (data: CreateDeviceDto & { file?: File | null }) => {
  try {
    if (selectedDevice) {
      await updateDeviceWithImage(selectedDevice.id, data);
      showSuccess('Cập nhật thiết bị thành công');
    } else {
      const result = await createDeviceWithImage(data);
      showSuccess(result?.message || 'Thêm thiết bị thành công');

      // Nếu backend trả về thiết bị, hiển thị QR
      if (result.device) {
        setQrDevice(result.device);
        // Lấy QR token để hiển thị ngay
        try {
          const { getDeviceQrToken } = await import('../services/deviceService');
          const token = await getDeviceQrToken(result.device.id);
          setQrToken(token);
        } catch {}
      }
    }

    setOpenDialog(false);
    fetchDevices(); // reload bảng
  } catch (err: any) {
    console.error('Lỗi khi lưu thiết bị:', err);
    showError(err?.response?.data?.message || 'Thao tác thất bại');
  }
};

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          {isAdmin 
            ? 'Quản lý thiết bị' 
            : position === 'Trưởng phòng' 
              ? (currentTab === 0 ? 'Thiết bị của tôi' : 'Thiết bị phòng ban')
              : 'Thiết bị của tôi'
          }
        </Typography>
        <Box display="flex" gap={1}>
          <QuickExportButton 
            reportType="Devices" 
            variant="iconButton"
            onSuccess={fetchDevices}
          />
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Thêm thiết bị
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs cho Trưởng phòng */}
      {position === 'Trưởng phòng' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => setCurrentTab(newValue)}
            aria-label="device tabs"
          >
            <Tab label="Thiết bị của tôi" />
            <Tab label="Thiết bị phòng ban" />
          </Tabs>
        </Box>
      )}

      {isAdmin && (
        <ToggleButtonGroup
          value={viewDeleted ? 'deleted' : 'active'}
          exclusive
          onChange={(_, value) => {
            if (value === 'active') setViewDeleted(false);
            else if (value === 'deleted') setViewDeleted(true);
          }}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="active">Tất cả thiết bị</ToggleButton>
          <ToggleButton value="deleted">Đã xoá</ToggleButton>
        </ToggleButtonGroup>
      )}

      <DeviceTable
        rows={devices}
        onEdit={isAdmin ? handleEdit : () => {}} // User không thể edit
        onDelete={isAdmin ? handleDelete : () => {}} // User không thể delete  
        onRestore={isAdmin ? handleRestore : () => {}} // User không thể restore
        isAdmin={isAdmin}
        isDeletedView={viewDeleted}
        pagination={isAdmin ? {
          page,
          pageSize,
          rowCount: totalCount,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        } : {
          page: 0,
          pageSize: devices.length || 10,
          rowCount: devices.length,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
      />

      <DeviceDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        initialData={selectedDevice || undefined}
      />

      {/* Dialog QR Code sau khi tạo thành công */}
      <Dialog open={!!qrDevice} onClose={() => setQrDevice(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Mã QR thiết bị
          <IconButton
            aria-label="close"
            onClick={() => setQrDevice(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrDevice && qrToken && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                {qrDevice.deviceName}
              </Typography>
              <QRCodeSVG
                value={qrToken}
                size={256}
                level="H"
                includeMargin
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DevicePage;
