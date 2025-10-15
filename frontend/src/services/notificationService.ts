import axiosClient from './axios';
import { 
  NotificationData, 
  NotificationResponse, 
  UnreadCountResponse, 
  NotificationMarkReadResponse,
  CreateNotificationRequest 
} from '../types/notification';

const NOTIFICATION_API_BASE = '/notification';

export const notificationService = {
  // Lấy danh sách thông báo của user hiện tại
  async getNotifications(isRead?: boolean): Promise<NotificationData[]> {
    try {
      const params = isRead !== undefined ? { isRead } : {};
      const response = await axiosClient.get<NotificationResponse>(NOTIFICATION_API_BASE, { params });
      
      if (response.data.success) {
        return response.data.data || [];
      }
      throw new Error(response.data.message || 'Failed to fetch notifications');
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch notifications');
    }
  },

  // Lấy số thông báo chưa đọc
  async getUnreadCount(): Promise<number> {
    try {
      const response = await axiosClient.get<UnreadCountResponse>(`${NOTIFICATION_API_BASE}/unread-count`);
      
      if (response.data.success) {
        return response.data.data.unreadCount || 0;
      }
      throw new Error(response.data.message || 'Failed to fetch unread count');
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      // Return 0 instead of throwing error to avoid breaking UI
      return 0;
    }
  },

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await axiosClient.put<NotificationMarkReadResponse>(
        `${NOTIFICATION_API_BASE}/${notificationId}/read`
      );
      
      return response.data.success;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark as read');
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await axiosClient.put<NotificationMarkReadResponse>(
        `${NOTIFICATION_API_BASE}/mark-all-read`
      );
      
      return response.data.success;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark all as read');
    }
  },

  // Tạo thông báo (chỉ dành cho admin hoặc testing)
  async createNotification(request: CreateNotificationRequest): Promise<boolean> {
    try {
      const response = await axiosClient.post<NotificationMarkReadResponse>(
        NOTIFICATION_API_BASE,
        request
      );
      
      return response.data.success;
    } catch (error: any) {
      console.error('Error creating notification:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create notification');
    }
  },

  // Lấy thông báo mới (để polling)
  async getLatestNotifications(lastCheckTime?: string): Promise<NotificationData[]> {
    try {
      const notifications = await this.getNotifications();
      
      // Nếu có lastCheckTime, chỉ trả về notifications mới hơn
      if (lastCheckTime) {
        return notifications.filter(notification => 
          notification.createdAt && new Date(notification.createdAt) > new Date(lastCheckTime)
        );
      }
      
      return notifications;
    } catch (error) {
      console.error('Error fetching latest notifications:', error);
      return [];
    }
  }
};

export default notificationService;