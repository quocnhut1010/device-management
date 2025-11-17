import React from 'react'
import { Bell, Check, CheckCheck, Trash2, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useNotifications } from '@/contexts/NotificationContext'
import type { NotificationData } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function NotificationsPopover() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const getNotificationIcon = (type: string, title: string, content: string) => {
    const titleLower = title.toLowerCase()
    const contentLower = content.toLowerCase()

    if (titleLower.includes('báo cáo sự cố') || contentLower.includes('báo cáo sự cố')) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
    if (titleLower.includes('sửa chữa') || contentLower.includes('sửa chữa')) {
      return <CheckCircle className="h-5 w-5 text-blue-500" />
    }
    if (titleLower.includes('thiết bị') || contentLower.includes('thiết bị')) {
      return <Info className="h-5 w-5 text-purple-500" />
    }
    if (titleLower.includes('đánh giá') || contentLower.includes('đánh giá')) {
      return <Info className="h-5 w-5 text-green-500" />
    }
    if (titleLower.includes('từ chối') || contentLower.includes('từ chối')) {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }
    if (titleLower.includes('duyệt') || contentLower.includes('duyệt')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }

    // Fallback based on type
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDeleteNotification = (id: string) => {
    // Note: Backend might not have delete endpoint, so this is just UI removal
    // In a real implementation, you'd call a delete API
    console.log('Delete notification:', id)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-3">
          <div>
            <h3 className="font-semibold text-base">Thông báo</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bạn có {unreadCount} thông báo chưa đọc
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs">
              <CheckCheck className="h-4 w-4 mr-1" />
              Đọc tất cả
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: NotificationData) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent/50 transition-colors ${
                    !notification.isRead ? 'bg-accent/30' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(
                        'info', // type from notification if available
                        notification.title,
                        notification.content
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium leading-tight">{notification.title}</h4>
                        {!notification.isRead && (
                          <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {notification.createdAt
                              ? formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: vi,
                                })
                              : 'Vừa xong'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-7 px-2 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Đánh dấu đã đọc
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="h-7 w-7"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

