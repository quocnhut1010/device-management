import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Badge,
  InputBase,
  alpha,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings,
  Logout,
} from '@mui/icons-material';

import { useState } from 'react';
import { getUserFromToken, logout } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import UserProfileDialog from '../user/UserProfileDialog';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { UserDto } from '../../types/UserDto';
import  useNotification  from '../../hooks/useNotification';

interface HeaderBarProps {
  onMenuClick: () => void;
}

const HeaderBar = ({ onMenuClick }: HeaderBarProps) => {
  const navigate = useNavigate();
  const user = getUserFromToken(); // lấy từ JWT
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const roleLabel = user?.role === 'Admin' ? 'Quản trị viên' : 'Người dùng';

  const { notify } = useNotification();

  // Avatar dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Notification dropdown
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const openNotif = Boolean(notifAnchor);
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => setNotifAnchor(event.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  // Profile dialog
  const [openProfile, setOpenProfile] = useState(false);
  const [profile, setProfile] = useState<UserDto | null>(null);

  const handleOpenProfile = async () => {
    try {
      const res = await getUserProfile(); // ✅ gọi API lấy thông tin profile của user hiện tại
      setProfile(res.data);
      setOpenProfile(true);
    } catch {
      notify('Không thể tải thông tin người dùng', 'error');
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={3}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        zIndex: theme.zIndex.drawer + 1,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        {/* Left: Menu + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight="bold" noWrap>
            Device Manager
          </Typography>
        </Box>

        {/* Middle: Search bar */}
        {!isMobile && (
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.grey[300], 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[300], 0.25),
              },
              width: '100%',
              maxWidth: 300,
              mr: 2,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                pl: 2,
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Tìm kiếm thiết bị..."
              sx={{ pl: 5, width: '100%', height: 40 }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Box>
        )}

        {/* Right: Notification, user */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton onClick={handleNotifClick}>
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={notifAnchor} open={openNotif} onClose={handleNotifClose}>
            <MenuItem disabled>🔔 Báo cáo sự cố mới</MenuItem>
            <MenuItem disabled>🛠️ Thiết bị đang được sửa</MenuItem>
          </Menu>

          {/* Role label */}
          <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
            {roleLabel}
          </Typography>

          {/* Avatar */}
          <Tooltip title="Tài khoản">
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar>{user?.email?.charAt(0).toUpperCase()}</Avatar>
            </IconButton>
          </Tooltip>

          {/* Dropdown Menu */}
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem disabled>{user?.email}</MenuItem>
            <Divider />
            <MenuItem onClick={handleOpenProfile}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Cài đặt
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Profile Dialog */}
      {profile && (
        <UserProfileDialog
          open={openProfile}
          onClose={() => setOpenProfile(false)}
          user={profile}
          onSubmit={(updated) => {
            if (!user || !profile) return;
            const payload: UserDto = { ...profile, ...updated } as UserDto;
            updateUserProfile(payload)
              .then(() => {
                notify('Cập nhật thành công', 'success');
                setOpenProfile(false);
              })
              .catch(() => notify('Lỗi khi cập nhật', 'error'));
          }}
        />
      )}
    </AppBar>
  );
};

export default HeaderBar;
