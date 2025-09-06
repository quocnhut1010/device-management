import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AnimatedPage from '../components/AnimatedPage'; // thêm dòng này
import { Box, Typography, Button, Container, Card, CardContent, Avatar, Fade } from '@mui/material';
import { Security as SecurityIcon, Devices as DevicesIcon, AdminPanelSettings as AdminIcon, Person as PersonIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const Welcome = () => {
    const navigate = useNavigate();
    const features = [
        {
            icon: _jsx(SecurityIcon, {}),
            title: 'Bảo mật cao',
            description: 'Hệ thống xác thực JWT với phân quyền chi tiết'
        },
        {
            icon: _jsx(DevicesIcon, {}),
            title: 'Quản lý thiết bị',
            description: 'Theo dõi và quản lý tất cả thiết bị trong tổ chức'
        },
        {
            icon: _jsx(AdminIcon, {}),
            title: 'Phân quyền linh hoạt',
            description: 'Phân quyền Admin và User với các chức năng khác nhau'
        },
        {
            icon: _jsx(PersonIcon, {}),
            title: 'Giao diện thân thiện',
            description: 'Thiết kế hiện đại với Material-UI'
        }
    ];
    return (_jsx(AnimatedPage, { children: _jsx(Box, { sx: {
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }, children: _jsxs(Container, { maxWidth: "lg", children: [_jsx(Fade, { in: true, timeout: 800, children: _jsxs(Box, { textAlign: "center", mb: 6, children: [_jsx(Avatar, { sx: {
                                        mx: 'auto',
                                        mb: 3,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        width: 80,
                                        height: 80,
                                        backdropFilter: 'blur(10px)',
                                    }, children: _jsx(SecurityIcon, { sx: { fontSize: 40, color: 'white' } }) }), _jsx(Typography, { variant: "h2", component: "h1", fontWeight: "bold", color: "white", gutterBottom: true, sx: {
                                        fontSize: { xs: '2rem', md: '3rem' },
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    }, children: "H\u1EC7 Th\u1ED1ng Qu\u1EA3n L\u00FD Thi\u1EBFt B\u1ECB" }), _jsx(Typography, { variant: "h5", color: "rgba(255,255,255,0.9)", sx: {
                                        mb: 4,
                                        fontSize: { xs: '1.1rem', md: '1.5rem' },
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                    }, children: "Gi\u1EA3i ph\u00E1p qu\u1EA3n l\u00FD thi\u1EBFt b\u1ECB hi\u1EC7n \u0111\u1EA1i v\u00E0 b\u1EA3o m\u1EADt" }), _jsx(Button, { variant: "contained", size: "large", endIcon: _jsx(ArrowIcon, {}), onClick: () => navigate('/login'), sx: {
                                        py: 1.5,
                                        px: 4,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        '&:hover': {
                                            background: 'rgba(255,255,255,0.3)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                        },
                                    }, children: "B\u1EAFt \u0110\u1EA7u S\u1EED D\u1EE5ng" })] }) }), _jsx(Box, { sx: {
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 4
                        }, children: features.map((feature, index) => (_jsx(Box, { children: _jsx(Fade, { in: true, timeout: 1000 + index * 200, children: _jsx(Card, { elevation: 0, sx: {
                                        height: '100%',
                                        background: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            background: 'rgba(255,255,255,0.15)',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                        },
                                    }, children: _jsxs(CardContent, { sx: { textAlign: 'center', p: 3 }, children: [_jsx(Avatar, { sx: {
                                                    mx: 'auto',
                                                    mb: 2,
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    width: 56,
                                                    height: 56,
                                                }, children: feature.icon }), _jsx(Typography, { variant: "h6", fontWeight: "bold", gutterBottom: true, children: feature.title }), _jsx(Typography, { variant: "body2", sx: { opacity: 0.9 }, children: feature.description })] }) }) }) }, index))) })] }) }) }));
};
export default Welcome;
