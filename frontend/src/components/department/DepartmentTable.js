import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { deleteDepartment, restoreDepartment } from '../../services/departmentService';
import { useNotification } from '../../hooks/useNotification';
import useUserRole from '../../services/useUserRole';
import axios from 'axios';
const DepartmentTable = ({ data, refresh, onEdit, position }) => {
    const { notify } = useNotification();
    const { user, role } = useUserRole();
    const isAdmin = role === 'Admin';
    const isManager = role === 'User' && position === 'Trưởng phòng';
    const showUserCount = isAdmin || isManager;
    const handleDelete = async (id) => {
        if (confirm('Bạn có chắc muốn xoá phòng ban này?')) {
            try {
                await deleteDepartment(id);
                notify('Đã xoá phòng ban', 'success');
                refresh();
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    const message = error.response?.data || 'Không thể xoá phòng ban đang chứa thiết bị';
                    notify(message, 'error');
                }
                else {
                    notify('Lỗi không xác định khi xoá phòng ban', 'error');
                }
            }
        }
    };
    const handleRestore = async (id) => {
        if (confirm('Bạn có chắc muốn khôi phục phòng ban này?')) {
            await restoreDepartment(id);
            notify('Đã khôi phục phòng ban', 'success');
            refresh();
        }
    };
    return (_jsx(TableContainer, { component: Paper, sx: { borderRadius: 2, boxShadow: 3 }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { sx: { bgcolor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "T\u00EAn ph\u00F2ng ban" }), _jsx(TableCell, { children: "M\u00E3" }), _jsx(TableCell, { children: "V\u1ECB tr\u00ED" }), (role === 'Admin' || user?.position === 'Trưởng phòng') && _jsx(TableCell, { align: "center", children: "S\u1ED1 nh\u00E2n vi\u00EAn" }), _jsx(TableCell, { align: "center", children: "S\u1ED1 thi\u1EBFt b\u1ECB" }), _jsx(TableCell, { align: "center", children: "Tr\u1EA1ng th\u00E1i" }), isAdmin && _jsx(TableCell, { align: "right", children: "Thao t\u00E1c" })] }) }), _jsx(TableBody, { children: data.map((dept, index) => (_jsxs(TableRow, { sx: {
                            bgcolor: index % 2 === 0 ? 'white' : '#fafafa',
                            opacity: dept.isDeleted ? 0.6 : 1,
                        }, children: [_jsx(TableCell, { children: dept.departmentName }), _jsx(TableCell, { children: dept.departmentCode }), _jsx(TableCell, { children: dept.location }), (role === 'Admin' || user?.position === 'Trưởng phòng') && (_jsx(TableCell, { align: "center", children: _jsx(Chip, { label: dept.userCount, color: "primary", size: "small" }) })), _jsx(TableCell, { align: "center", children: _jsx(Chip, { label: dept.deviceCount, color: dept.deviceCount > 0 ? 'success' : 'default', size: "small" }) }), _jsx(TableCell, { align: "center", children: dept.isDeleted ? (_jsx(Chip, { label: "\u0110\u00E3 xo\u00E1", color: "error", size: "small" })) : (_jsx(Chip, { label: "Ho\u1EA1t \u0111\u1ED9ng", color: "success", size: "small" })) }), isAdmin && (_jsx(TableCell, { align: "right", children: dept.isDeleted ? (_jsx(Tooltip, { title: "Kh\u00F4i ph\u1EE5c", children: _jsx(IconButton, { onClick: () => handleRestore(dept.id), color: "success", children: _jsx(RestoreIcon, {}) }) })) : (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: "Ch\u1EC9nh s\u1EEDa", children: _jsx(IconButton, { onClick: () => onEdit(dept), color: "primary", children: _jsx(EditIcon, {}) }) }), _jsx(Tooltip, { title: "Xo\u00E1", children: _jsx(IconButton, { onClick: () => handleDelete(dept.id), color: "error", children: _jsx(DeleteIcon, {}) }) })] })) }))] }, dept.id))) })] }) }));
};
export default DepartmentTable;
