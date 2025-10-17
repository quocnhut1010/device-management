// src/components/layout/Sidebar.tsx
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
  Collapse,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

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
import GroupWorkIcon from '@mui/icons-material/GroupWork';

const drawerWidth = 240;
const collapsedWidth = 72;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = ({}: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(!isMobile);
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(false);

  const user = getUserFromToken();
  const role = user?.role ?? 'User';
  const position = user?.position;

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) setOpen(false);
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          backgroundColor: '#f9fafb',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        {!collapsed && (
          <Typography variant="subtitle1" fontWeight={700}>
            Device Manager
          </Typography>
        )}
        <IconButton
          onClick={() => (isMobile ? setOpen(false) : setCollapsed(!collapsed))}
          size="small"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
      <Divider />

      <List disablePadding>
        {/* Dashboard */}
        <SidebarSection label="Bảng điều khiển" collapsed={collapsed} />
        <SidebarItem
          label="Dashboard"
          icon={<DashboardIcon />}
          path="/dashboard"
          active={isActive('/dashboard')}
          collapsed={collapsed}
          onClick={() => handleNavigate('/dashboard')}
        />

        {/* Quản lý thiết bị */}
        <SidebarSection label="Quản lý thiết bị" collapsed={collapsed} />
        <SidebarItem
          label="Danh sách thiết bị"
          icon={<DevicesIcon />}
          path="/devices"
          active={isActive('/devices')}
          collapsed={collapsed}
          onClick={() => handleNavigate('/devices')}
        />

        {/* Danh mục thiết bị (Submenu toggle) */}
        {role === 'Admin' && (
          <>
            <Tooltip title={collapsed ? 'Danh mục thiết bị' : ''} placement="right" arrow>
              <ListItemButton
                onClick={() => setOpenSubmenu(!openSubmenu)}
                sx={{
                  px: collapsed ? 1.5 : 2.5,
                  py: 1.2,
                  mx: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'primary.lighter',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5 }}>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText primary="Danh mục thiết bị" primaryTypographyProps={{ fontWeight: 500 }} />
                )}
                {!collapsed && (openSubmenu ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </Tooltip>

            <Collapse in={openSubmenu && !collapsed} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <SidebarItem
                  label="Mẫu thiết bị"
                  icon={<MemoryIcon />}
                  path="/device-models"
                  active={isActive('/device-models')}
                  collapsed={collapsed}
                  nested
                  onClick={() => handleNavigate('/device-models')}
                />
                <SidebarItem
                  label="Loại thiết bị"
                  icon={<CategoryIcon />}
                  path="/device-types"
                  active={isActive('/device-types')}
                  collapsed={collapsed}
                  nested
                  onClick={() => handleNavigate('/device-types')}
                />
                <SidebarItem
                  label="Nhà cung cấp"
                  icon={<BusinessIcon />}
                  path="/suppliers"
                  active={isActive('/suppliers')}
                  collapsed={collapsed}
                  nested
                  onClick={() => handleNavigate('/suppliers')}
                />
              </List>
            </Collapse>
          </>
        )}

        {/* Cơ cấu tổ chức */}
        <SidebarSection label="Cơ cấu tổ chức" collapsed={collapsed} />
        <SidebarItem
          label="Phòng ban"
          icon={<ApartmentIcon />}
          path="/departments"
          active={isActive('/departments')}
          collapsed={collapsed}
          onClick={() => handleNavigate('/departments')}
        />

        {/* Vận hành & Lịch sử */}
        <SidebarSection label="Vận hành & Lịch sử" collapsed={collapsed} />
        {role === 'Admin' && (
          <SidebarItem
            label="Cấp phát"
            icon={<AssignmentIcon />}
            path="/assignments"
            active={isActive('/assignments')}
            collapsed={collapsed}
            onClick={() => handleNavigate('/assignments')}
          />
        )}

        {/* Trưởng phòng: Xem thiết bị của phòng ban */}
        {/* {position === 'Trưởng phòng' && (
          <SidebarItem 
            label="Thiết bị phòng ban" 
            icon={<GroupWorkIcon />} 
            path="/department-devices" 
            active={isActive('/department-devices')} 
            collapsed={collapsed} 
            onClick={() => handleNavigate('/department-devices')} 
          />
        )} */}
        {/* Báo cáo sự cố - Tất cả user đã login */}
        {(role === 'Admin' || position === 'Nhân viên' || position === 'Trưởng phòng') && (
        <SidebarItem label="Báo cáo sự cố" icon={<ReportProblemIcon />} path="/incidents" active={isActive('/incidents')} collapsed={collapsed} onClick={() => handleNavigate('/incidents')} />
        )}

        {/* Sửa chữa - Admin hoặc Kỹ thuật viên */}
        {(role === 'Admin' || position === 'Kỹ thuật viên') && (
          <SidebarItem label="Sửa chữa" icon={<BuildIcon />} path="/repairs" active={isActive('/repairs')} collapsed={collapsed} onClick={() => handleNavigate('/repairs')} />
        )}

        {/* Thay thế - All users can view, Admin can create */}
         {(role === 'Admin' || position === 'Nhân viên' || position === 'Trưởng phòng') && (
        <SidebarItem 
          label="Thay thế" 
          icon={<SwapHorizIcon />} 
          path="/replacements" 
          active={isActive('/replacements')} 
          collapsed={collapsed} 
          onClick={() => handleNavigate('/replacements')} 
        />
         )}
        <SidebarItem 
          label="Lịch sử hệ thống" 
          icon={<HistoryIcon />} 
          path="/device-history" 
          active={isActive('/device-history')} 
          collapsed={collapsed} 
          onClick={() => handleNavigate('/device-history')} 
        />
        {role === 'Admin' && (
          <SidebarItem label="Thanh lý" icon={<DeleteSweepIcon />} path="/liquidation" active={isActive('/liquidation')} collapsed={collapsed} onClick={() => handleNavigate('/liquidation')} />
        )}

        {/* Người dùng & Hệ thống */}
        {role === 'Admin' && (
          <>
            <SidebarSection label="Người dùng & Hệ thống" collapsed={collapsed} />
            <SidebarItem label="Người dùng" icon={<PeopleIcon />} path="/users" active={isActive('/users')} collapsed={collapsed} onClick={() => handleNavigate('/users')} />
            <SidebarItem label="Thông báo" icon={<NotificationsIcon />} path="/notifications" active={isActive('/notifications')} collapsed={collapsed} onClick={() => handleNavigate('/notifications')} />
            <SidebarItem label="Xuất báo cáo" icon={<FileDownloadIcon />} path="/report-exports" active={isActive('/report-exports')} collapsed={collapsed} onClick={() => handleNavigate('/report-exports')} />
          </>
        )}
      </List>
    </Drawer>
  );
};

// Component phụ: SidebarItem
const SidebarItem = ({
  label,
  icon,
  path,
  active,
  collapsed,
  nested = false,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  path: string;
  active: boolean;
  collapsed: boolean;
  nested?: boolean;
  onClick: () => void;
}) => {
  return (
    <Tooltip title={collapsed ? label : ''} placement="right" arrow>
      <ListItemButton
        onClick={onClick}
        selected={active}
        sx={{
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
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: collapsed ? 0 : 1.5,
            color: active ? 'primary.main' : 'text.secondary',
          }}
        >
          {icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontWeight: active ? 600 : 400,
              color: active ? 'primary.main' : 'text.primary',
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
};

// Component phụ: group label
const SidebarSection = ({
  label,
  collapsed,
}: {
  label: string;
  collapsed: boolean;
}) => (
  !collapsed && (
    <Typography
      variant="caption"
      sx={{ fontWeight: 600, px: 2, pt: 2, pb: 0.5, color: 'text.secondary' }}
    >
      {label}
    </Typography>
  )
);

export default Sidebar;
