import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground">Quản lý và xem các thông báo hệ thống</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Thông báo hệ thống
          </CardTitle>
          <CardDescription>Danh sách các thông báo từ hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có thông báo nào</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

