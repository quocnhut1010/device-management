import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/user/UserProfileDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Button, Avatar, Typography, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import useUserRole from '../../services/useUserRole';
import { format } from 'date-fns-tz';
import { vi } from 'date-fns/locale';
import UserAvatar from '../common/UserAvatar';
const UserProfileDialog = ({ open, onClose, user, onSubmit }) => {
    const { role } = useUserRole();
    const [form, setForm] = useState({});
    useEffect(() => {
        setForm(user);
    }, [user]);
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const initials = user?.fullName
        ? user.fullName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';
    return (_jsxs(Dialog, { open: open, onClose: onClose, fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: _jsxs(Stack, { direction: "column", alignItems: "center", spacing: 1, children: [_jsxs(Avatar, { sx: { width: 84, height: 84 }, children: [_jsx(UserAvatar, { name: user?.fullName || '', 
                                    // imageUrl={user?.}
                                    isOnline: true, editable: true, onImageSelect: (file) => {
                                        console.log('Selected avatar file:', file);
                                        // TODO: gửi API upload sau này
                                    } }), initials] }), _jsx(Typography, { variant: "h6", children: "Th\u00F4ng tin c\u00E1 nh\u00E2n" })] }) }), _jsx(Divider, {}), _jsx(DialogContent, { children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "H\u1ECD t\u00EAn", value: form.fullName || '', onChange: (e) => handleChange('fullName', e.target.value), fullWidth: true }), _jsx(TextField, { label: "Email", value: form.email, InputProps: { readOnly: true }, fullWidth: true }), _jsx(TextField, { label: "Vai tr\u00F2", value: form.role, InputProps: { readOnly: role !== 'Admin' }, fullWidth: true }), _jsx(TextField, { label: "Ph\u00F2ng ban", value: form.departmentName, InputProps: { readOnly: role !== 'Admin' }, fullWidth: true }), _jsx(TextField, { label: "V\u1ECB tr\u00ED", value: form.position || '', onChange: (e) => handleChange('position', e.target.value), fullWidth: true })] }) }), user?.updatedAt && (_jsxs(Typography, { variant: "body2", color: "text.secondary", align: "center", sx: { mt: 1 }, children: ["L\u1EA7n c\u1EADp nh\u1EADt:", " ", format(new Date(new Date(user.updatedAt).getTime() + 7 * 60 * 60 * 1000), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })] })), _jsxs(DialogActions, { sx: { justifyContent: 'space-between', px: 3, pb: 2 }, children: [_jsx(Button, { onClick: onClose, children: "\u0110\u00F3ng" }), _jsx(Button, { variant: "contained", onClick: () => onSubmit(form), children: "C\u1EADp nh\u1EADt" })] })] }));
};
export default UserProfileDialog;
