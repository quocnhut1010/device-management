import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/AppLayout.tsx
import { Box } from '@mui/material';
import { useState } from 'react';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';
import { Outlet } from 'react-router-dom';
const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // mobile toggle
    const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse
    return (_jsxs(Box, { sx: { display: 'flex', height: '100vh', overflow: 'hidden' }, children: [_jsx(Sidebar, { isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false), collapsed: isCollapsed, onToggleCollapse: () => setIsCollapsed(!isCollapsed) }), _jsxs(Box, { sx: { flexGrow: 1, display: 'flex', flexDirection: 'column' }, children: [_jsx(HeaderBar, { onMenuClick: () => setIsSidebarOpen(true) }), _jsx(Box, { component: "main", sx: {
                            flexGrow: 1,
                            overflowY: 'auto',
                            p: 2,
                            bgcolor: '#f9f9f9',
                            mt: { xs: 0, sm: '14px' },
                        }, children: _jsx(Outlet, {}) })] })] }));
};
export default AppLayout;
