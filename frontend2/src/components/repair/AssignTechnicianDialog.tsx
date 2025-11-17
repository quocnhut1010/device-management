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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  type Repair,
  type TechnicianUser,
  type AssignTechnicianDto,
  repairService,
  getRepairStatusText,
  getRepairStatusBadge,
} from '@/services/repairService'
import { Loader2, Users } from 'lucide-react'

interface AssignTechnicianDialogProps {
  open: boolean
  repair: Repair | null
  onClose: () => void
  onSuccess: () => void
}

export default function AssignTechnicianDialog({
  open,
  repair,
  onClose,
  onSuccess,
}: AssignTechnicianDialogProps) {
  const { toast } = useToast()
  const [technicians, setTechnicians] = useState<TechnicianUser[]>([])
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingTechnicians, setLoadingTechnicians] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!open) return
    setError('')
    setSelectedTechnicianId('')
    setNote('')

    const fetchTechnicians = async () => {
      try {
        setLoadingTechnicians(true)
        const res = await repairService.getAvailableTechnicians()
        setTechnicians(res.data)
      } catch (err: any) {
        const message =
          err?.response?.data?.message || err?.message || 'Không thể tải danh sách kỹ thuật viên'
        setError(message)
        toast({ title: 'Lỗi', description: message, variant: 'destructive' })
      } finally {
        setLoadingTechnicians(false)
      }
    }

    fetchTechnicians()
  }, [open, toast])

  if (!repair) return null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTechnicianId) {
      setError('Vui lòng chọn kỹ thuật viên để phân công')
      return
    }

    try {
      setLoading(true)
      setError('')

      const payload: AssignTechnicianDto = {
        technicianId: selectedTechnicianId,
        note: note.trim() || undefined,
      }

      await repairService.assignTechnician(repair.id, payload)
      toast({ title: 'Thành công', description: 'Đã phân công kỹ thuật viên cho lệnh sửa chữa' })
      onSuccess()
      onClose()
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi phân công kỹ thuật viên'
      setError(message)
      toast({ title: 'Lỗi', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Phân công kỹ thuật viên</DialogTitle>
          <DialogDescription>
            Chọn kỹ thuật viên phù hợp để tiếp nhận và xử lý lệnh sửa chữa này
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex h-[60vh] flex-col">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-6">
              <section className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Thiết bị</p>
                    <p className="font-semibold">{repair.deviceName}</p>
                    <p className="text-xs text-muted-foreground">{repair.deviceCode}</p>
                  </div>
                  <Badge variant={getRepairStatusBadge(repair.status)}>
                    {getRepairStatusText(repair.status)}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {repair.description || repair.incidentReport?.description || 'Không có mô tả chi tiết.'}
                </p>
              </section>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <section className="space-y-4">
                <div className="space-y-2">
                  <Label>Kỹ thuật viên</Label>
                  {loadingTechnicians ? (
                    <div className="flex h-24 items-center justify-center rounded-md border">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : technicians.length === 0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      Hiện chưa có kỹ thuật viên nào khả dụng.
                    </div>
                  ) : (
                    <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kỹ thuật viên" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{tech.fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                {tech.email} • {tech.departmentName || 'Không rõ phòng ban'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Hướng dẫn hoặc ghi chú thêm cho kỹ thuật viên..."
                    rows={3}
                  />
                </div>
              </section>
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Chỉ Admin có thể phân công lệnh sửa chữa.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading || loadingTechnicians || !technicians.length}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang phân công...
                  </>
                ) : (
                  'Phân công'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
