import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Trash2, History, Loader2, AlertCircle } from 'lucide-react'
import type { EligibleDeviceDto, LiquidationDto } from '@/types/liquidation'
import liquidationService from '@/services/liquidationService'
import EligibleDevicesTable from '@/components/liquidation/EligibleDevicesTable'
import LiquidationDialog from '@/components/liquidation/LiquidationDialog'
import LiquidationDetailsDialog from '@/components/liquidation/LiquidationDetailsDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function LiquidationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [eligibleDevices, setEligibleDevices] = useState<EligibleDeviceDto[]>([])
  const [liquidationHistory, setLiquidationHistory] = useState<LiquidationDto[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [liquidationDialogOpen, setLiquidationDialogOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedLiquidationId, setSelectedLiquidationId] = useState<string | null>(null)

  // Kiểm tra quyền Admin
  const isAdmin = useMemo(() => {
    return user?.role?.toLowerCase() === 'admin'
  }, [user])

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: 'Không có quyền truy cập',
        description: 'Chỉ Admin mới có thể truy cập trang này',
        variant: 'destructive',
      })
      navigate('/')
      return
    }
    loadData()
  }, [isAdmin, navigate, toast])

  const loadData = async () => {
    setLoading(true)
    try {
      const [devicesResponse, historyResponse] = await Promise.all([
        liquidationService.getEligibleDevices(),
        liquidationService.getLiquidationHistory(),
      ])

      setEligibleDevices(devicesResponse)
      setLiquidationHistory(historyResponse)
    } catch (error: any) {
      console.error('Error loading liquidation data:', error)
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi tải dữ liệu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeviceIds(eligibleDevices.map((device) => device.id))
    } else {
      setSelectedDeviceIds([])
    }
  }

  const handleLiquidateSelected = () => {
    if (selectedDeviceIds.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng chọn thiết bị cần thanh lý',
        variant: 'destructive',
      })
      return
    }
    setLiquidationDialogOpen(true)
  }

  const handleLiquidationSuccess = () => {
    setSelectedDeviceIds([])
    loadData()
  }

  const handleOpenDetails = (liquidationId: string) => {
    setSelectedLiquidationId(liquidationId)
    setDetailsDialogOpen(true)
  }

  const getSelectedDevices = (): EligibleDeviceDto[] => {
    return eligibleDevices.filter((device) => selectedDeviceIds.includes(device.id))
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể thực hiện thanh lý thiết bị.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý thanh lý thiết bị</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi việc thanh lý thiết bị</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thiết bị đủ điều kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibleDevices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã chọn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedDeviceIds.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã thanh lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liquidationHistory.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={handleLiquidateSelected}
          disabled={selectedDeviceIds.length === 0}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Thanh lý ({selectedDeviceIds.length})
        </Button>
        <Button variant="outline" onClick={() => setShowHistory(!showHistory)} className="gap-2">
          <History className="h-4 w-4" />
          {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
        </Button>
      </div>

      {/* Content */}
      {!showHistory ? (
        // Danh sách thiết bị đủ điều kiện thanh lý
        <>
          {eligibleDevices.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Hiện tại không có thiết bị nào đủ điều kiện thanh lý.</AlertDescription>
            </Alert>
          ) : (
            <EligibleDevicesTable
              devices={eligibleDevices}
              selectedDeviceIds={selectedDeviceIds}
              onSelectDevice={handleSelectDevice}
              onSelectAll={handleSelectAll}
            />
          )}
        </>
      ) : (
        // Lịch sử thanh lý
        <>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Lịch sử thanh lý</h2>
            {liquidationHistory.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Chưa có lịch sử thanh lý thiết bị nào.</AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã thiết bị</TableHead>
                      <TableHead>Tên thiết bị</TableHead>
                      <TableHead>Lý do thanh lý</TableHead>
                      <TableHead>Ngày thanh lý</TableHead>
                      <TableHead>Người phê duyệt</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liquidationHistory.map((liquidation) => (
                      <TableRow
                        key={liquidation.id}
                        className="cursor-pointer"
                        onClick={() => handleOpenDetails(liquidation.id)}
                      >
                        <TableCell className="font-medium">{liquidation.deviceCode}</TableCell>
                        <TableCell>{liquidation.deviceName}</TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm truncate block" title={liquidation.reason}>
                            {liquidation.reason}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(liquidation.liquidationDate)}</TableCell>
                        <TableCell>{liquidation.approvedByName}</TableCell>
                        <TableCell>{formatDate(liquidation.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dialogs */}
      <LiquidationDialog
        open={liquidationDialogOpen}
        onClose={() => setLiquidationDialogOpen(false)}
        selectedDevices={getSelectedDevices()}
        onSuccess={handleLiquidationSuccess}
      />
      <LiquidationDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false)
          setSelectedLiquidationId(null)
        }}
        liquidationId={selectedLiquidationId}
      />
    </div>
  )
}

