import React from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

const NotificationDebug: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    refreshNotifications,
    markAllAsRead 
  } = useNotifications();
  
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography>Please login to test notifications</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification System Debug
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2">
              User: {user.email} ({user.role} - {user.position})
            </Typography>
            <Typography variant="body2">
              Unread Count: {unreadCount}
            </Typography>
            <Typography variant="body2">
              Total Notifications: {notifications.length}
            </Typography>
            <Typography variant="body2">
              Loading: {isLoading ? 'Yes' : 'No'}
            </Typography>
            {error && (
              <Typography variant="body2" color="error">
                Error: {error}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              onClick={refreshNotifications}
              disabled={isLoading}
            >
              Refresh Notifications
            </Button>
            <Button 
              variant="outlined" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
          </Stack>

          <Box>
            <Typography variant="subtitle2">Recent Notifications:</Typography>
            {notifications.slice(0, 3).map((notification) => (
              <Box key={notification.id} sx={{ p: 1, border: 1, borderColor: 'divider', mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.content}
                </Typography>
                <Typography variant="caption" display="block">
                  Read: {notification.isRead ? 'Yes' : 'No'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NotificationDebug;