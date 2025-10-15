import {
  Box, Typography, Button, Stack, CircularProgress, TextField, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  FormControl, InputLabel, MenuItem, Select, TablePagination, Paper, InputAdornment,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  getAllDeviceModels, createDeviceModel, updateDeviceModel,
  deleteDeviceModel, restoreDeviceModel
} from '../services/deviceModelService';
import { getAllDeviceTypes } from '../services/deviceTypeService';
import { DeviceModelDto } from '../types/DeviceModelDto';
import { DeviceTypeDto } from '../types/DeviceTypeDto';
import DeviceModelDialog from '../components/DeviceModel/DeviceModelDialog';
import DeviceModelTable from '../components/DeviceModel/DeviceModelTable';
import { getUserRole } from '../services/auth';
import SearchIcon from '@mui/icons-material/Search';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const DeviceModelPage = () => {
  const [models, setModels] = useState<DeviceModelDto[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<DeviceModelDto | null>(null);

  const [confirm, setConfirm] = useState<{ open: boolean; id: string | null; action: 'delete' | 'restore' | null }>({
    open: false,
    id: null,
    action: null,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isAdmin = getUserRole() === 'Admin';
  

  const fetchData = async () => {
  try {
    setLoading(true);

    // Truyền đúng isDeleted dựa theo statusFilter
    const isDeletedParam =
      statusFilter === 'active' ? false :
      statusFilter === 'deleted' ? true :
      undefined;

    const [modelRes, typeRes] = await Promise.all([
      getAllDeviceModels(isDeletedParam),
      getAllDeviceTypes(),
    ]);

    setModels(modelRes.data);
    setDeviceTypes(typeRes.data);
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu DeviceModel', err);
  } finally {
    setLoading(false);
  }
};

// Gọi lại fetchData mỗi khi statusFilter thay đổi
useEffect(() => {
  fetchData();
}, [statusFilter]);

const handleSubmit = async (data: Partial<DeviceModelDto>) => {
  try {
    if (data.id) {
      await updateDeviceModel(data.id, data as DeviceModelDto);
      setToast({ open: true, message: 'Cập nhật thành công', severity: 'success' });
    } else {
      await createDeviceModel(data as DeviceModelDto);
      setToast({ open: true, message: 'Thêm mới thành công', severity: 'success' });
    }

    fetchData(); // Tự động reload theo statusFilter hiện tại

    // ✅ Sau khi lưu → reset form + đóng dialog
    setSelected(null);
    setOpenDialog(false);
  } catch (err) {
    console.error('Lỗi khi lưu model', err);
    setToast({ open: true, message: 'Lỗi khi lưu model', severity: 'error' });
  }
};

const handleDelete = (id: string) => setConfirm({ open: true, id, action: 'delete' });
const handleRestore = (id: string) => setConfirm({ open: true, id, action: 'restore' });

const confirmAction = async () => {
  if (!confirm.id || !confirm.action) return;

  try {
    if (confirm.action === 'delete') {
      await deleteDeviceModel(confirm.id);
      setToast({ open: true, message: 'Xoá thành công', severity: 'success' });
    } else if (confirm.action === 'restore') {
      await restoreDeviceModel(confirm.id);
      setToast({ open: true, message: 'Khôi phục thành công', severity: 'success' });
    }

    fetchData(); // ✅ gọi lại với trạng thái hiện tại
  } catch {
    setToast({
      open: true,
      message: confirm.action === 'delete' ? 'Lỗi khi xoá' : 'Lỗi khi khôi phục',
      severity: 'error',
    });
  } finally {
    setConfirm({ open: false, id: null, action: null });
  }
};

// Filter chỉ còn search và loại thiết bị
const filtered = models
  .filter((m) => m.modelName.toLowerCase().includes(search.toLowerCase()))
  .filter((m) => {
    if (typeFilter === 'all') return true;
    return m.deviceTypeId === typeFilter;
  });

const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Quản lý Model thiết bị</Typography>
        {isAdmin && (
         <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelected(null);      // ✅ Quan trọng
            setOpenDialog(true);    // Mở dialog trắng
          }}
        >
          Thêm model
        </Button>
        )}
      </Stack>

      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <TextField
          placeholder="Tìm kiếm model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Loại thiết bị</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Loại thiết bị"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            {deviceTypes.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.typeName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            label="Trạng thái"
          >
            <MenuItem value="all">
              <AllInboxIcon fontSize="small" style={{ marginRight: 8, color: 'gray' }} />
              Tất cả
            </MenuItem>
            <MenuItem value="active">
              <CheckCircleIcon fontSize="small" style={{ marginRight: 8, color: 'green' }} />
              Đang hoạt động
            </MenuItem>
            <MenuItem value="deleted">
              <DeleteIcon fontSize="small" style={{ marginRight: 8, color: 'orange' }} />
              Đã xoá
            </MenuItem>
          </Select>
        </FormControl>
      </Paper>


      {loading ? (
        <CircularProgress />
      ) : (
        <>
         <DeviceModelTable
            data={paginated}
            isAdmin={isAdmin} // ✅ truyền đúng prop mới
            onEdit={(m) => {
              setSelected(m);
              setOpenDialog(true);
            }}
            onDelete={handleDelete}
            onRestore={handleRestore}
            deviceTypes={deviceTypes}
            statusFilter={statusFilter} 
          />

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}

      {/* Dialog thêm/sửa */}
      <DeviceModelDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelected(null); // ✅ rất quan trọng
        }}
        onSubmit={handleSubmit}
        initialData={selected}
        deviceTypes={deviceTypes}
      />

      {/* Dialog xác nhận xoá/khôi phục */}
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, action: null })}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm.action === 'delete'
              ? 'Bạn có chắc muốn xoá model này?'
              : 'Bạn có chắc muốn khôi phục model này?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, id: null, action: null })}>Huỷ</Button>
          <Button onClick={confirmAction} variant="contained" color={confirm.action === 'delete' ? 'error' : 'primary'}>
            {confirm.action === 'delete' ? 'Xoá' : 'Khôi phục'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeviceModelPage;
