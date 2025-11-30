import { useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  type Repair,
  repairService,
  RepairStatus,
  getRepairStatusText,
  getRepairStatusBadge,
} from '@/services/repairService'
import { useAuth } from '@/contexts/AuthContext'
import {
  Eye,
  UserPlus,
  Play,
  CheckCircle2,
  ShieldCheck,
  Ban,
  ClipboardCheck,
  Loader2,
} from 'lucide-react'

interface RepairListProps {
  showMyRepairs?: boolean
  refreshTrigger?: number
  onViewDetails: (repair: Repair) => void
  onAcceptRepair?: (repairId: string) => void
  onCompleteRepair?: (repair: Repair) => void
  onConfirmCompletion?: (repairId: string) => void
  onAssignTechnician?: (repair: Repair) => void
  onRejectOrNotNeeded?: (repair: Repair) => void
}

function formatDate(value?: string, withTime = true) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  }).format(date)
}

function formatCurrency(value?: number) {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export default function RepairList({
  showMyRepairs = false,
  refreshTrigger,
  onViewDetails,
  onAcceptRepair,
  onCompleteRepair,
  onConfirmCompletion,
  onAssignTechnician,
  onRejectOrNotNeeded,
}: RepairListProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all')

  const roleLower = user?.role?.toLowerCase() || ''
  const positionLower = user?.position?.toLowerCase() || ''
  const currentUserId = user?.nameid

  const isAdmin = roleLower === 'admin'
  const isTechnician = roleLower === 'user' && positionLower === 'kỹ thuật viên'

  const loadRepairs = async () => {
    try {
      setLoading(true)
      setError('')

      const response = showMyRepairs
        ? await repairService.getMyRepairs(page, pageSize, statusFilter)
        : await repairService.getAllRepairs(page, pageSize, statusFilter)

      // Check if response is paged or array
      if ('items' in response.data) {
        setRepairs(response.data.items)
        setTotal(response.data.total)
        setTotalPages(response.data.totalPages)
      } else {
        // Fallback for backward compatibility
        setRepairs(response.data as Repair[])
        setTotal((response.data as Repair[]).length)
        setTotalPages(1)
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Không thể tải danh sách lệnh sửa chữa'
      setError(message)
      toast({ title: 'Lỗi', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepairs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMyRepairs, refreshTrigger, page, pageSize, statusFilter])
  
  // Reset to page 1 when status filter changes
  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  // Load all repairs for statistics calculation (not paginated)
  const [allRepairsForStats, setAllRepairsForStats] = useState<Repair[]>([])
  
  useEffect(() => {
    // Load all repairs for statistics (without pagination)
    const loadStats = async () => {
      try {
        const response = showMyRepairs
          ? await repairService.getMyRepairs()
          : await repairService.getAllRepairs()
        
        if ('items' in response.data) {
          // If paginated response, we need to load all
          // For now, use current repairs or fetch without pagination
          setAllRepairsForStats([])
        } else {
          setAllRepairsForStats(response.data as Repair[])
        }
      } catch {
        // Fallback: use current repairs if stats load fails
        setAllRepairsForStats(repairs)
      }
    }
    
    loadStats()
  }, [showMyRepairs, refreshTrigger])
  
  const statistics = useMemo(() => {
    // Use allRepairsForStats if available, otherwise use current page repairs
    const statsSource = allRepairsForStats.length > 0 ? allRepairsForStats : repairs
    
    const total = statsSource.length
    const inProgress = statsSource.filter((r) => r.status === RepairStatus.DangSua).length
    const completed = statsSource.filter((r) => r.status === RepairStatus.DaHoanTat).length
    const avgRepairTime = (() => {
      const durations = statsSource
        .filter((r) => r.startDate && r.endDate)
        .map((r) => {
          const start = new Date(r.startDate as string).getTime()
          const end = new Date(r.endDate as string).getTime()
          return Math.max(0, end - start)
        })

      if (!durations.length) return null
      const avgMillis = durations.reduce((sum, dur) => sum + dur, 0) / durations.length
      const hours = avgMillis / (1000 * 60 * 60)
      return `${hours.toFixed(1)} giờ`
    })()

    return { total, inProgress, completed, avgRepairTime }
  }, [repairs, allRepairsForStats])

  const canAccept = (repair: Repair) =>
    isTechnician && repair.status === RepairStatus.ChoThucHien

  const canComplete = (repair: Repair) =>
    isTechnician &&
    repair.status === RepairStatus.DangSua &&
    repair.technicianId &&
    repair.technicianId === currentUserId

  const canConfirm = (repair: Repair) =>
    isAdmin && repair.status === RepairStatus.ChoDuyetHoanTat

  const canAssign = (repair: Repair) =>
    isAdmin && repair.status === RepairStatus.ChoThucHien && !!onAssignTechnician

  const canRejectOrNotNeeded = (repair: Repair) =>
    isTechnician &&
    !!onRejectOrNotNeeded &&
    (repair.status === RepairStatus.ChoThucHien || repair.status === RepairStatus.DangSua) &&
    (!repair.technicianId || repair.technicianId === currentUserId)

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (repairs.length === 0) {
    return (
      <div className="rounded-md border bg-muted/30 p-8 text-center text-muted-foreground">
        {showMyRepairs ? 'Bạn chưa có lệnh sửa chữa nào' : 'Không có lệnh sửa chữa nào'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex items-center justify-between">
        <Select
          value={statusFilter === 'all' ? 'all' : statusFilter.toString()}
          onValueChange={(value) => setStatusFilter(value === 'all' ? 'all' : parseInt(value))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="0">Chờ thực hiện</SelectItem>
            <SelectItem value="1">Đang sửa</SelectItem>
            <SelectItem value="2">Chờ duyệt hoàn tất</SelectItem>
            <SelectItem value="3">Đã hoàn tất</SelectItem>
            <SelectItem value="4">Từ chối</SelectItem>
            <SelectItem value="5">Không cần sửa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số lệnh sửa</CardTitle>
            <CardDescription>Toàn bộ lệnh sửa trong danh sách</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đang sửa</CardTitle>
            <CardDescription>Đang được kỹ thuật viên xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đã hoàn tất</CardTitle>
            <CardDescription>Đã được xác nhận hoàn tất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Thời gian sửa trung bình</CardTitle>
            <CardDescription>Dựa trên các lệnh đã hoàn tất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.avgRepairTime ? statistics.avgRepairTime : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thiết bị</TableHead>
              <TableHead>Mô tả</TableHead>
              {!showMyRepairs && <TableHead>Kỹ thuật viên</TableHead>}
              <TableHead>Chi phí</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repairs.map((repair) => (
              <TableRow key={repair.id}>
                <TableCell>
                  <div className="font-semibold">{repair.deviceCode}</div>
                  <div className="text-xs text-muted-foreground">{repair.deviceName}</div>
                </TableCell>
                <TableCell className="max-w-xs text-sm">
                  <div className="truncate" title={repair.description || repair.incidentReport?.description}>
                    {repair.description || repair.incidentReport?.description || '—'}
                  </div>
                </TableCell>
                {!showMyRepairs && (
                  <TableCell>
                    {repair.technicianName ? (
                      <span>{repair.technicianName}</span>
                    ) : (
                      <span className="text-sm italic text-muted-foreground">Chưa phân công</span>
                    )}
                  </TableCell>
                )}
                <TableCell>{formatCurrency(repair.cost)}</TableCell>
                <TableCell>
                  <div className="text-xs">
                    <div>Bắt đầu: {formatDate(repair.startDate)}</div>
                    <div>Kết thúc: {repair.endDate ? formatDate(repair.endDate) : '—'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={getRepairStatusBadge(repair.status)}>
                      {getRepairStatusText(repair.status)}
                    </Badge>
                    {repair.rejectedReason && repair.status === RepairStatus.ChoThucHien && (
                      <p className="text-xs text-destructive">
                        Đã bị từ chối: {repair.rejectedReason}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetails(repair)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xem chi tiết</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {canAssign(repair) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAssignTechnician?.(repair)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Phân công kỹ thuật viên</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {canAccept(repair) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAcceptRepair?.(repair.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Chấp nhận lệnh sửa</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {canComplete(repair) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onCompleteRepair?.(repair)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Hoàn thành sửa chữa</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {canConfirm(repair) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onConfirmCompletion?.(repair.id)}
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Xác nhận hoàn tất</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {canRejectOrNotNeeded(repair) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRejectOrNotNeeded?.(repair)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Từ chối / Không cần sửa</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {repairs.length > 0 && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, total)} trong tổng số {total} lệnh sửa chữa
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
              >
                Trước
              </Button>
              <span className="text-sm">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
