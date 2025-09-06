import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, Typography, Box, IconButton, Tooltip, Stack, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import { Add, Delete, Edit, Restore } from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser, restoreUser, } from '../services/userService';
import UserDialog from '../components/user/UserDialog';
import useUserRole from '../services/useUserRole';
import { useNotification } from '../hooks/useNotification';
import { getUserFromToken } from '../services/auth';
import CustomSearchInput from '../components/ui/CustomSearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [potisionFilter, setPotisionFilter] = useState('');
    const uniqueRoles = Array.from(new Set(users.map((u) => u.role))).filter(Boolean);
    const uniqueDepartments = Array.from(new Set(users.map((u) => u.departmentName))).filter(Boolean);
    const uniquePotisions = Array.from(new Set(users.map((u) => u.position))).filter(Boolean);
    const filteredUsers = users.filter((user) => {
        const matchSearch = user.fullName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter ? user.role === roleFilter : true;
        const matchDepartment = departmentFilter ? user.departmentName === departmentFilter : true;
        const matchPotision = potisionFilter ? user.position == potisionFilter : true;
        return matchSearch && matchRole && matchDepartment && matchPotision;
    });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
    const { role } = useUserRole();
    const { notify } = useNotification();
    const { nameid: currentUserId } = getUserFromToken() || {};
    const loadUsers = async () => {
        try {
            const res = await getUsers();
            const filtered = role === 'Admin'
                ? res.data.filter((user) => user.id !== currentUserId || (user.id === currentUserId && user.isDeleted))
                : res.data;
            console.log('📌 Users từ API:', filtered);
            setUsers(filtered);
        }
        catch {
            notify('Lỗi khi tải danh sách người dùng', 'error');
        }
    };
    useEffect(() => {
        loadUsers();
    }, []);
    const handleAdd = () => {
        setSelectedUser(null);
        setOpenDialog(true);
    };
    const handleEdit = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };
    const handleDelete = (id) => {
        setConfirmDialog({ open: true, action: 'delete', id });
    };
    const handleRestore = (id) => {
        setConfirmDialog({ open: true, action: 'restore', id });
    };
    const executeConfirm = async () => {
        if (!confirmDialog.id || !confirmDialog.action)
            return;
        try {
            if (confirmDialog.action === 'delete') {
                await deleteUser(confirmDialog.id);
                notify('Xoá người dùng thành công', 'success');
            }
            else {
                await restoreUser(confirmDialog.id);
                notify('Khôi phục người dùng thành công', 'success');
            }
            loadUsers();
        }
        catch {
            notify('Thao tác thất bại', 'error');
        }
        finally {
            setConfirmDialog({ open: false, action: null });
        }
    };
    const handleSubmit = async (data) => {
        try {
            if ('id' in data) {
                await updateUser(data.id, data);
                notify('Cập nhật người dùng thành công', 'success');
            }
            else {
                await createUser(data);
                notify('Thêm người dùng thành công', 'success');
            }
            setOpenDialog(false);
            loadUsers();
        }
        catch (err) {
            notify(err?.response?.data?.message || 'Thao tác thất bại', 'error');
        }
    };
    return (_jsxs(Box, { children: [_jsxs(Paper, { elevation: 2, sx: {
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }, children: [_jsx(Typography, { variant: "h6", fontWeight: "600", children: "Qu\u1EA3n l\u00FD ng\u01B0\u1EDDi d\u00F9ng" }), _jsx(CustomSearchInput, { value: search, onChange: setSearch, placeholder: "T\u00ECm theo t\u00EAn ho\u1EB7c email" }), _jsx(FilterDropdown, { label: "Ph\u00F2ng ban", value: departmentFilter ?? '', onChange: setDepartmentFilter, options: uniqueDepartments }), _jsx(FilterDropdown, { label: "V\u1ECB tr\u00ED", value: potisionFilter ?? '', onChange: setPotisionFilter, options: uniquePotisions }), role === 'Admin' && (_jsx(Button, { startIcon: _jsx(Add, {}), variant: "contained", color: "primary", onClick: handleAdd, sx: { borderRadius: 2, textTransform: 'none' }, children: "Th\u00EAm ng\u01B0\u1EDDi d\u00F9ng" }))] }), _jsx(TableContainer, { component: Paper, elevation: 1, children: _jsxs(Table, { children: [_jsx(TableHead, { sx: { bgcolor: 'grey.100' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "H\u1ECD t\u00EAn" }), _jsx(TableCell, { children: "Email" }), _jsx(TableCell, { children: "Vai tr\u00F2" }), _jsx(TableCell, { children: "Ph\u00F2ng ban" }), _jsx(TableCell, { children: "V\u1ECB tr\u00ED" }), role === 'Admin' && _jsx(TableCell, { align: "center", children: "Thao t\u00E1c" })] }) }), _jsx(TableBody, { children: filteredUsers.map((user) => (_jsxs(TableRow, { hover: true, sx: {
                                    opacity: user.isDeleted ? 0.6 : 1,
                                    '&:last-child td, &:last-child th': { border: 0 },
                                }, children: [_jsx(TableCell, { children: _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [user.fullName, user.isDeleted && _jsx(Chip, { label: "\u0110\u00E3 xo\u00E1", size: "small", color: "error" })] }) }), _jsx(TableCell, { children: user.email }), _jsx(TableCell, { children: user.role }), _jsx(TableCell, { children: user.departmentName }), _jsx(TableCell, { children: user.position }), role === 'Admin' && (_jsx(TableCell, { align: "center", children: user.isDeleted ? (_jsx(Tooltip, { title: "Kh\u00F4i ph\u1EE5c", children: _jsx(Button, { startIcon: _jsx(Restore, {}), size: "small", variant: "outlined", color: "success", sx: { borderRadius: 2, textTransform: 'none' }, onClick: () => handleRestore(user.id), children: "Kh\u00F4i ph\u1EE5c" }) })) : (_jsxs(Stack, { direction: "row", spacing: 1, justifyContent: "center", children: [_jsx(Tooltip, { title: "S\u1EEDa", children: _jsx("span", { children: _jsx(IconButton, { color: "primary", onClick: () => handleEdit(user), disabled: user.id === currentUserId, children: _jsx(Edit, { fontSize: "small" }) }) }) }), _jsx(Tooltip, { title: "Xo\u00E1", children: _jsx("span", { children: _jsx(IconButton, { color: "error", onClick: () => handleDelete(user.id), disabled: user.id === currentUserId, children: _jsx(Delete, { fontSize: "small" }) }) }) })] })) }))] }, user.id))) })] }) }), _jsx(UserDialog, { open: openDialog, onClose: () => setOpenDialog(false), onSubmit: handleSubmit, user: selectedUser }), _jsxs(Dialog, { open: confirmDialog.open, onClose: () => setConfirmDialog({ open: false, action: null }), children: [_jsx(DialogTitle, { children: "X\u00E1c nh\u1EADn" }), _jsx(DialogContent, { children: _jsx(DialogContentText, { children: confirmDialog.action === 'delete'
                                ? 'Bạn có chắc chắn muốn xoá người dùng này không?'
                                : 'Bạn có chắc chắn muốn khôi phục người dùng này không?' }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setConfirmDialog({ open: false, action: null }), children: "H\u1EE7y" }), _jsx(Button, { onClick: executeConfirm, variant: "contained", color: confirmDialog.action === 'delete' ? 'error' : 'success', children: confirmDialog.action === 'delete' ? 'Xoá' : 'Khôi phục' })] })] })] }));
};
export default UserPage;
