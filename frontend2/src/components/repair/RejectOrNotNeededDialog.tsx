import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import {
  type Repair,
  type RejectOrNotNeededDto,
  repairService,
  RepairStatus,
} from '@/services/repairService'
import { Loader2 } from 'lucide-react'

interface RejectOrNotNeededDialogProps {
  open: boolean
  repair: Repair | null
  onClose: () => void
  onSuccess: () => void
}

export default function RejectOrNotNeededDialog({
  open,
  repair,
  onClose,
  onSuccess,
}: RejectOrNotNeededDialogProps) {
  const { toast } = useToast()
  const [decision, setDecision] = useState<RejectOrNotNeededDto['status']>(RepairStatus.TuChoi)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (open) {
      setDecision(RepairStatus.TuChoi)
      setReason('')
      setError('')
    }
  }, [open])

  if (!repair) return null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reason.trim()) {
      setError('Vui lòng cung cấp lý do cụ thể')
      return
    }

    try {
      setLoading(true)
      setError('')
      const payload: RejectOrNotNeededDto = {
        status: decision,
        reason: reason.trim(),
      }
      await repairService.rejectOrMarkNotNeeded(repair.id, payload)
      toast({ title: 'Thành công', description: 'Đã cập nhật trạng thái lệnh sửa chữa' })
      onSuccess()
      onClose()
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái lệnh sửa chữa'
      setError(message)
      toast({ title: 'Lỗi', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Xử lý lệnh sửa chữa</DialogTitle>
          <DialogDescription>
            Chọn một trong hai phương án bên dưới và cung cấp lý do chi tiết để cập nhật lệnh sửa chữa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="space-y-3 rounded-md border bg-muted/30 p-4 text-sm">
            <p className="font-medium">{repair.deviceName}</p>
            <p className="text-muted-foreground">Mã thiết bị: {repair.deviceCode}</p>
            <p className="text-muted-foreground">
              Mô tả sự cố: {repair.description || repair.incidentReport?.description || '—'}
            </p>
          </section>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <section className="space-y-3">
            <div className="space-y-2">
              <Label>Chọn phương án</Label>
              <RadioGroup
                value={decision.toString()}
                onValueChange={(value) => setDecision(Number(value) as RejectOrNotNeededDto['status'])}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value={RepairStatus.TuChoi.toString()} id="decision-reject" />
                  <Label htmlFor="decision-reject" className="cursor-pointer">
                    Từ chối lệnh sửa chữa – không thể tiến hành được
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value={RepairStatus.KhongCanSua.toString()} id="decision-not-needed" />
                  <Label htmlFor="decision-not-needed" className="cursor-pointer">
                    Đánh dấu không cần sửa – sự cố đã được giải quyết
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Lý do chi tiết <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={4}
                placeholder="Nhập lý do cụ thể..."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          </section>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Xác nhận'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
