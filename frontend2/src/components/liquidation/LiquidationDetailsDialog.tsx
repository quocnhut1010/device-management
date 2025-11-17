import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { LiquidationDto } from '@/types/liquidation'
import liquidationService from '@/services/liquidationService'

interface LiquidationDetailsDialogProps {
  open: boolean
  onClose: () => void
  liquidationId: string | null
}

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

export default function LiquidationDetailsDialog({
  open,
  onClose,
  liquidationId,
}: LiquidationDetailsDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [liquidation, setLiquidation] = useState<LiquidationDto | null>(null)

  useEffect(() => {
    if (open && liquidationId) {
      fetchDetails()
    } else {
      setLiquidation(null)
    }
  }, [open, liquidationId])

  const fetchDetails = async () => {
    if (!liquidationId) return

    try {
      setLoading(true)
      const data = await liquidationService.getLiquidationById(liquidationId)
      setLiquidation(data)
    } catch (error: any) {
      console.error('Error loading liquidation details:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải chi tiết thanh lý',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Chi tiết Thanh lý Thiết bị
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về bản ghi thanh lý</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : liquidation ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Mã thiết bị</p>
                  <p className="font-semibold">{liquidation.deviceCode || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tên thiết bị</p>
                  <p className="font-medium">{liquidation.deviceName || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Người phê duyệt</p>
                  <p className="font-medium">{liquidation.approvedByName || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày thanh lý</p>
                  <p className="font-medium">{formatDate(liquidation.liquidationDate)}</p>
                </div>
              </div>
            </div>

            {/* Reason + Status */}
            <div className="rounded-lg border p-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Lý do Thanh lý</h4>
                <p className="text-sm whitespace-pre-wrap">{liquidation.reason || 'Không có lý do cụ thể'}</p>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge variant="default" className="font-semibold">
                  Đã thanh lý
                </Badge>
              </div>
            </div>

            {/* Audit Info */}
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="text-sm font-semibold">Thông tin ghi nhận</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">ID bản ghi</p>
                  <p className="text-xs font-mono break-all">{liquidation.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Thời gian ghi nhận</p>
                  <p className="text-xs">{formatDate(liquidation.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Không tìm thấy dữ liệu thanh lý.</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

