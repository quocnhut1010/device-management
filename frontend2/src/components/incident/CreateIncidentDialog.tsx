import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { incidentService, type CreateIncidentReportDto } from '@/services/incidentService'
import { getAllDevices, getMyDevices } from '@/services/deviceService'
import { useAuth } from '@/contexts/AuthContext'
import type { DeviceDto } from '@/types'

interface CreateIncidentDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const reportTypes = [
  'Hỏng hóc phần cứng',
  'Lỗi phần mềm',
  'Mất mát thiết bị',
  'Hư hỏng vật lý',
  'Lỗi kết nối mạng',
  'Khác',
]

export default function CreateIncidentDialog({
  open,
  onClose,
  onSuccess,
}: CreateIncidentDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreateIncidentReportDto>({
    deviceId: '',
    reportType: '',
    description: '',
    imageUrl: '',
  })
  const [devices, setDevices] = useState<DeviceDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Load devices when dialog opens
  useEffect(() => {
    if (open) {
      loadDevices()
      // Reset form
      setFormData({
        deviceId: '',
        reportType: '',
        description: '',
        imageUrl: '',
      })
      setSelectedFile(null)
      setImagePreview('')
      setError('')
    }
  }, [open])

  const loadDevices = async () => {
    try {
      setLoadingDevices(true)
      if (!user) {
        setError('Không thể xác thực người dùng')
        return
      }

      let response: DeviceDto[]
      const roleLower = user.role.toLowerCase()
      if (roleLower === 'admin') {
        // Admin can create reports for any device
        response = await getAllDevices()
      } else {
        // Employees and Managers can only report their own devices
        response = await getMyDevices()
      }

      setDevices(response || [])
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách thiết bị'
      setError(errorMessage)
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.deviceId || !formData.reportType || !formData.description.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Upload image first if provided
      if (selectedFile) {
        const uploadResponse = await incidentService.uploadIncidentImage(selectedFile)
        formData.imageUrl = uploadResponse.data.imageUrl
      }

      // Create incident report
      await incidentService.createIncident(formData)
      
      toast({
        title: 'Thành công',
        description: 'Báo cáo sự cố đã được tạo thành công',
      })
      
      onSuccess()
      onClose()
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Có lỗi xảy ra khi tạo báo cáo'
      setError(message)
      toast({
        title: 'Lỗi',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview('')
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        deviceId: '',
        reportType: '',
        description: '',
        imageUrl: '',
      })
      setSelectedFile(null)
      setImagePreview('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo báo cáo sự cố mới</DialogTitle>
          <DialogDescription>
            Điền thông tin về sự cố thiết bị để báo cáo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Device Selection */}
            <div className="grid gap-2">
              <Label htmlFor="deviceId">
                Thiết bị <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.deviceId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, deviceId: value }))
                }
                disabled={loadingDevices || loading}
              >
                <SelectTrigger id="deviceId">
                  <SelectValue placeholder="Chọn thiết bị" />
                </SelectTrigger>
                <SelectContent>
                  {loadingDevices ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải...
                      </div>
                    </SelectItem>
                  ) : devices.length > 0 ? (
                    devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.deviceCode} - {device.deviceName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Không có thiết bị nào được phân công
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div className="grid gap-2">
              <Label htmlFor="reportType">
                Loại sự cố <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, reportType: value }))
                }
                disabled={loading}
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Chọn loại sự cố" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                Mô tả chi tiết <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về sự cố, triệu chứng, thời gian xảy ra..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={loading}
              />
            </div>

            {/* Image Upload */}
            <div className="grid gap-2">
              <Label>Ảnh minh chứng (tùy chọn)</Label>
              {!imagePreview ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn ảnh minh chứng
                </Button>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-48 object-contain rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo báo cáo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

