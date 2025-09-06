import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TablePagination,
  Paper,
  InputAdornment,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
} from '../services/supplierService';
import { SupplierDto } from '../types/SupplierDto';
import SupplierTable from '../components/supplier/SupplierTable';
import SupplierDialog from '../components/supplier/SupplierDialog';
import { getUserRole } from '../services/auth';
import SearchIcon from '@mui/icons-material/Search';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<SupplierDto | null>(null);

  // confirm dialog
  const [confirm, setConfirm] = useState<{ open: boolean; id: string | null; action: 'delete' | 'restore' | null }>({
    open: false,
    id: null,
    action: null,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all');

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isAdmin = getUserRole() === 'Admin';

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getAllSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      console.error('Lỗi khi tải nhà cung cấp', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<SupplierDto>) => {
    try {
      if (data.id) {
        await updateSupplier(data.id, data as SupplierDto);
        setToast({ open: true, message: 'Cập nhật thành công', severity: 'success' });
      } else {
        await createSupplier(data as SupplierDto);
        setToast({ open: true, message: 'Thêm mới thành công', severity: 'success' });
      }
      fetchSuppliers();
    } catch (err) {
      console.error('Lỗi khi lưu nhà cung cấp', err);
      setToast({ open: true, message: 'Lỗi khi lưu nhà cung cấp', severity: 'error' });
    }
  };

  const handleDelete = (id: string) => {
    setConfirm({ open: true, id, action: 'delete' });
  };

  const handleRestore = (id: string) => {
    setConfirm({ open: true, id, action: 'restore' });
  };

  const confirmAction = async () => {
    if (!confirm.id || !confirm.action) return;

    try {
      if (confirm.action === 'delete') {
        await deleteSupplier(confirm.id);
        setToast({ open: true, message: 'Xoá thành công', severity: 'success' });
      } else if (confirm.action === 'restore') {
        await restoreSupplier(confirm.id);
        setToast({ open: true, message: 'Khôi phục thành công', severity: 'success' });
      }
      fetchSuppliers();
    } catch {
      setToast({
        open: true,
        message: confirm.action === 'delete' ? 'Lỗi khi xoá nhà cung cấp' : 'Lỗi khi khôi phục nhà cung cấp',
        severity: 'error',
      });
    } finally {
      setConfirm({ open: false, id: null, action: null });
    }
  };

  const filtered = suppliers
    .filter((s) => s.supplierName.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      if (statusFilter === 'active') return !s.isDeleted;
      if (statusFilter === 'deleted') return s.isDeleted;
      return true;
    });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Quản lý nhà cung cấp</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelected(null);
              setOpenDialog(true);
            }}
          >
            Thêm nhà cung cấp
          </Button>
        )}
      </Stack>

        <Paper
        elevation={1}
        sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            borderRadius: 2,
        }}
        >
        {/* Ô tìm kiếm */}
        <TextField
            placeholder="Tìm kiếm nhà cung cấp..."
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                <SearchIcon color="action" />
                </InputAdornment>
            ),
            }}
        />

        {/* Dropdown trạng thái */}
        <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'deleted')}
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


      {/* Table */}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <SupplierTable
            data={paginated}
            onEdit={(s) => {
              setSelected(s);
              setOpenDialog(true);
            }}
            onDelete={handleDelete}
            onRestore={handleRestore}
            isAdmin={isAdmin}
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

      {/* Add/Edit dialog */}
      <SupplierDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        initialData={selected}
      />

      {/* Confirm dialog */}
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, action: null })}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm.action === 'delete'
              ? 'Bạn có chắc muốn xoá nhà cung cấp này?'
              : 'Bạn có chắc muốn khôi phục nhà cung cấp này?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, id: null, action: null })}>Huỷ</Button>
          <Button onClick={confirmAction} variant="contained" color={confirm.action === 'delete' ? 'error' : 'primary'}>
            {confirm.action === 'delete' ? 'Xoá' : 'Khôi phục'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default SupplierPage;
