import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  DevicesOther as DevicesOtherIcon
} from '@mui/icons-material';
import { NotificationData } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatDateVN } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (notificationId: string) => void;
  onClick?: (notification: NotificationData) => void;
}

// Helper function to get notification icon based on content
const getNotificationIcon = (title: string, content: string) => {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  if (titleLower.includes('báo cáo sự cố') || contentLower.includes('báo cáo sự cố')) {
    return <WarningIcon color="warning" />;
  }
  if (titleLower.includes('sửa chữa') || contentLower.includes('sửa chữa')) {
    return <BuildIcon color="info" />;
  }
  if (titleLower.includes('thiết bị') || contentLower.includes('thiết bị')) {
    return <DevicesOtherIcon color="primary" />;
  }
  if (titleLower.includes('đánh giá') || contentLower.includes('đánh giá')) {
    return <InfoIcon color="success" />;
  }
  if (titleLower.includes('từ chối') || contentLower.includes('từ chối')) {
    return <ErrorIcon color="error" />;
  }
  if (titleLower.includes('duyệt') || contentLower.includes('duyệt')) {
    return <CheckCircleIcon color="success" />;
  }

  return <NotificationsIcon color="action" />;
};

// Helper function to get notification priority color
const getPriorityColor = (title: string, content: string) => {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  if (titleLower.includes('từ chối') || contentLower.includes('từ chối')) {
    return 'error';
  }
  if (titleLower.includes('hoàn thành') || contentLower.includes('hoàn thành')) {
    return 'success';
  }
  if (titleLower.includes('mới') || contentLower.includes('mới')) {
    return 'warning';
  }
  
  return 'info';
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClick
}) => {
  const handleClick = () => {
    // Mark as read if not already read
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    // Call onClick callback if provided
    if (onClick) {
      onClick(notification);
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Vừa xong';
    
    try {
      // Use proper Vietnam timezone conversion
      const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
      const now = new Date();
      
      // Convert to Vietnam timezone for comparison
      const vnTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const vnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      
      const diffMs = vnNow.getTime() - vnTime.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Custom Vietnamese relative time
      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      
      // For older notifications, show absolute time in VN timezone
      return formatDateVN(dateString, true);
    } catch (error) {
      console.warn('Error formatting notification time:', error);
      return 'Vừa xong';
    }
  };

  const priorityColor = getPriorityColor(notification.title, notification.content);
  const icon = getNotificationIcon(notification.title, notification.content);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: notification.isRead 
          ? 'background.paper' 
          : (theme) => alpha(theme.palette.primary.main, 0.05),
        borderLeft: notification.isRead 
          ? 'none' 
          : (theme) => `3px solid ${theme.palette[priorityColor as 'info' | 'warning' | 'error' | 'success'].main}`,
        '&:hover': {
          backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.1),
          transform: 'translateY(-1px)',
          boxShadow: 1
        }
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Notification Icon */}
          <Box sx={{ mt: 0.5 }}>
            {icon}
          </Box>

          {/* Notification Content */}
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography
                variant="subtitle2"
                fontWeight={notification.isRead ? 'normal' : 'bold'}
                color={notification.isRead ? 'text.secondary' : 'text.primary'}
                noWrap
                sx={{ flex: 1 }}
              >
                {notification.title}
              </Typography>

              {/* Unread Indicator */}
              {!notification.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    flexShrink: 0
                  }}
                />
              )}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1,
                lineHeight: 1.4
              }}
            >
              {notification.content}
            </Typography>

            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Tooltip 
                title={notification.createdAt ? formatDateVN(notification.createdAt, true) : ''}
                placement="bottom-start"
              >
                <Typography variant="caption" color="text.disabled" sx={{ cursor: 'help' }}>
                  {formatTimeAgo(notification.createdAt)}
                </Typography>
              </Tooltip>

              {/* Priority Chip */}
              <Chip
                size="small"
                label={
                  priorityColor === 'error' ? 'Từ chối' :
                  priorityColor === 'success' ? 'Hoàn thành' :
                  priorityColor === 'warning' ? 'Mới' : 'Thông tin'
                }
                color={priorityColor as 'error' | 'success' | 'warning' | 'info'}
                variant="outlined"
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </Box>
          </Box>

          {/* Mark as Read Button */}
          {!notification.isRead && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              sx={{ 
                opacity: 0.7,
                '&:hover': { opacity: 1 }
              }}
            >
              <CircleIcon sx={{ fontSize: 12 }} color="primary" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;