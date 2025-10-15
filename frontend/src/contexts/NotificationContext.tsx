import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { NotificationData } from '../types/notification';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  showNewNotificationToast: (notification: NotificationData) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);
  
  const { user, token } = useAuth();

  // Fetch notifications
  const refreshNotifications = useCallback(async () => {
    if (!token || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      setLastCheckTime(new Date().toISOString());
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
      console.error('Error refreshing notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Show toast notification for new notifications
  const showNewNotificationToast = useCallback((notification: NotificationData) => {
    // Add to notifications list if not already present
    setNotifications(prev => {
      const exists = prev.find(n => n.id === notification.id);
      if (exists) return prev;
      
      return [notification, ...prev];
    });
    
    // Update unread count if notification is unread
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico', // Adjust icon path as needed
        tag: notification.id // Prevent duplicate notifications
      });
    }
  }, []);

  // Clear notifications method
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setLastCheckTime(null);
    setError(null);
  }, []);

  // Polling for new notifications
  useEffect(() => {
    if (!token || !user) return;

    const pollInterval = setInterval(async () => {
      try {
        const newNotifications = await notificationService.getLatestNotifications(lastCheckTime || undefined);
        
        if (newNotifications.length > 0) {
          // Show toasts for new notifications
          newNotifications.forEach(notification => {
            showNewNotificationToast(notification);
          });
          
          setLastCheckTime(new Date().toISOString());
        }
        
        // Update unread count
        const currentUnreadCount = await notificationService.getUnreadCount();
        setUnreadCount(currentUnreadCount);
      } catch (err) {
        console.warn('Polling error (non-critical):', err);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [token, user, lastCheckTime, showNewNotificationToast]);

  // User change detection and immediate notification clearing
  useEffect(() => {
    const currentUserId = user?.nameid || null;
    
    if (token && user) {
      // Check if user actually changed
      if (previousUserId !== null && previousUserId !== currentUserId) {
        // User changed - clear immediately
        console.log('User changed, clearing notifications immediately');
        setNotifications([]);
        setUnreadCount(0);
        setLastCheckTime(null);
        setError(null);
      }
      setPreviousUserId(currentUserId);
      // Load notifications for current user
      refreshNotifications();
    } else {
      // Clear notifications when user logs out
      console.log('User logged out, clearing notifications');
      setNotifications([]);
      setUnreadCount(0);
      setLastCheckTime(null);
      setError(null);
      setPreviousUserId(null);
    }
  }, [token, user?.nameid, refreshNotifications]);

  // Separate effect to track previous user ID changes
  useEffect(() => {
    const currentUserId = user?.nameid || null;
    
    // Only update previous user ID when it actually changes
    if (previousUserId !== currentUserId) {
      // If we had a previous user and now have a different user, clear notifications
      if (previousUserId !== null && currentUserId !== null && previousUserId !== currentUserId) {
        console.log(`User ID changed from ${previousUserId} to ${currentUserId}`);
      }
      setPreviousUserId(currentUserId);
    }
  }, [user?.nameid, previousUserId]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    showNewNotificationToast,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;