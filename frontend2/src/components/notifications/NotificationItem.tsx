import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Package,
  Info,
} from 'lucide-react'
import type { NotificationData } from '@/types/notification'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: NotificationData
  onMarkAsRead: (notificationId: string) => void
  onClick?: (notification: NotificationData) => void
}

// Helper function to get notification icon based on content
const getNotificationIcon = (title: string, content: string) => {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()

  if (titleLower.includes('báo cáo sự cố') || contentLower.includes('báo cáo sự cố')) {
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />
  }
  if (titleLower.includes('sửa chữa') || contentLower.includes('sửa chữa')) {
    return <Wrench className="h-5 w-5 text-blue-500" />
  }
  if (titleLower.includes('thiết bị') || contentLower.includes('thiết bị')) {
    return <Package className="h-5 w-5 text-purple-500" />
  }
  if (titleLower.includes('đánh giá') || contentLower.includes('đánh giá')) {
    return <Info className="h-5 w-5 text-green-500" />
  }
  if (titleLower.includes('từ chối') || contentLower.includes('từ chối')) {
    return <XCircle className="h-5 w-5 text-red-500" />
  }
  if (titleLower.includes('duyệt') || contentLower.includes('duyệt')) {
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  return <Bell className="h-5 w-5 text-gray-500" />
}

// Helper function to get notification priority color
const getPriorityColor = (
  title: string,
  content: string
): 'default' | 'destructive' | 'secondary' | 'outline' => {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()

  if (titleLower.includes('từ chối') || contentLower.includes('từ chối')) {
    return 'destructive'
  }
  if (titleLower.includes('hoàn thành') || contentLower.includes('hoàn thành')) {
    return 'default'
  }
  if (titleLower.includes('mới') || contentLower.includes('mới')) {
    return 'secondary'
  }

  return 'outline'
}

// Helper function to get priority label
const getPriorityLabel = (title: string, content: string): string => {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()

  if (titleLower.includes('từ chối') || contentLower.includes('từ chối')) {
    return 'Từ chối'
  }
  if (titleLower.includes('hoàn thành') || contentLower.includes('hoàn thành')) {
    return 'Hoàn thành'
  }
  if (titleLower.includes('mới') || contentLower.includes('mới')) {
    return 'Mới'
  }
  return 'Thông tin'
}

const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return 'Vừa xong'

  try {
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z')
    const now = new Date()

    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    // Custom Vietnamese relative time
    if (diffMinutes < 1) return 'Vừa xong'
    if (diffMinutes < 60) return `${diffMinutes} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`

    // For older notifications, show absolute time
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.warn('Error formatting notification time:', error)
    return 'Vừa xong'
  }
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClick,
}) => {
  const handleClick = () => {
    // Mark as read if not already read
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }

    // Call onClick callback if provided
    if (onClick) {
      onClick(notification)
    }
  }

  const priorityColor = getPriorityColor(notification.title, notification.content)
  const priorityLabel = getPriorityLabel(notification.title, notification.content)
  const icon = getNotificationIcon(notification.title, notification.content)

  return (
    <Card
      className={cn(
        'mb-2 cursor-pointer transition-all hover:shadow-md',
        notification.isRead
          ? 'bg-card'
          : 'bg-primary/5 border-l-4 border-l-primary'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Notification Icon */}
          <div className="mt-0.5 flex-shrink-0">{icon}</div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={cn(
                  'text-sm font-medium leading-none flex-1',
                  notification.isRead ? 'text-muted-foreground' : 'text-foreground font-semibold'
                )}
              >
                {notification.title}
              </h4>

              {/* Unread Indicator */}
              {!notification.isRead && (
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {notification.content}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(notification.createdAt)}
              </span>

              {/* Priority Badge */}
              <Badge variant={priorityColor} className="h-5 text-xs">
                {priorityLabel}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NotificationItem

