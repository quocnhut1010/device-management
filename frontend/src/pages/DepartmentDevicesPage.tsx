import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

import { DeviceDto } from '../types/device';
import { getManagedDevices } from '../services/deviceService';
import DeviceTable from '../components/device/DeviceTable';
import useNotification from '../hooks/useNotification';
import useUserRole from '../services/useUserRole';

const DepartmentDevicesPage = () => {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [loading, setLoading] = useState(true);

  const { showError } = useNotification();
  const { user, role } = useUserRole();

  const fetchManagedDevices = async () => {
    try {
      setLoading(true);
      const managedDevices = await getManagedDevices();
      setDevices(managedDevices);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách thiết bị phòng ban:', error);
      if (error.response?.status === 403) {
        showError('Bạn không có quyền xem thiết bị của phòng ban này.');
      } else {
        showError('Lỗi khi tải danh sách thiết bị phòng ban.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ Trưởng phòng mới được truy cập trang này
    if (user?.position !== 'Trưởng phòng') {
      showError('Chỉ Trưởng phòng mới có quyền truy cập trang này.');
      return;
    }
    
    fetchManagedDevices();
  }, [user]);

  // Không hiển thị gì nếu không phải Trưởng phòng
  if (user?.position !== 'Trưởng phòng') {
    return (
      <Box p={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="error">
              Bạn không có quyền truy cập trang này.
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              Trang này chỉ dành cho Trưởng phòng.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Thiết bị của phòng ban
        </Typography>
      </Box>

      <Typography variant="body2" color="textSecondary" mb={2}>
        Danh sách thiết bị được phân phát cho nhân viên trong phòng ban bạn quản lý.
      </Typography>

      {devices.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" textAlign="center">
              Chưa có thiết bị nào được phân phát trong phòng ban của bạn.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <DeviceTable
          rows={devices}
          onEdit={() => {}} // Trưởng phòng không được phép edit thiết bị
          onDelete={() => {}} // Trưởng phòng không được phép delete thiết bị
          onRestore={() => {}} // Trưởng phòng không được phép restore thiết bị
          isAdmin={false} // Trưởng phòng không phải admin, chỉ có quyền xem
          isDeletedView={false}
          pagination={{
            page: 0,
            pageSize: devices.length, // Hiển thị tất cả thiết bị
            rowCount: devices.length,
            onPageChange: () => {},
            onPageSizeChange: () => {},
          }}
        />
      )}
    </Box>
  );
};

export default DepartmentDevicesPage;
