import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, Button, MenuItem, Box, Collapse, CircularProgress, Fade, } from '@mui/material';
import { useEffect, useState, forwardRef } from 'react';
import { getAllDepartments } from '../../services/departmentService';
const commonPositions = ['Nhân viên', 'Trưởng phòng', 'Kỹ thuật', 'Khác'];
const Transition = forwardRef(function Transition(props, ref) {
    return _jsx(Fade, { ref: ref, ...props });
});
const UserDialog = ({ open, onClose, onSubmit, user }) => {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'User',
        departmentId: '',
        position: '',
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const resetForm = () => {
        if (user) {
            setForm({ ...user, password: '' });
        }
        else {
            setForm({
                fullName: '',
                email: '',
                password: '',
                role: 'User',
                departmentId: '',
                position: '',
            });
        }
    };
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await getAllDepartments(false); // chỉ lấy phòng ban đang hoạt động
                setDepartments(res.data);
            }
            catch (err) {
                console.error('Lỗi khi tải danh sách phòng ban', err);
            }
        };
        fetchDepartments();
        resetForm();
    }, [user]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const finalData = {
                ...form,
                position: form.position === 'Khác'
                    ? form.customPosition || ''
                    : form.position,
            };
            await onSubmit(finalData);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Dialog, { open: open, onClose: () => {
            resetForm();
            onClose();
        }, fullWidth: true, maxWidth: "sm", TransitionComponent: Transition, children: [_jsx(DialogTitle, { children: user ? 'Cập nhật người dùng' : 'Thêm người dùng' }), _jsxs(DialogContent, { dividers: true, sx: {
                    opacity: loading ? 0.5 : 1,
                    pointerEvents: loading ? 'none' : 'auto',
                }, children: [_jsx(DialogContentText, { sx: { mb: 2 }, children: user
                            ? 'Cập nhật thông tin chi tiết của người dùng trong hệ thống.'
                            : 'Nhập thông tin để thêm người dùng mới vào hệ thống.' }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(TextField, { name: "fullName", label: "H\u1ECD t\u00EAn", fullWidth: true, variant: "outlined", value: form.fullName, onChange: handleChange }), _jsx(TextField, { name: "email", label: "Email", type: "email", fullWidth: true, variant: "outlined", value: form.email, onChange: handleChange })] }), !user && (_jsx(TextField, { name: "password", type: "password", label: "M\u1EADt kh\u1EA9u", fullWidth: true, variant: "outlined", value: form.password || '', onChange: handleChange })), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsxs(TextField, { name: "role", label: "Vai tr\u00F2", select: true, fullWidth: true, variant: "outlined", value: form.role, onChange: handleChange, children: [_jsx(MenuItem, { value: "User", children: "User" }), _jsx(MenuItem, { value: "Admin", children: "Admin" })] }), _jsx(TextField, { name: "departmentId", label: "Ph\u00F2ng ban", select: true, fullWidth: true, variant: "outlined", value: form.departmentId || '', onChange: handleChange, children: departments.map((dep) => (_jsx(MenuItem, { value: dep.id, children: dep.departmentName }, dep.id))) })] }), _jsxs(Box, { children: [_jsx(TextField, { name: "position", label: "V\u1ECB tr\u00ED", select: true, fullWidth: true, variant: "outlined", value: form.position || '', onChange: handleChange, children: commonPositions.map((pos) => (_jsx(MenuItem, { value: pos, children: pos }, pos))) }), _jsx(Collapse, { in: form.position === 'Khác', timeout: "auto", unmountOnExit: true, children: _jsx(TextField, { name: "customPosition", label: "Nh\u1EADp v\u1ECB tr\u00ED kh\u00E1c", fullWidth: true, variant: "outlined", sx: { mt: 2 }, value: form.customPosition || '', onChange: (e) => setForm((prev) => ({
                                                ...prev,
                                                customPosition: e.target.value,
                                            })) }) })] })] })] }), _jsxs(DialogActions, { sx: { px: 3, py: 2 }, children: [_jsx(Button, { onClick: () => {
                            resetForm();
                            onClose();
                        }, color: "secondary", sx: { borderRadius: 2 }, children: "H\u1EE7y" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", color: "primary", disabled: loading, startIcon: loading && _jsx(CircularProgress, { size: 16 }), sx: { borderRadius: 2 }, children: "L\u01B0u" })] })] }));
};
export default UserDialog;
