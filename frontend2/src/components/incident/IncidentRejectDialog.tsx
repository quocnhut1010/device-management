import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface IncidentRejectDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string, decision: 'Keep' | 'Liquidate') => Promise<void>
  reportId: string
}

export default function IncidentRejectDialog({
  open,
  onClose,
  onConfirm,
  reportId,
}: IncidentRejectDialogProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState('')
  const [decision, setDecision] = useState<'Keep' | 'Liquidate'>('Keep')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await onConfirm(reason.trim(), decision)
      setReason('')
      setDecision('Keep')
      onClose()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể từ chối báo cáo',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setReason('')
      setDecision('Keep')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Từ chối báo cáo sự cố</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối và chọn hành động sau khi từ chối báo cáo này.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do từ chối *</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do từ chối..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Hành động sau khi từ chối</Label>
            <RadioGroup value={decision} onValueChange={(v) => setDecision(v as 'Keep' | 'Liquidate')} disabled={loading}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Keep" id="keep" />
                <Label htmlFor="keep" className="font-normal cursor-pointer">
                  Giữ nguyên thiết bị (Đang sử dụng)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Liquidate" id="liquidate" />
                <Label htmlFor="liquidate" className="font-normal cursor-pointer">
                  Đưa vào danh sách chờ thanh lý
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

