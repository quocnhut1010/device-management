import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppBar, Toolbar, Typography, Avatar, Box, Menu, MenuItem, IconButton, Tooltip, useMediaQuery, useTheme, Badge, InputBase, alpha, Divider, ListItemIcon, } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Search as SearchIcon, Settings, Logout, } from '@mui/icons-material';
import { useState } from 'react';
import { getUserFromToken, logout } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import UserProfileDialog from '../user/UserProfileDialog';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { useNotification } from '../../hooks/useNotification';
const HeaderBar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const user = getUserFromToken(); // lấy từ JWT
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const roleLabel = user?.role === 'Admin' ? 'Quản trị viên' : 'Người dùng';
    const { notify } = useNotification();
    // Avatar dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    // Notification dropdown
    const [notifAnchor, setNotifAnchor] = useState(null);
    const openNotif = Boolean(notifAnchor);
    const handleNotifClick = (event) => setNotifAnchor(event.currentTarget);
    const handleNotifClose = () => setNotifAnchor(null);
    // Profile dialog
    const [openProfile, setOpenProfile] = useState(false);
    const [profile, setProfile] = useState(null);
    const handleOpenProfile = async () => {
        try {
            const res = await getUserProfile(); // ✅ gọi API lấy thông tin profile của user hiện tại
            setProfile(res.data);
            setOpenProfile(true);
        }
        catch {
            notify('Không thể tải thông tin người dùng', 'error');
        }
    };
    return (_jsxs(AppBar, { position: "sticky", elevation: 3, sx: {
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            zIndex: theme.zIndex.drawer + 1,
            color: theme.palette.text.primary,
        }, children: [_jsxs(Toolbar, { sx: { justifyContent: 'space-between', gap: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [isMobile && (_jsx(IconButton, { edge: "start", color: "inherit", onClick: onMenuClick, children: _jsx(MenuIcon, {}) })), _jsx(Typography, { variant: "h6", fontWeight: "bold", noWrap: true, children: "Device Manager" })] }), !isMobile && (_jsxs(Box, { sx: {
                            position: 'relative',
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.grey[300], 0.15),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.grey[300], 0.25),
                            },
                            width: '100%',
                            maxWidth: 300,
                            mr: 2,
                        }, children: [_jsx(Box, { sx: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    pl: 2,
                                }, children: _jsx(SearchIcon, {}) }), _jsx(InputBase, { placeholder: "T\u00ECm ki\u1EBFm thi\u1EBFt b\u1ECB...", sx: { pl: 5, width: '100%', height: 40 }, inputProps: { 'aria-label': 'search' } })] })), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Tooltip, { title: "Th\u00F4ng b\u00E1o", children: _jsx(IconButton, { onClick: handleNotifClick, children: _jsx(Badge, { badgeContent: 2, color: "error", children: _jsx(NotificationsIcon, {}) }) }) }), _jsxs(Menu, { anchorEl: notifAnchor, open: openNotif, onClose: handleNotifClose, children: [_jsx(MenuItem, { disabled: true, children: "\uD83D\uDD14 B\u00E1o c\u00E1o s\u1EF1 c\u1ED1 m\u1EDBi" }), _jsx(MenuItem, { disabled: true, children: "\uD83D\uDEE0\uFE0F Thi\u1EBFt b\u1ECB \u0111ang \u0111\u01B0\u1EE3c s\u1EEDa" })] }), _jsx(Typography, { variant: "body2", sx: { display: { xs: 'none', md: 'block' } }, children: roleLabel }), _jsx(Tooltip, { title: "T\u00E0i kho\u1EA3n", children: _jsx(IconButton, { onClick: handleMenuOpen, sx: { p: 0 }, children: _jsx(Avatar, { children: user?.email?.charAt(0).toUpperCase() }) }) }), _jsxs(Menu, { anchorEl: anchorEl, open: open, onClose: handleClose, children: [_jsx(MenuItem, { disabled: true, children: user?.email }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: handleOpenProfile, children: [_jsx(ListItemIcon, { children: _jsx(Settings, { fontSize: "small" }) }), "C\u00E0i \u0111\u1EB7t"] }), _jsxs(MenuItem, { onClick: handleLogout, children: [_jsx(ListItemIcon, { children: _jsx(Logout, { fontSize: "small" }) }), "\u0110\u0103ng xu\u1EA5t"] })] })] })] }), profile && (_jsx(UserProfileDialog, { open: openProfile, onClose: () => setOpenProfile(false), user: profile, onSubmit: (updated) => {
                    if (!user || !profile)
                        return;
                    const payload = { ...profile, ...updated };
                    updateUserProfile(payload)
                        .then(() => {
                        notify('Cập nhật thành công', 'success');
                        setOpenProfile(false);
                    })
                        .catch(() => notify('Lỗi khi cập nhật', 'error'));
                } }))] }));
};
export default HeaderBar;
