import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/layout/Sidebar.tsx
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Tooltip, useTheme, useMediaQuery, Divider, Collapse, } from '@mui/material';
import { ChevronLeft, ChevronRight, ExpandLess, ExpandMore, } from '@mui/icons-material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserFromToken } from '../../services/auth';
// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import MemoryIcon from '@mui/icons-material/Memory';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
const drawerWidth = 240;
const collapsedWidth = 72;
const Sidebar = ({}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(!isMobile);
    const [collapsed, setCollapsed] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(false);
    const user = getUserFromToken();
    const role = user?.role ?? 'User';
    const isActive = (path) => location.pathname === path;
    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile)
            setOpen(false);
    };
    return (_jsxs(Drawer, { variant: isMobile ? 'temporary' : 'permanent', open: open, onClose: () => setOpen(false), sx: {
            width: collapsed ? collapsedWidth : drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: collapsed ? collapsedWidth : drawerWidth,
                boxSizing: 'border-box',
                transition: 'width 0.3s ease',
                overflowX: 'hidden',
                backgroundColor: '#f9fafb',
            },
        }, children: [_jsxs(Box, { sx: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    px: 2,
                    py: 1.5,
                }, children: [!collapsed && (_jsx(Typography, { variant: "subtitle1", fontWeight: 700, children: "Device Manager" })), _jsx(IconButton, { onClick: () => (isMobile ? setOpen(false) : setCollapsed(!collapsed)), size: "small", children: collapsed ? _jsx(ChevronRight, {}) : _jsx(ChevronLeft, {}) })] }), _jsx(Divider, {}), _jsxs(List, { disablePadding: true, children: [_jsx(SidebarSection, { label: "B\u1EA3ng \u0111i\u1EC1u khi\u1EC3n", collapsed: collapsed }), _jsx(SidebarItem, { label: "Dashboard", icon: _jsx(DashboardIcon, {}), path: "/dashboard", active: isActive('/dashboard'), collapsed: collapsed, onClick: () => handleNavigate('/dashboard') }), _jsx(SidebarSection, { label: "Qu\u1EA3n l\u00FD thi\u1EBFt b\u1ECB", collapsed: collapsed }), _jsx(SidebarItem, { label: "Danh s\u00E1ch thi\u1EBFt b\u1ECB", icon: _jsx(DevicesIcon, {}), path: "/devices", active: isActive('/devices'), collapsed: collapsed, onClick: () => handleNavigate('/devices') }), role === 'Admin' && (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: collapsed ? 'Danh mục thiết bị' : '', placement: "right", arrow: true, children: _jsxs(ListItemButton, { onClick: () => setOpenSubmenu(!openSubmenu), sx: {
                                        px: collapsed ? 1.5 : 2.5,
                                        py: 1.2,
                                        mx: 1,
                                        borderRadius: 2,
                                        '&:hover': {
                                            bgcolor: 'primary.lighter',
                                        },
                                    }, children: [_jsx(ListItemIcon, { sx: { minWidth: 0, mr: collapsed ? 0 : 1.5 }, children: _jsx(CategoryIcon, { color: "primary" }) }), !collapsed && (_jsx(ListItemText, { primary: "Danh m\u1EE5c thi\u1EBFt b\u1ECB", primaryTypographyProps: { fontWeight: 500 } })), !collapsed && (openSubmenu ? _jsx(ExpandLess, {}) : _jsx(ExpandMore, {}))] }) }), _jsx(Collapse, { in: openSubmenu && !collapsed, timeout: "auto", unmountOnExit: true, children: _jsxs(List, { component: "div", disablePadding: true, children: [_jsx(SidebarItem, { label: "M\u1EABu thi\u1EBFt b\u1ECB", icon: _jsx(MemoryIcon, {}), path: "/device-models", active: isActive('/device-models'), collapsed: collapsed, nested: true, onClick: () => handleNavigate('/device-models') }), _jsx(SidebarItem, { label: "Lo\u1EA1i thi\u1EBFt b\u1ECB", icon: _jsx(CategoryIcon, {}), path: "/device-types", active: isActive('/device-types'), collapsed: collapsed, nested: true, onClick: () => handleNavigate('/device-types') }), _jsx(SidebarItem, { label: "Nh\u00E0 cung c\u1EA5p", icon: _jsx(BusinessIcon, {}), path: "/suppliers", active: isActive('/suppliers'), collapsed: collapsed, nested: true, onClick: () => handleNavigate('/suppliers') })] }) })] })), _jsx(SidebarSection, { label: "C\u01A1 c\u1EA5u t\u1ED5 ch\u1EE9c", collapsed: collapsed }), _jsx(SidebarItem, { label: "Ph\u00F2ng ban", icon: _jsx(ApartmentIcon, {}), path: "/departments", active: isActive('/departments'), collapsed: collapsed, onClick: () => handleNavigate('/departments') }), _jsx(SidebarSection, { label: "V\u1EADn h\u00E0nh & L\u1ECBch s\u1EED", collapsed: collapsed }), _jsx(SidebarItem, { label: "C\u1EA5p ph\u00E1t", icon: _jsx(AssignmentIcon, {}), path: "/assignments", active: isActive('/assignments'), collapsed: collapsed, onClick: () => handleNavigate('/assignments') }), _jsx(SidebarItem, { label: "S\u1EEDa ch\u1EEFa", icon: _jsx(BuildIcon, {}), path: "/repairs", active: isActive('/repairs'), collapsed: collapsed, onClick: () => handleNavigate('/repairs') }), _jsx(SidebarItem, { label: "B\u00E1o c\u00E1o s\u1EF1 c\u1ED1", icon: _jsx(ReportProblemIcon, {}), path: "/incidents", active: isActive('/incidents'), collapsed: collapsed, onClick: () => handleNavigate('/incidents') }), role === 'Admin' && (_jsxs(_Fragment, { children: [_jsx(SidebarItem, { label: "Thay th\u1EBF", icon: _jsx(SwapHorizIcon, {}), path: "/replacements", active: isActive('/replacements'), collapsed: collapsed, onClick: () => handleNavigate('/replacements') }), _jsx(SidebarItem, { label: "Thanh l\u00FD", icon: _jsx(DeleteSweepIcon, {}), path: "/liquidations", active: isActive('/liquidations'), collapsed: collapsed, onClick: () => handleNavigate('/liquidations') }), _jsx(SidebarItem, { label: "L\u1ECBch s\u1EED thi\u1EBFt b\u1ECB", icon: _jsx(HistoryIcon, {}), path: "/device-histories", active: isActive('/device-histories'), collapsed: collapsed, onClick: () => handleNavigate('/device-histories') })] })), role === 'Admin' && (_jsxs(_Fragment, { children: [_jsx(SidebarSection, { label: "Ng\u01B0\u1EDDi d\u00F9ng & H\u1EC7 th\u1ED1ng", collapsed: collapsed }), _jsx(SidebarItem, { label: "Ng\u01B0\u1EDDi d\u00F9ng", icon: _jsx(PeopleIcon, {}), path: "/users", active: isActive('/users'), collapsed: collapsed, onClick: () => handleNavigate('/users') }), _jsx(SidebarItem, { label: "Th\u00F4ng b\u00E1o", icon: _jsx(NotificationsIcon, {}), path: "/notifications", active: isActive('/notifications'), collapsed: collapsed, onClick: () => handleNavigate('/notifications') }), _jsx(SidebarItem, { label: "Xu\u1EA5t b\u00E1o c\u00E1o", icon: _jsx(FileDownloadIcon, {}), path: "/report-exports", active: isActive('/report-exports'), collapsed: collapsed, onClick: () => handleNavigate('/report-exports') })] }))] })] }));
};
// Component phụ: SidebarItem
const SidebarItem = ({ label, icon, path, active, collapsed, nested = false, onClick, }) => {
    return (_jsx(Tooltip, { title: collapsed ? label : '', placement: "right", arrow: true, children: _jsxs(ListItemButton, { onClick: onClick, selected: active, sx: {
                pl: collapsed ? 1.5 : nested ? 5 : 2.5,
                py: 1.1,
                mx: 1,
                borderRadius: 2,
                bgcolor: active ? 'primary.light' : 'transparent',
                '&:hover': {
                    bgcolor: 'primary.lighter',
                    transform: 'translateX(3px)',
                },
                transition: 'all 0.2s ease',
            }, children: [_jsx(ListItemIcon, { sx: {
                        minWidth: 0,
                        mr: collapsed ? 0 : 1.5,
                        color: active ? 'primary.main' : 'text.secondary',
                    }, children: icon }), !collapsed && (_jsx(ListItemText, { primary: label, primaryTypographyProps: {
                        fontWeight: active ? 600 : 400,
                        color: active ? 'primary.main' : 'text.primary',
                    } }))] }) }));
};
// Component phụ: group label
const SidebarSection = ({ label, collapsed, }) => (!collapsed && (_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, px: 2, pt: 2, pb: 0.5, color: 'text.secondary' }, children: label })));
export default Sidebar;
