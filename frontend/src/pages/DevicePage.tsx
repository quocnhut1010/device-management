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

import { DeviceDto } from '../types/device';
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
import useNotification from '../hooks/useNotification';
import useUserRole from '../services/useUserRole';

const DevicePage = () => {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [viewDeleted, setViewDeleted] = useState(false);
  const [qrDevice, setQrDevice] = useState<DeviceDto | null>(null); // Thiết bị để hiện QR
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

  const handleSubmit = async (device: any) => {
    try {
      const formData = new FormData();
      formData.append('deviceName', device.deviceName || '');
      if (device.modelId) formData.append('modelId', device.modelId);
      if (device.supplierId) formData.append('supplierId', device.supplierId);
      if (device.purchasePrice) formData.append('purchasePrice', device.purchasePrice.toString());
      if (device.serialNumber) formData.append('serialNumber', device.serialNumber);
      if (device.status) formData.append('status', device.status);
      if (device.purchaseDate) formData.append('purchaseDate', device.purchaseDate);
      if (device.warrantyExpiry) formData.append('warrantyExpiry', device.warrantyExpiry);
      if (device.currentDepartmentId) formData.append('currentDepartmentId', device.currentDepartmentId);
      if (device.currentUserId) formData.append('currentUserId', device.currentUserId);
      if (device.barcode) formData.append('barcode', device.barcode);
      if (device.warrantyProvider) formData.append('warrantyProvider', device.warrantyProvider);
      if (device.file) formData.append('file', device.file);

      if (selectedDevice) {
        await updateDeviceWithImage(selectedDevice.id, formData);
        showSuccess('Cập nhật thành công.');
      } else {
        const result = await createDeviceWithImage(formData);
        showSuccess(result.message || 'Tạo thiết bị thành công.');

        // Sử dụng device data từ response luôn
        if (result.device) {
          setQrDevice(result.device);
        }
      }

      fetchDevices();
      setOpenDialog(false);
    } catch (err) {
      console.error('Lỗi khi lưu thiết bị:', err);
      showError('Lỗi khi lưu thiết bị.');
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
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Thêm thiết bị
          </Button>
        )}
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
          {qrDevice && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                {qrDevice.deviceName}
              </Typography>
              <QRCodeSVG
                value={JSON.stringify({
                  id: qrDevice.id,
                  barcode: qrDevice.barcode,
                  deviceName: qrDevice.deviceName,
                  status: qrDevice.status,
                  modelName: qrDevice.modelName || '',
                })}
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
