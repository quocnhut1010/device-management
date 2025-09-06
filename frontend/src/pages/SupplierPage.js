import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Typography, Button, Stack, CircularProgress, TextField, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, InputLabel, MenuItem, Select, TablePagination, Paper, InputAdornment, } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier, restoreSupplier, } from '../services/supplierService';
import SupplierTable from '../components/supplier/SupplierTable';
import SupplierDialog from '../components/supplier/SupplierDialog';
import { getUserRole } from '../services/auth';
import SearchIcon from '@mui/icons-material/Search';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
const SupplierPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selected, setSelected] = useState(null);
    // confirm dialog
    const [confirm, setConfirm] = useState({
        open: false,
        id: null,
        action: null,
    });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    // pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    // toast
    const [toast, setToast] = useState({
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
        }
        catch (err) {
            console.error('Lỗi khi tải nhà cung cấp', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (data) => {
        try {
            if (data.id) {
                await updateSupplier(data.id, data);
                setToast({ open: true, message: 'Cập nhật thành công', severity: 'success' });
            }
            else {
                await createSupplier(data);
                setToast({ open: true, message: 'Thêm mới thành công', severity: 'success' });
            }
            fetchSuppliers();
        }
        catch (err) {
            console.error('Lỗi khi lưu nhà cung cấp', err);
            setToast({ open: true, message: 'Lỗi khi lưu nhà cung cấp', severity: 'error' });
        }
    };
    const handleDelete = (id) => {
        setConfirm({ open: true, id, action: 'delete' });
    };
    const handleRestore = (id) => {
        setConfirm({ open: true, id, action: 'restore' });
    };
    const confirmAction = async () => {
        if (!confirm.id || !confirm.action)
            return;
        try {
            if (confirm.action === 'delete') {
                await deleteSupplier(confirm.id);
                setToast({ open: true, message: 'Xoá thành công', severity: 'success' });
            }
            else if (confirm.action === 'restore') {
                await restoreSupplier(confirm.id);
                setToast({ open: true, message: 'Khôi phục thành công', severity: 'success' });
            }
            fetchSuppliers();
        }
        catch {
            setToast({
                open: true,
                message: confirm.action === 'delete' ? 'Lỗi khi xoá nhà cung cấp' : 'Lỗi khi khôi phục nhà cung cấp',
                severity: 'error',
            });
        }
        finally {
            setConfirm({ open: false, id: null, action: null });
        }
    };
    const filtered = suppliers
        .filter((s) => s.supplierName.toLowerCase().includes(search.toLowerCase()))
        .filter((s) => {
        if (statusFilter === 'active')
            return !s.isDeleted;
        if (statusFilter === 'deleted')
            return s.isDeleted;
        return true;
    });
    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    useEffect(() => {
        fetchSuppliers();
    }, []);
    return (_jsxs(Box, { p: 3, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsx(Typography, { variant: "h5", children: "Qu\u1EA3n l\u00FD nh\u00E0 cung c\u1EA5p" }), isAdmin && (_jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => {
                            setSelected(null);
                            setOpenDialog(true);
                        }, children: "Th\u00EAm nh\u00E0 cung c\u1EA5p" }))] }), _jsxs(Paper, { elevation: 1, sx: {
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2,
                    borderRadius: 2,
                }, children: [_jsx(TextField, { placeholder: "T\u00ECm ki\u1EBFm nh\u00E0 cung c\u1EA5p...", variant: "outlined", fullWidth: true, value: search, onChange: (e) => setSearch(e.target.value), InputProps: {
                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, { color: "action" }) })),
                        } }), _jsxs(FormControl, { sx: { minWidth: 200 }, children: [_jsx(InputLabel, { children: "Tr\u1EA1ng th\u00E1i" }), _jsxs(Select, { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), label: "Tr\u1EA1ng th\u00E1i", children: [_jsxs(MenuItem, { value: "all", children: [_jsx(AllInboxIcon, { fontSize: "small", style: { marginRight: 8, color: 'gray' } }), "T\u1EA5t c\u1EA3"] }), _jsxs(MenuItem, { value: "active", children: [_jsx(CheckCircleIcon, { fontSize: "small", style: { marginRight: 8, color: 'green' } }), "\u0110ang ho\u1EA1t \u0111\u1ED9ng"] }), _jsxs(MenuItem, { value: "deleted", children: [_jsx(DeleteIcon, { fontSize: "small", style: { marginRight: 8, color: 'orange' } }), "\u0110\u00E3 xo\u00E1"] })] })] })] }), loading ? (_jsx(CircularProgress, {})) : (_jsxs(_Fragment, { children: [_jsx(SupplierTable, { data: paginated, onEdit: (s) => {
                            setSelected(s);
                            setOpenDialog(true);
                        }, onDelete: handleDelete, onRestore: handleRestore, isAdmin: isAdmin }), _jsx(TablePagination, { component: "div", count: filtered.length, page: page, onPageChange: (e, newPage) => setPage(newPage), rowsPerPage: rowsPerPage, onRowsPerPageChange: (e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        } })] })), _jsx(SupplierDialog, { open: openDialog, onClose: () => setOpenDialog(false), onSubmit: handleSubmit, initialData: selected }), _jsxs(Dialog, { open: confirm.open, onClose: () => setConfirm({ open: false, id: null, action: null }), children: [_jsx(DialogTitle, { children: "X\u00E1c nh\u1EADn" }), _jsx(DialogContent, { children: _jsx(DialogContentText, { children: confirm.action === 'delete'
                                ? 'Bạn có chắc muốn xoá nhà cung cấp này?'
                                : 'Bạn có chắc muốn khôi phục nhà cung cấp này?' }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setConfirm({ open: false, id: null, action: null }), children: "Hu\u1EF7" }), _jsx(Button, { onClick: confirmAction, variant: "contained", color: confirm.action === 'delete' ? 'error' : 'primary', children: confirm.action === 'delete' ? 'Xoá' : 'Khôi phục' })] })] }), _jsx(Snackbar, { open: toast.open, autoHideDuration: 3000, anchorOrigin: { vertical: 'top', horizontal: 'right' }, onClose: () => setToast({ ...toast, open: false }), children: _jsx(Alert, { severity: toast.severity, onClose: () => setToast({ ...toast, open: false }), variant: "filled", children: toast.message }) })] }));
};
export default SupplierPage;
