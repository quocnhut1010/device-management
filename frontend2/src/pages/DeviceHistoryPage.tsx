import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  History,
  GitBranch,
  BarChart3,
  RefreshCw,
  Download,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  getDeviceHistory,
  getAllHistory,
  getHistoryTimeline,
  getHistoryStats,
} from '@/services/deviceHistoryService'
import type {
  DeviceHistoryData,
  DeviceHistoryFilter,
  DeviceHistoryTimelineData,
  DeviceHistoryStats,
} from '@/types/deviceHistory'
import DeviceHistoryItem from '@/components/deviceHistory/DeviceHistoryItem'
import DeviceHistoryTimeline from '@/components/deviceHistory/DeviceHistoryTimeline'
import DeviceHistoryStatsComponent from '@/components/deviceHistory/DeviceHistoryStats'
import DeviceHistoryFilters from '@/components/deviceHistory/DeviceHistoryFilters'
import DeviceHistoryTable from '@/components/deviceHistory/DeviceHistoryTable'

export default function DeviceHistoryPage() {
  const { deviceId } = useParams<{ deviceId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  // State management
  const [currentTab, setCurrentTab] = useState('list')
  const [histories, setHistories] = useState<DeviceHistoryData[]>([])
  const [timelineData, setTimelineData] = useState<DeviceHistoryTimelineData[]>([])
  const [stats, setStats] = useState<DeviceHistoryStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedHistory, setSelectedHistory] = useState<DeviceHistoryData | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<DeviceHistoryFilter>({
    deviceId: deviceId,
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || '20'),
    sortBy: searchParams.get('sortBy') || 'ActionDate',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  })

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: DeviceHistoryFilter = {
      deviceId: deviceId,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: searchParams.get('sortBy') || 'ActionDate',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      action: searchParams.get('action') || undefined,
      actionType: searchParams.get('actionType') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    }
    setFilters(urlFilters)
  }, [deviceId, searchParams])

  // Update URL when filters change
  const updateUrlParams = useCallback(
    (newFilters: DeviceHistoryFilter) => {
      const params = new URLSearchParams()

      if (newFilters.page && newFilters.page > 1)
        params.set('page', newFilters.page.toString())
      if (newFilters.pageSize && newFilters.pageSize !== 20)
        params.set('pageSize', newFilters.pageSize.toString())
      if (newFilters.sortBy && newFilters.sortBy !== 'ActionDate')
        params.set('sortBy', newFilters.sortBy)
      if (newFilters.sortOrder && newFilters.sortOrder !== 'desc')
        params.set('sortOrder', newFilters.sortOrder)
      if (newFilters.action) params.set('action', newFilters.action)
      if (newFilters.actionType) params.set('actionType', newFilters.actionType)
      if (newFilters.fromDate) params.set('fromDate', newFilters.fromDate)
      if (newFilters.toDate) params.set('toDate', newFilters.toDate)

      setSearchParams(params)
    },
    [setSearchParams]
  )

  // Load data based on current tab and filters
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      switch (currentTab) {
        case 'list':
        case 'table':
          const historyData = deviceId
            ? await getDeviceHistory(deviceId, filters)
            : await getAllHistory(filters)
          setHistories(historyData)
          break

        case 'timeline':
          const timeline = await getHistoryTimeline(filters)
          setTimelineData(timeline)
          break

        case 'stats':
          const statsData = await getHistoryStats(
            deviceId,
            undefined,
            filters.fromDate
          )
          setStats(statsData)
          break
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu'
      setError(errorMessage)
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [currentTab, filters, deviceId, toast])

  // Load data when dependencies change
  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle filter changes
  const handleFiltersChange = (newFilters: DeviceHistoryFilter) => {
    setFilters(newFilters)
    updateUrlParams(newFilters)
  }

  // Handle filter apply
  const handleApplyFilters = () => {
    loadData()
  }

  // Handle filter clear
  const handleClearFilters = () => {
    const clearedFilters: DeviceHistoryFilter = {
      deviceId: deviceId,
      page: 1,
      pageSize: 20,
      sortBy: 'ActionDate',
      sortOrder: 'desc',
    }
    setFilters(clearedFilters)
    updateUrlParams(clearedFilters)
  }

  // Handle view details
  const handleViewDetails = (history: DeviceHistoryData) => {
    setSelectedHistory(history)
    setShowDetailsDialog(true)
  }

  // Handle refresh
  const handleRefresh = () => {
    loadData()
  }

  // Calculate stats for cards
  const totalEvents = histories.length
  const devicesTracked = new Set(histories.map((h) => h.deviceId)).size
  const today = new Date().toISOString().split('T')[0]
  const todayEvents = histories.filter(
    (h) => h.actionDate.split('T')[0] === today
  ).length
  const actionTypes = new Set(histories.map((h) => h.actionType)).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {deviceId ? 'Lịch sử thiết bị' : 'Lịch sử hệ thống'}
          </h1>
          <p className="text-muted-foreground">
            {deviceId
              ? 'Xem lịch sử hoạt động của thiết bị cụ thể'
              : 'Xem tổng quan lịch sử hoạt động của tất cả thiết bị trong hệ thống'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {currentTab === 'list' || currentTab === 'table' ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Devices Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{devicesTracked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Action Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{actionTypes}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters */}
      <DeviceHistoryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="border-b px-6 pt-6">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Danh sách
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Bảng
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Dòng thời gian
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Thống kê
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Panels */}
          <TabsContent value="list" className="p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : histories.length > 0 ? (
              <div className="space-y-4">
                {histories.map((history) => (
                  <DeviceHistoryItem
                    key={history.id}
                    history={history}
                    showDeviceInfo={!deviceId}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
                  Không có dữ liệu lịch sử
                </h3>
                <p className="text-sm text-muted-foreground">
                  Thử điều chỉnh bộ lọc để xem thêm kết quả.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="table" className="p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <DeviceHistoryTable
                histories={histories}
                onViewDetails={handleViewDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="timeline" className="p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <DeviceHistoryTimeline
                timelineData={timelineData}
                showDeviceInfo={!deviceId}
                onEventClick={handleViewDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="p-6">
            {stats ? (
              <DeviceHistoryStatsComponent stats={stats} loading={loading} />
            ) : loading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Không có dữ liệu thống kê
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hoạt động</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về hoạt động này
            </DialogDescription>
          </DialogHeader>
          {selectedHistory && (
            <DeviceHistoryItem
              history={selectedHistory}
              showDeviceInfo={true}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
