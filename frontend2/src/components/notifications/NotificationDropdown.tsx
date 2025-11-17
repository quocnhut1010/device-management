import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Bell, RefreshCw, CheckCheck, X } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import type { NotificationData } from '@/types/notification'
import NotificationItem from './NotificationItem'
import { cn } from '@/lib/utils'

interface NotificationDropdownProps {
  open: boolean
  onClose: () => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ open, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const [tabValue, setTabValue] = useState('all')

  // Filter notifications based on tab selection
  const getFilteredNotifications = (): NotificationData[] => {
    switch (tabValue) {
      case 'unread':
        return notifications.filter((n) => !n.isRead)
      case 'read':
        return notifications.filter((n) => n.isRead)
      default: // 'all'
        return notifications
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadNotifications = notifications.filter((n) => !n.isRead)

  const handleTabChange = (value: string) => {
    setTabValue(value)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleRefresh = async () => {
    try {
      await refreshNotifications()
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    }
  }

  const handleNotificationClick = (notification: NotificationData) => {
    // You can add navigation logic here based on notification type
    console.log('Notification clicked:', notification)
    // For example, navigate to relevant page based on notification content
    onClose()
  }

  if (!open) return null

  return (
    <Card className="absolute right-0 mt-2 w-96 z-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Thông báo
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Làm mới"
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleMarkAllAsRead}
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
            title="Đóng"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Tabs */}
        <Tabs value={tabValue} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="all" className="flex-1">
              Tất cả ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 relative">
              Chưa đọc
              {unreadNotifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                >
                  {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="flex-1">
              Đã đọc ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <TabsContent value={tabValue} className="mt-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="p-4">
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground text-center">
                    {tabValue === 'unread'
                      ? 'Không có thông báo chưa đọc'
                      : tabValue === 'read'
                        ? 'Không có thông báo đã đọc'
                        : 'Chưa có thông báo nào'}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default NotificationDropdown

