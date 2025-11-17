import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeftRight, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import ReplacementHistoryList from '@/components/replacement/ReplacementHistoryList'

export default function ReplacementsPage() {
  const [activeTab, setActiveTab] = useState('history')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()

  const isAdmin = user?.role === 'Admin'

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleReplacementSuccess = () => {
    handleRefresh()
    toast({
      title: 'Thành công',
      description: 'Thay thế thiết bị thành công!',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý thay thế thiết bị
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Quản lý toàn bộ quy trình thay thế thiết bị trong hệ thống'
              : 'Xem lịch sử thay thế thiết bị của bạn'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b px-6 pt-6">
            <TabsList>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Lịch sử thay thế
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="statistics" disabled>
                  Thống kê thay thế
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="history" className="p-6">
            <ReplacementHistoryList refreshTrigger={refreshTrigger} />
          </TabsContent>

          {/* Future: Statistics Tab */}
          {isAdmin && (
            <TabsContent value="statistics" className="p-6">
              <div className="text-center py-12">
                <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Thống kê thay thế
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tính năng này sẽ được phát triển trong tương lai
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </Card>

      {/* Quick Actions Info for Non-Admin Users */}
      {!isAdmin && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Lưu ý:</strong> Chỉ có quản trị viên mới có thể thực hiện
            thay thế thiết bị. Nếu bạn cần thay thế thiết bị, vui lòng liên hệ
            với bộ phận IT hoặc tạo báo cáo sự cố để được hỗ trợ.
          </AlertDescription>
        </Alert>
      )}

      {/* Integration Notes */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Chú ý tích hợp:</strong> Trong phiên bản hoàn chỉnh, nút "Thay
          thế thiết bị" sẽ được tích hợp trực tiếp vào:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Trang danh sách thiết bị - để thay thế từ danh sách</li>
            <li>Chi tiết báo cáo sự cố - để thay thế từ sự cố</li>
            <li>Chi tiết thiết bị - để thay thế trực tiếp</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
