import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Unauthorized.tsx
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
const Unauthorized = () => {
    const navigate = useNavigate();
    const loggedIn = isAuthenticated();
    return (_jsxs(Box, { sx: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 3,
        }, children: [_jsx(Typography, { variant: "h4", color: "error", gutterBottom: true, children: "\u274C Kh\u00F4ng th\u1EC3 truy c\u1EADp" }), loggedIn ? (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "body1", mb: 3, children: "B\u1EA1n kh\u00F4ng c\u00F3 quy\u1EC1n truy c\u1EADp trang n\u00E0y." }), _jsx(Button, { variant: "contained", color: "primary", onClick: () => navigate(-1), children: "Quay l\u1EA1i" })] })) : (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "body1", mb: 3, children: "B\u1EA1n ch\u01B0a \u0111\u0103ng nh\u1EADp. Vui l\u00F2ng \u0111\u0103ng nh\u1EADp \u0111\u1EC3 ti\u1EBFp t\u1EE5c." }), _jsx(Button, { variant: "contained", color: "primary", onClick: () => navigate('/login'), children: "Quay l\u1EA1i trang \u0111\u0103ng nh\u1EADp" })] }))] }));
};
export default Unauthorized;
