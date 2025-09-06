import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { Box, Typography, Paper, Avatar, Stack, useTheme, FormControlLabel, Checkbox, CircularProgress, InputAdornment, } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../components/ui/CustomInput';
import CustomButton from '../components/ui/CustomButton';
import { login } from '../services/auth';
const LoginPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch {
            setError('Đăng nhập thất bại. Kiểm tra lại thông tin.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Box, { sx: {
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
        }, children: _jsxs(Paper, { elevation: 10, sx: {
                p: 4,
                width: '100%',
                maxWidth: 420,
                borderRadius: 4,
            }, children: [_jsxs(Stack, { spacing: 2, alignItems: "center", mb: 2, children: [_jsx(Avatar, { sx: { bgcolor: theme.palette.primary.main, width: 56, height: 56 }, children: _jsx(LockOutlinedIcon, { fontSize: "large" }) }), _jsx(Typography, { variant: "h5", fontWeight: "bold", children: "\u0110\u0103ng nh\u1EADp" })] }), _jsxs(Box, { component: "form", noValidate: true, autoComplete: "off", children: [_jsx(CustomInput, { label: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), InputProps: {
                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(EmailIcon, {}) })),
                            } }), _jsx(CustomInput, { label: "M\u1EADt kh\u1EA9u", type: "password", value: password, onChange: (e) => setPassword(e.target.value), InputProps: {
                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(LockIcon, {}) })),
                            } }), _jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: rememberMe, onChange: (e) => setRememberMe(e.target.checked) }), label: "Ghi nh\u1EDB \u0111\u0103ng nh\u1EADp", sx: { mt: 1 } }), error && (_jsx(Typography, { color: "error", variant: "body2", mt: 1, children: error })), _jsx(CustomButton, { text: loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP', onClick: handleLogin, sx: { mt: 3 }, disabled: loading, endIcon: loading && _jsx(CircularProgress, { color: "inherit", size: 20 }) })] })] }) }));
};
export default LoginPage;
