import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Loader2, AlertTriangle } from 'lucide-react'
import type { EligibleDeviceDto, CreateLiquidationDto, BatchLiquidationDto } from '@/types/liquidation'
import liquidationService from '@/services/liquidationService'

interface LiquidationDialogProps {
  open: boolean
  onClose: () => void
  selectedDevices: EligibleDeviceDto[]
  onSuccess: () => void
}

export default function LiquidationDialog({
  open,
  onClose,
  selectedDevices,
  onSuccess,
}: LiquidationDialogProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState('')
  const [liquidationDate, setLiquidationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('')
      setLiquidationDate(new Date().toISOString().split('T')[0])
    }
  }, [open])

  const handleClose = () => {
    if (!loading) {
      setReason('')
      setLiquidationDate(new Date().toISOString().split('T')[0])
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do thanh lý',
        variant: 'destructive',
      })
      return
    }

    if (selectedDevices.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn thiết bị cần thanh lý',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      if (selectedDevices.length === 1) {
        // Thanh lý một thiết bị
        const liquidationData: CreateLiquidationDto = {
          deviceId: selectedDevices[0].id,
          reason: reason.trim(),
          liquidationDate: liquidationDate,
        }

        await liquidationService.liquidateDevice(liquidationData)
        toast({
          title: 'Thành công',
          description: 'Thanh lý thiết bị thành công!',
        })
      } else {
        // Thanh lý nhiều thiết bị
        const batchData: BatchLiquidationDto = {
          deviceIds: selectedDevices.map((device) => device.id),
          reason: reason.trim(),
          liquidationDate: liquidationDate,
        }

        await liquidationService.liquidateBatch(batchData)
        toast({
          title: 'Thành công',
          description: `Thanh lý ${selectedDevices.length} thiết bị thành công!`,
        })
      }

      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error liquidating devices:', error)
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi thanh lý thiết bị',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const totalValue = selectedDevices.reduce((sum, device) => sum + (device.purchasePrice || 0), 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Thanh lý thiết bị ({selectedDevices.length} thiết bị)</DialogTitle>
          <DialogDescription>
            Vui lòng điền thông tin để xác nhận thanh lý thiết bị
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Warning Alert */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Lưu ý:</strong> Sau khi thanh lý, thiết bị sẽ không thể sử dụng được nữa.
                Thao tác này không thể hoàn tác.
              </AlertDescription>
            </Alert>

            {/* Device List */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Danh sách thiết bị cần thanh lý</Label>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã thiết bị</TableHead>
                      <TableHead>Tên thiết bị</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead className="text-right">Giá trị (VND)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.deviceCode}</TableCell>
                        <TableCell>{device.deviceName}</TableCell>
                        <TableCell>{device.status}</TableCell>
                        <TableCell>{device.currentDepartmentName || '—'}</TableCell>
                        <TableCell>{device.currentUserFullName || '—'}</TableCell>
                        <TableCell className="text-right">
                          {device.purchasePrice?.toLocaleString('vi-VN') || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="border-t p-4 bg-muted/50">
                  <div className="text-sm font-semibold">
                    Tổng giá trị: {totalValue.toLocaleString('vi-VN')} VND
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="liquidationDate">
                  Ngày thanh lý <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="liquidationDate"
                  type="date"
                  value={liquidationDate}
                  onChange={(e) => setLiquidationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Lý do thanh lý <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do cần thanh lý thiết bị (ví dụ: hết hạn khấu hao, hỏng không thể sửa chữa, mất thiết bị...)"
                disabled={loading}
                required
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận thanh lý'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

