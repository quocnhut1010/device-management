// src/pages/devicetypes/DeviceTypePage.tsx

import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import {
  getAllDeviceTypes,
  createDeviceType,
  updateDeviceType,
  deleteDeviceType,
} from '../services/deviceTypeService';
import DeviceTypeDialog from '../components/devicetypes/DeviceTypeDialog';
import DeviceTypeTable from '../components/devicetypes/DeviceTypeTable';
import { DeviceTypeDto } from '../types/DeviceTypeDto';
import { toast } from 'react-toastify';


const DeviceTypePage = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeDto[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<DeviceTypeDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchDeviceTypes = async () => {
    setFetching(true);
    try {
      const res = await getAllDeviceTypes();
      setDeviceTypes(res.data);
    } catch (err) {
      toast.error('Không thể tải danh sách loại thiết bị!');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const handleAdd = () => {
    setSelected(null);
    setOpenDialog(true);
  };

  const handleEdit = (data: DeviceTypeDto) => {
    setSelected(data);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
  const confirm = window.confirm('Bạn có chắc muốn xoá loại thiết bị này?');
  if (!confirm) return;

  try {
    await deleteDeviceType(id);
    toast.success('Đã xoá loại thiết bị!');
    fetchDeviceTypes();
  } catch (err: any) {
    if (err?.response?.data?.message?.includes('Không thể xoá loại thiết bị')) {
      // ❗ Lỗi nghiệp vụ từ backend → cảnh báo
      toast.warning(err.response.data.message);
    } else {
      toast.error('❌ Xoá thất bại. Vui lòng thử lại!');
    }
  }
};


  const handleSubmit = async (data: Partial<DeviceTypeDto>) => {
    try {
      setLoading(true);
      if (data.id) {
        // Đảm bảo data là DeviceTypeDto đầy đủ khi update
        const completeData = data as DeviceTypeDto;
        await updateDeviceType(completeData.id, completeData);
        toast.success('Cập nhật loại thiết bị thành công!');
      } else {
        // Đảm bảo data là DeviceTypeDto đầy đủ khi create
        const completeData = data as DeviceTypeDto;
        await createDeviceType(completeData);
        toast.success('Thêm loại thiết bị mới thành công!');
      }
      fetchDeviceTypes();
      setOpenDialog(false);
    } catch (err) {
      toast.error('Thao tác thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container sx={{ mt: 4 }}>
      {/* Tiêu đề + nút thêm */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Quản lý loại thiết bị
        </Typography>
        <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        >
        Thêm loại thiết bị
        </Button>
      </Box>

      {/* Nội dung chính */}
      {fetching ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : deviceTypes.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          Chưa có loại thiết bị nào được thêm.
        </Typography>
      ) : (
        <DeviceTypeTable
          data={deviceTypes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog thêm/sửa */}
      <DeviceTypeDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        initialData={selected}
        isLoading={loading}
      />
    </Container>
  );
};

export default DeviceTypePage;
