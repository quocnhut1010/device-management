import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  type Repair,
  type DeviceRepairAnalysis,
  repairService,
  getRepairStatusText,
  getRepairStatusBadge,
  RepairStatus,
} from '@/services/repairService'
import { useAuth } from '@/contexts/AuthContext'
import {
  AlertTriangle,
  Calendar,
  Coins,
  FileText,
  History,
  Image as ImageIcon,
  Loader2,
  ShieldAlert,
  Wrench,
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDate, formatDateOnly, formatDateTime } from '@/lib/dateUtils'

interface RepairDetailDialogProps {
  open: boolean
  onClose: () => void
  repair: Repair | null
  onRequestReplacement?: (repair: Repair) => void
}

function formatCurrency(value?: number) {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export default function RepairDetailDialog({
  open,
  onClose,
  repair,
  onRequestReplacement,
}: RepairDetailDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [history, setHistory] = useState<Repair[]>([])
  const [analysis, setAnalysis] = useState<DeviceRepairAnalysis | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  const roleLower = user?.role?.toLowerCase() || ''
  const positionLower = user?.position?.toLowerCase() || ''
  const canRequestReplacement =
    !!repair &&
    !!onRequestReplacement &&
    (roleLower === 'admin' || (roleLower === 'user' && positionLower === 'kỹ thuật viên')) &&
    repair.status !== RepairStatus.DaHoanTat

  useEffect(() => {
    if (!open || !repair?.deviceId) {
      setHistory([])
      setAnalysis(null)
      return
    }

    const fetchHistory = async () => {
      try {
        setLoadingHistory(true)
        const res = await repairService.getDeviceRepairHistory(repair.deviceId)
        setHistory(res.data)
      } catch (err: any) {
        const message =
          err?.response?.data?.message || err?.message || 'Không thể tải lịch sử sửa chữa thiết bị'
        toast({ title: 'Lỗi', description: message, variant: 'destructive' })
      } finally {
        setLoadingHistory(false)
      }
    }

    const fetchAnalysis = async () => {
      try {
        setLoadingAnalysis(true)
        const res = await repairService.analyzeDeviceRepairHistory(repair.deviceId)
        setAnalysis(res.data)
      } catch (err: any) {
        const message =
          err?.response?.data?.message || err?.message || 'Không thể phân tích lịch sử sửa chữa'
        toast({ title: 'Lỗi', description: message, variant: 'destructive' })
      } finally {
        setLoadingAnalysis(false)
      }
    }

    fetchHistory()
    fetchAnalysis()
  }, [open, repair?.deviceId, toast])

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5264/api'
  const baseImageUrl = apiBase.replace(/\/api\/?$/, '')

  const warnings = useMemo(() => analysis?.warnings ?? [], [analysis])

  if (!repair) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Chi tiết lệnh sửa chữa</DialogTitle>
          <DialogDescription>
            Thông tin đầy đủ của lệnh sửa chữa thiết bị, bao gồm tình trạng, chi phí và lịch sử liên quan
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[75vh] px-6">
          <div className="space-y-8 py-6">
            {repair.rejectedReason && (
              <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Lý do từ chối gần nhất
                </div>
                <p className="text-sm text-destructive">{repair.rejectedReason}</p>
                {repair.rejectedAt && (
                  <p className="text-xs text-muted-foreground">
                    Cập nhật: {formatDateTime(repair.rejectedAt)}
                  </p>
                )}
              </section>
            )}

            <section className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Thông tin chung</h3>
                  <p className="text-sm text-muted-foreground">
                    Mã lệnh: {repair.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <Badge variant={getRepairStatusBadge(repair.status)}>
                  {getRepairStatusText(repair.status)}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Thiết bị</p>
                  <p className="font-semibold">{repair.deviceName}</p>
                  <p className="text-xs text-muted-foreground">{repair.deviceCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kỹ thuật viên phụ trách</p>
                  <p className="font-semibold">{repair.technicianName || 'Chưa phân công'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(repair.startDate, { withTime: false })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {repair.endDate ? formatDate(repair.endDate, { withTime: false }) : '—'}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  Chi phí & Giờ công
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Chi phí sửa chữa</span>
                    <span className="font-semibold">{formatCurrency(repair.cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giờ công</span>
                    <span className="font-semibold">
                      {repair.laborHours ? `${repair.laborHours} giờ` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đơn vị sửa chữa</span>
                    <span className="font-semibold">{repair.repairCompany || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Nội dung sửa chữa
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">
                  {repair.description || repair.incidentReport?.description || 'Không có mô tả chi tiết.'}
                </p>
              </div>
            </section>

            {repair.repairImages && repair.repairImages.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  Hình ảnh sau sửa chữa
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {repair.repairImages.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => window.open(`${baseImageUrl}${image.imageUrl}`, '_blank')}
                      className="group relative h-44 overflow-hidden rounded-md border"
                    >
                      <img
                        src={`${baseImageUrl}${image.imageUrl}`}
                        alt={image.description || 'Ảnh sửa chữa'}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShieldAlert className="h-4 w-4" />
                Phân tích tình trạng thiết bị
              </div>

              {loadingAnalysis ? (
                <div className="flex h-28 items-center justify-center">
                  <LoaderIndicator />
                </div>
              ) : analysis ? (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Tên thiết bị</p>
                      <p className="font-medium">{analysis.deviceName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Giá mua ban đầu</p>
                      <p className="font-medium">{formatCurrency(Number(analysis.deviceValue))}</p>
                    </div>
                    {analysis.currentValue !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">Giá trị hiện tại (sau khấu hao)</p>
                        <p className="font-medium text-primary">{formatCurrency(Number(analysis.currentValue))}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng số lần sửa</p>
                      <p className="font-medium">{analysis.repairCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng chi phí sửa</p>
                      <p className={cn(
                        "font-medium",
                        analysis.currentValue !== undefined && 
                        analysis.totalCost > analysis.currentValue && 
                        "text-destructive"
                      )}>
                        {formatCurrency(Number(analysis.totalCost))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lần sửa gần nhất</p>
                      <p className="font-medium">{formatDate(analysis.lastRepairDate || undefined, { withTime: false })}</p>
                    </div>
                  </div>

                  {analysis.depreciationInfo && (
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Coins className="h-4 w-4" />
                        Thông tin khấu hao
                      </div>
                      <div className="grid gap-3 md:grid-cols-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Số năm đã sử dụng</p>
                          <p className="font-medium">{analysis.depreciationInfo.yearsUsed.toFixed(1)} năm</p>
                        </div>
                        {analysis.depreciationInfo.usefulLifeYears && (
                          <div>
                            <p className="text-muted-foreground">Tuổi thọ hữu ích</p>
                            <p className="font-medium">{analysis.depreciationInfo.usefulLifeYears} năm</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Tỷ lệ khấu hao</p>
                          <p className="font-medium">{(analysis.depreciationInfo.depreciationRate * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Giá trị còn lại</p>
                          <p className="font-medium">{formatCurrency(Number(analysis.depreciationInfo.remainingValue))}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {warnings.length > 0 ? (
                    <div className={cn(
                      "space-y-2 rounded-md p-3",
                      analysis.currentValue !== undefined && 
                      analysis.totalCost > analysis.currentValue 
                        ? "bg-destructive/10 border border-destructive/20"
                        : "bg-destructive/5"
                    )}>
                      <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Cảnh báo
                      </div>
                      <ul className="space-y-1 text-sm text-destructive">
                        {warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">
                      Không có cảnh báo đáng chú ý cho thiết bị này.
                    </div>
                  )}

                  {analysis.suggestion && (
                    <div className={cn(
                      "rounded-md p-3 text-sm",
                      analysis.currentValue !== undefined && 
                      analysis.totalCost > analysis.currentValue 
                        ? "bg-destructive/10 border border-destructive/20 text-destructive"
                        : analysis.currentValue !== undefined && 
                          analysis.totalCost > analysis.currentValue * 0.5
                        ? "bg-yellow-50 border border-yellow-200 text-yellow-900"
                        : "bg-muted/30"
                    )}>
                      <span className="font-medium">Khuyến nghị:</span> {analysis.suggestion}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Không có dữ liệu phân tích.
                </div>
              )}
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="h-4 w-4" />
                Lịch sử sửa chữa thiết bị
              </div>

              {loadingHistory ? (
                <div className="flex h-28 items-center justify-center">
                  <LoaderIndicator />
                </div>
              ) : history.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày kết thúc</TableHead>
                        <TableHead>Chi phí</TableHead>
                        <TableHead>Kỹ thuật viên</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{formatDate(item.startDate, { withTime: false })}</TableCell>
                          <TableCell>{item.endDate ? formatDate(item.endDate, { withTime: false }) : '—'}</TableCell>
                          <TableCell>{formatCurrency(item.cost)}</TableCell>
                          <TableCell>{item.technicianName || '—'}</TableCell>
                          <TableCell>
                            <Badge variant={getRepairStatusBadge(item.status)}>
                              {getRepairStatusText(item.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Chưa có lịch sử sửa chữa nào cho thiết bị này.
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        <div className={cn('flex items-center justify-between border-t p-4', !canRequestReplacement && 'justify-end')}>
          {canRequestReplacement && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wrench className="h-4 w-4" />
              Xem xét thay thế thiết bị nếu cần thiết.
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {canRequestReplacement && (
              <Button onClick={() => repair && onRequestReplacement?.(repair)}>
                Đề xuất thay thế thiết bị
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LoaderIndicator() {
  return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
}
