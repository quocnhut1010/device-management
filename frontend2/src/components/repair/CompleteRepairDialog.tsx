import { useEffect, useRef, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  type Repair,
  repairService,
  getRepairStatusText,
  getRepairStatusBadge,
  type RepairRequestDto,
} from '@/services/repairService'
import { Loader2, Upload, X } from 'lucide-react'

interface CompleteRepairDialogProps {
  open: boolean
  repair: Repair | null
  onClose: () => void
  onSuccess: () => void
}

export default function CompleteRepairDialog({
  open,
  repair,
  onClose,
  onSuccess,
}: CompleteRepairDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<RepairRequestDto>({ description: '', imageUrls: [] })
  const [repairCompanyType, setRepairCompanyType] = useState<'internal' | 'external'>('internal')
  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Cleanup preview URLs when component unmounts or previewUrls change
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  useEffect(() => {
    if (open && repair) {
      // Determine company type based on existing data
      const existingCompany = repair.repairCompany
      const isInternal = existingCompany === 'Nội bộ' || !existingCompany
      
      setRepairCompanyType(isInternal ? 'internal' : 'external')
      setFormData({
        description: repair.description || '',
        cost: isInternal ? undefined : (repair.cost ?? undefined),
        laborHours: isInternal ? undefined : (repair.laborHours ?? undefined),
        repairCompany: isInternal ? 'Nội bộ' : (repair.repairCompany ?? ''),
        imageUrls: [],
      })
      setFiles([])
      setPreviewUrls([])
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, repair])

  if (!repair) return null

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files ? Array.from(event.target.files) : []
    if (!selected.length) return

    setFiles((prev) => [...prev, ...selected])
    const newPreviews = selected.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newPreviews])
    event.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index))
    setPreviewUrls((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target)
      return prev.filter((_, idx) => idx !== index)
    })
  }

  const handleCompanyTypeChange = (value: 'internal' | 'external') => {
    setRepairCompanyType(value)
    if (value === 'internal') {
      // Reset cost and labor hours when switching to internal
      setFormData((prev) => ({
        ...prev,
        repairCompany: 'Nội bộ',
        cost: undefined,
        laborHours: undefined,
      }))
    } else {
      // Clear repair company name when switching to external
      setFormData((prev) => ({
        ...prev,
        repairCompany: '',
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.description || !formData.description.trim()) {
      setError('Vui lòng nhập mô tả công việc đã thực hiện')
      return
    }

    // Validate external company fields
    if (repairCompanyType === 'external') {
      if (!formData.repairCompany?.trim()) {
        setError('Vui lòng nhập tên công ty sửa chữa')
        return
      }
    }

    try {
      setLoading(true)
      setError('')

      const payload: RepairRequestDto = {
        description: formData.description.trim(),
        // For internal: send null/undefined, for external: send the values
        cost: repairCompanyType === 'internal' ? undefined : formData.cost,
        laborHours: repairCompanyType === 'internal' ? undefined : formData.laborHours,
        repairCompany: repairCompanyType === 'internal' ? 'Nội bộ' : (formData.repairCompany?.trim() || undefined),
        imageUrls: [],
      }

      if (files.length > 0) {
        const uploadRes = await repairService.uploadRepairImages(repair.id, files)
        payload.imageUrls = uploadRes.data.imageUrls
      }

      await repairService.completeRepair(repair.id, payload)
      toast({ title: 'Thành công', description: 'Đã gửi yêu cầu hoàn thành sửa chữa' })
      onSuccess()
      onClose()
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi hoàn thành sửa chữa'
      setError(message)
      toast({ title: 'Lỗi', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Hoàn thành lệnh sửa chữa</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết về công việc sửa chữa đã thực hiện cho thiết bị
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex h-[75vh] flex-col">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-6">
              <section className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Thiết bị</p>
                  <p className="font-semibold">{repair.deviceName}</p>
                  <p className="text-xs text-muted-foreground">{repair.deviceCode}</p>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái hiện tại</p>
                    <Badge variant={getRepairStatusBadge(repair.status)}>
                      {getRepairStatusText(repair.status)}
                    </Badge>
                  </div>
                </div>
              </section>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Mô tả công việc đã thực hiện <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Mô tả chi tiết các công việc đã thực hiện, linh kiện đã thay thế..."
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repairCompanyType">Đơn vị sửa chữa</Label>
                  <Select value={repairCompanyType} onValueChange={handleCompanyTypeChange}>
                    <SelectTrigger id="repairCompanyType">
                      <SelectValue placeholder="Chọn loại đơn vị" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Nội bộ</SelectItem>
                      <SelectItem value="external">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {repairCompanyType === 'internal' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Chi phí (VND)</Label>
                      <Input id="cost" value="—" disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="laborHours">Giờ công</Label>
                      <Input id="laborHours" value="—" disabled className="bg-muted" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="repairCompany">
                        Tên công ty sửa chữa <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="repairCompany"
                        placeholder="Nhập tên công ty hoặc đơn vị thực hiện sửa chữa"
                        value={formData.repairCompany ?? ''}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, repairCompany: event.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cost">Chi phí (VND)</Label>
                        <Input
                          id="cost"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          step="1000"
                          value={formData.cost ?? ''}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              cost: event.target.value ? Number(event.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="laborHours">Giờ công</Label>
                        <Input
                          id="laborHours"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={formData.laborHours ?? ''}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              laborHours: event.target.value ? Number(event.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-3">
                  <Label>Ảnh minh chứng sau sửa chữa</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Chọn ảnh
                  </Button>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {previewUrls.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {previewUrls.map((url, index) => (
                        <div key={url} className="relative h-32 overflow-hidden rounded-md border">
                          <img src={url} alt={`preview-${index}`} className="h-full w-full object-cover" />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </ScrollArea>

          <div className="flex items-center justify-end gap-2 border-t p-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Hoàn thành'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
