export interface NotificationData {
  id: string;
  userId?: string;
  title: string;
  content: string;
  isRead?: boolean;
  createdAt?: string;
  user?: {
    id: string;
    fullName: string;
  };
}

export interface NotificationResponse {
  success: boolean;
  data: NotificationData[];
  message?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
  message?: string;
}

export interface NotificationMarkReadResponse {
  success: boolean;
  message: string;
}

export interface CreateNotificationRequest {
  userId?: string;
  userIds?: string[];
  title: string;
  content: string;
}

export enum NotificationType {
  INCIDENT_REPORT_NEW = 'incident_report_new',
  INCIDENT_REPORT_APPROVED = 'incident_report_approved', 
  INCIDENT_REPORT_REJECTED = 'incident_report_rejected',
  REPAIR_ASSIGNED = 'repair_assigned',
  REPAIR_COMPLETED = 'repair_completed',
  REPAIR_REJECTED = 'repair_rejected',
  DEVICE_ASSIGNED = 'device_assigned',
  DEVICE_REPLACED = 'device_replaced',
  REPAIR_FEEDBACK = 'repair_feedback'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal', 
  HIGH = 'high',
  URGENT = 'urgent'
}