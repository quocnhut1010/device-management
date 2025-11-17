import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import type { NotificationData } from '@/types/notification'

export function NotificationWidget() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        const data = await notificationService.getNotifications()
        setNotifications(data)
      } catch (error) {
        console.error('Error loading notifications:', error)
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const getIcon = (title: string, content: string) => {
    const text = (title + ' ' + content).toLowerCase()
    if (text.includes('error') || text.includes('lỗi') || text.includes('thất bại')) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (text.includes('warning') || text.includes('cảnh báo') || text.includes('chú ý')) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
    if (text.includes('success') || text.includes('thành công') || text.includes('hoàn thành')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (text.includes('info') || text.includes('thông tin')) {
      return <Info className="h-4 w-4 text-blue-500" />
    }
    return <Bell className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recent Notifications
        </CardTitle>
        <CardDescription>Latest system notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No new notifications</div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 p-3 rounded-lg border ${
                    notification.isRead ? 'bg-muted/50' : 'bg-background'
                  }`}
                >
                  <div className="mt-0.5">{getIcon(notification.title, notification.content)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.isRead && (
                        <Badge variant="default" className="h-5 px-1.5 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.content}</p>
                    {notification.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
