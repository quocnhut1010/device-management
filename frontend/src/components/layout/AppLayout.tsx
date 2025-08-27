// src/components/layout/AppLayout.tsx
import { Box } from '@mui/material';
import { useState } from 'react';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Khối bên phải */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <HeaderBar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Nội dung chính */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: '#f9f9f9',
            mt: { xs: 0, sm: '14px' },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
