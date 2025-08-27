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
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
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
  const [] = useState<Record<string, boolean>>({});
  const user = getUserFromToken();
  const role = user?.role ?? 'User';


const menuConfig = [
  {
    label: 'Bảng điều khiển',
    items: [{ label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' }],
  },
  {
    label: 'Quản lý thiết bị',
    items: [
      { label: 'Danh sách thiết bị', icon: <DevicesIcon />, path: '/devices' },
      ...(role === 'Admin'
        ? [
            { label: 'Mẫu thiết bị', icon: <MemoryIcon />, path: '/device-models' },
            { label: 'Loại thiết bị', icon: <CategoryIcon />, path: '/device-types' },
            { label: 'Nhà cung cấp', icon: <BusinessIcon />, path: '/suppliers' },
          ]
        : []),
    ],
  },
  {
    label: 'Cơ cấu tổ chức',
    items: [
      { label: 'Phòng ban', icon: <ApartmentIcon />, path: '/departments' }, // Cho cả Admin và User
    ],
  },
  {
    label: 'Vận hành & Lịch sử',
    items: [
      { label: 'Cấp phát', icon: <AssignmentIcon />, path: '/assignments' },
      { label: 'Sửa chữa', icon: <BuildIcon />, path: '/repairs' },
      { label: 'Báo cáo sự cố', icon: <ReportProblemIcon />, path: '/incidents' },
      ...(role === 'Admin'
        ? [
            { label: 'Thay thế', icon: <SwapHorizIcon />, path: '/replacements' },
            { label: 'Thanh lý', icon: <DeleteSweepIcon />, path: '/liquidations' },
            { label: 'Lịch sử thiết bị', icon: <HistoryIcon />, path: '/device-histories' },
          ]
        : []),
    ],
  },
  ...(role === 'Admin'
    ? [
        {
          label: 'Người dùng & Hệ thống',
          items: [
            { label: 'Người dùng', icon: <PeopleIcon />, path: '/users' },
            { label: 'Thông báo', icon: <NotificationsIcon />, path: '/notifications' },
            { label: 'Xuất báo cáo', icon: <FileDownloadIcon />, path: '/report-exports' },
          ],
        },
      ]
    : []),
];


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

      {/* Menu rendering */}
      <List disablePadding>
        {menuConfig.map((section) => (
          <Box key={section.label}>
            {!collapsed && (
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, px: 2, pt: 2, pb: 0.5, color: 'text.secondary' }}
              >
                {section.label}
              </Typography>
            )}

            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Tooltip
                  title={collapsed ? item.label : ''}
                  placement="right"
                  key={item.label}
                  arrow
                >
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={isActive}
                    sx={{
                      px: collapsed ? 1.5 : 2.5,
                      py: 1.2,
                      my: 0.5,
                      borderRadius: 2,
                      mx: 1,
                      bgcolor: isActive ? 'primary.light' : 'transparent',
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
                        color: isActive ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'primary.main' : 'text.primary',
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
