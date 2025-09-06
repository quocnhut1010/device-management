import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/DepartmentPage.tsx
import { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Typography, Button, Select, MenuItem, InputLabel, FormControl, InputAdornment, TextField, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DepartmentTable from '../components/department/DepartmentTable';
import DepartmentDialog from '../components/department/DepartmentDialog';
import { getAllDepartments, getMyDepartment, // ✅ thêm API my
 } from '../services/departmentService';
import useUserRole from '../services/useUserRole'; // ✅ lấy role từ token
const DepartmentPage = () => {
    const [departments, setDepartments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selected, setSelected] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [deviceFilter, setDeviceFilter] = useState('all');
    const { user, role } = useUserRole(); // ✅ lấy role
    const fetchDepartments = async () => {
        try {
            let isDeletedParam;
            if (filterStatus === 'active')
                isDeletedParam = false;
            else if (filterStatus === 'deleted')
                isDeletedParam = true;
            let res;
            if (role === 'Admin') {
                res = await getAllDepartments(isDeletedParam);
            }
            else {
                res = await getMyDepartment();
            }
            setDepartments(res.data);
        }
        catch (error) {
            console.error('Lỗi lấy phòng ban:', error);
        }
    };
    useEffect(() => {
        fetchDepartments();
    }, [filterStatus, role]);
    return (_jsxs(Box, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h5", children: "Qu\u1EA3n l\u00FD Ph\u00F2ng ban" }), role === 'Admin' && ( // ✅ chỉ Admin mới thêm
                    _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => setOpenDialog(true), children: "Th\u00EAm ph\u00F2ng ban" }))] }), _jsxs(Box, { sx: {
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                    mb: 2,
                }, children: [_jsxs(FormControl, { size: "small", sx: { minWidth: 220 }, children: [_jsx(InputLabel, { children: "Tr\u1EA1ng th\u00E1i ph\u00F2ng ban" }), _jsxs(Select, { value: filterStatus, label: "Tr\u1EA1ng th\u00E1i ph\u00F2ng ban", onChange: (e) => setFilterStatus(e.target.value), children: [_jsx(MenuItem, { value: "all", children: "T\u1EA5t c\u1EA3" }), _jsx(MenuItem, { value: "active", children: "\u0110ang ho\u1EA1t \u0111\u1ED9ng" }), _jsx(MenuItem, { value: "deleted", children: "\u0110\u00E3 xo\u00E1" })] })] }), _jsxs(FormControl, { size: "small", sx: { minWidth: 220 }, children: [_jsx(InputLabel, { children: "Thi\u1EBFt b\u1ECB" }), _jsxs(Select, { value: deviceFilter, label: "Thi\u1EBFt b\u1ECB", onChange: (e) => setDeviceFilter(e.target.value), children: [_jsx(MenuItem, { value: "all", children: "T\u1EA5t c\u1EA3" }), _jsx(MenuItem, { value: "hasDevice", children: "C\u00F3 thi\u1EBFt b\u1ECB" }), _jsx(MenuItem, { value: "noDevice", children: "Ch\u01B0a c\u00F3 thi\u1EBFt b\u1ECB" })] })] }), _jsx(TextField, { size: "small", placeholder: "T\u00ECm t\u00EAn ho\u1EB7c m\u00E3 ph\u00F2ng ban...", value: searchKeyword, onChange: (e) => setSearchKeyword(e.target.value), sx: { width: 260 }, InputProps: {
                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                        } })] }), _jsx(DepartmentTable, { data: departments.filter((d) => {
                    const matchKeyword = d.departmentName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        (d.departmentCode?.toLowerCase().includes(searchKeyword.toLowerCase()) || false);
                    const matchDevice = deviceFilter === 'all'
                        ? true
                        : deviceFilter === 'hasDevice'
                            ? d.deviceCount > 0
                            : d.deviceCount === 0;
                    return matchKeyword && matchDevice;
                }), refresh: fetchDepartments, onEdit: (item) => {
                    setSelected(item);
                    setOpenDialog(true);
                }, role: role || '', position: user?.position || '' }), role === 'Admin' && (_jsx(DepartmentDialog, { open: openDialog, onClose: () => {
                    setOpenDialog(false);
                    setSelected(null);
                }, selected: selected, refresh: fetchDepartments }))] }));
};
export default DepartmentPage;
