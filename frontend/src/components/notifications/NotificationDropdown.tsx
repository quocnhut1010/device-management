import React, { useState } from 'react';
import {
  Box,
  Popover,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  DoneAll as DoneAllIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import { NotificationData } from '../../types/notification';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  anchorEl,
  open,
  onClose
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Filter notifications based on tab selection
  const getFilteredNotifications = () => {
    switch (tabValue) {
      case 1: // Unread only
        return notifications.filter(n => !n.isRead);
      case 2: // Read only
        return notifications.filter(n => n.isRead);
      default: // All
        return notifications;
    }
  };

  // Role-based notification filtering (additional layer)
  const getRoleBasedNotifications = (notifs: NotificationData[]) => {
    if (!user) return notifs;
    
    // Admin sees all notifications
    if (user.role === 'Admin') {
      return notifs;
    }
    
    // Filter based on role and content
    return notifs.filter(notification => {
      const title = notification.title.toLowerCase();
      const content = notification.content.toLowerCase();
      
      if (user.position === 'Kỹ thuật viên') {
        // Technician sees repair-related notifications
        return title.includes('sửa chữa') || 
               title.includes('phân công') ||
               title.includes('đánh giá') ||
               content.includes('sửa chữa') ||
               content.includes('phân công') ||
               content.includes('đánh giá');
      }
      
      if (user.position === 'Nhân viên' || user.position === 'Trưởng phòng') {
        // Employee/Manager sees device and incident-related notifications
        return title.includes('báo cáo') ||
               title.includes('thiết bị') ||
               title.includes('duyệt') ||
               title.includes('từ chối') ||
               content.includes('báo cáo') ||
               content.includes('thiết bị') ||
               content.includes('duyệt') ||
               content.includes('từ chối');
      }
      
      return true; // Default: show all
    });
  };

  const filteredNotifications = getRoleBasedNotifications(getFilteredNotifications());
  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    // You can add navigation logic here based on notification type
    console.log('Notification clicked:', notification);
    // For example, navigate to relevant page based on notification content
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 600,
          mt: 1,
          boxShadow: (theme) => theme.shadows[8]
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon />
          Thông báo
          {unreadCount > 0 && (
            <Box
              sx={{
                ml: 1,
                minWidth: 22,
                height: 20,
                backgroundColor: 'error.main',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 0.75,
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Box>
          )}
        </Typography>

        <Box display="flex" gap={1}>
          <Tooltip title="Làm mới">
            <IconButton size="small" onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {unreadCount > 0 && (
            <Tooltip title="Đánh dấu tất cả đã đọc">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          size="small"
        >
          <Tab 
            label={`Tất cả (${notifications.length})`}
            sx={{ minHeight: 40, py: 1 }}
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                Chưa đọc
                {unreadNotifications.length > 0 && (
                  <Box
                    sx={{
                      minWidth: 20,
                      height: 18,
                      backgroundColor: 'error.main',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.5
                    }}
                  >
                    {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                  </Box>
                )}
              </Box>
            }
            sx={{ minHeight: 40, py: 1 }}
          />
          <Tab 
            label={`Đã đọc (${notifications.length - unreadCount})`}
            sx={{ minHeight: 40, py: 1 }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box p={2}>
            <Alert severity="error" size="small">
              {error}
            </Alert>
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
            px={2}
          >
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" align="center">
              {tabValue === 1 ? 'Không có thông báo chưa đọc' : 
               tabValue === 2 ? 'Không có thông báo đã đọc' : 
               'Chưa có thông báo nào'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 1 }}>
            {filteredNotifications.map((notification, index) => (
              <ListItem key={notification.id} sx={{ p: 0 }}>
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClick={handleNotificationClick}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <>
          <Divider />
          <Box p={1}>
            <Button
              fullWidth
              size="small"
              variant="text"
              onClick={() => {
                // Navigate to full notifications page if you have one
                console.log('View all notifications');
                onClose();
              }}
            >
              Xem tất cả thông báo
            </Button>
          </Box>
        </>
      )}
    </Popover>
  );
};

export default NotificationDropdown;