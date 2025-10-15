import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  Box,
  Fade
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

interface NotificationBellProps {
  color?: 'inherit' | 'default' | 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  color = 'inherit',
  size = 'medium'
}) => {
  const { unreadCount, isLoading, refreshNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Refresh notifications when bell is clicked to ensure latest data
    refreshNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getBellIcon = () => {
    // Show active icon if there are unread notifications or when hovered
    if (unreadCount > 0 || isHovered) {
      return <NotificationsActiveIcon />;
    }
    return <NotificationsIcon />;
  };

  const getBadgeContent = () => {
    if (isLoading) return undefined;
    if (unreadCount === 0) return undefined;
    if (unreadCount > 99) return '99+';
    return unreadCount;
  };

  return (
    <>
      <Tooltip title="Thông báo">
        <Box
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <IconButton
            color={color}
            size={size}
            onClick={handleClick}
            sx={{
              position: 'relative',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.1)',
                bgcolor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)'
              },
              // Bell shake animation when there are new notifications
              ...(unreadCount > 0 && {
                '@keyframes bellShake': {
                  '0%': { transform: 'rotate(0)' },
                  '10%': { transform: 'rotate(-10deg)' },
                  '20%': { transform: 'rotate(10deg)' },
                  '30%': { transform: 'rotate(-10deg)' },
                  '40%': { transform: 'rotate(10deg)' },
                  '50%': { transform: 'rotate(0)' },
                  '100%': { transform: 'rotate(0)' }
                },
                '&:hover': {
                  animation: 'bellShake 0.5s ease-in-out'
                }
              })
            }}
          >
            <Badge
              badgeContent={getBadgeContent()}
              color="error"
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  height: 20,
                  minWidth: 20,
                  padding: '0 5px',
                  fontWeight: '600',
                  border: '2px solid',
                  borderColor: 'background.paper',
                  borderRadius: '50%',
                  top: 2,
                  right: 2,
                  // Enhanced styling
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  // Pulse animation for new notifications
                  ...(unreadCount > 0 && {
                    '@keyframes pulse': {
                      '0%': { 
                        transform: 'scale(1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      },
                      '50%': { 
                        transform: 'scale(1.15)',
                        boxShadow: '0 3px 6px rgba(255,0,0,0.4)'
                      },
                      '100%': { 
                        transform: 'scale(1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }
                    },
                    animation: 'pulse 2.5s ease-in-out infinite'
                  })
                }
              }}
            >
              <Fade in={true} timeout={200}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: unreadCount > 0 ? 'warning.main' : 'inherit',
                    transition: 'color 0.2s ease-in-out'
                  }}
                >
                  {getBellIcon()}
                </Box>
              </Fade>
            </Badge>
          </IconButton>
        </Box>
      </Tooltip>

      {/* Notification Dropdown */}
      <NotificationDropdown
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      />
    </>
  );
};

export default NotificationBell;