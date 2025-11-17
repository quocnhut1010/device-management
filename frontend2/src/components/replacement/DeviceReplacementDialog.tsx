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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import {
  getSuggestedReplacementDevices,
  createReplacement,
  filterSuggestedDevices,
  sortDevicesByPriority,
} from '@/services/replacementService'
import type { SuggestedDeviceDto, CreateReplacementDto } from '@/types'
import { ArrowLeftRight, Package, Check, Loader2, Info } from 'lucide-react'
import { getImageUrl } from '@/utils/imageUtils'

interface DeviceReplacementDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  deviceId: string
  deviceCode: string
  deviceName: string
  incidentReportId?: string
  title?: string
}

export default function DeviceReplacementDialog({
  open,
  onClose,
  onSuccess,
  deviceId,
  deviceCode,
  deviceName,
  incidentReportId,
  title = 'Thay thế thiết bị',
}: DeviceReplacementDialogProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [suggestedDevices, setSuggestedDevices] = useState<SuggestedDeviceDto[]>([])
  const [filteredDevices, setFilteredDevices] = useState<SuggestedDeviceDto[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [reason, setReason] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSameModelOnly, setShowSameModelOnly] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open && deviceId) {
      loadSuggestedDevices()
    }
  }, [open, deviceId])

  useEffect(() => {
    const filtered = filterSuggestedDevices(suggestedDevices, searchTerm, showSameModelOnly)
    const sorted = sortDevicesByPriority(filtered)
    setFilteredDevices(sorted)
  }, [suggestedDevices, searchTerm, showSameModelOnly])

  const loadSuggestedDevices = async () => {
    try {
      setLoading(true)
      const devices = await getSuggestedReplacementDevices(deviceId)
      setSuggestedDevices(devices)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description:
          error.response?.data?.message || 'Không thể tải danh sách thiết bị thay thế',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedDeviceId || !reason.trim()) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng chọn thiết bị và nhập lý do thay thế',
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmitting(true)

      const createReplacementDto: CreateReplacementDto = {
        oldDeviceId: deviceId,
        newDeviceId: selectedDeviceId,
        reason: reason.trim(),
        ...(incidentReportId && { incidentReportId }),
      }

      await createReplacement(createReplacementDto)

      toast({
        title: 'Thành công',
        description: 'Thay thế thiết bị thành công!',
      })
      handleClose()
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description:
          error.response?.data?.message || 'Không thể thực hiện thay thế thiết bị',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedDeviceId('')
    setReason('')
    setSearchTerm('')
    setShowSameModelOnly(true)
    onClose()
  }

  const selectedDevice = filteredDevices.find((d) => d.id === selectedDeviceId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>Chọn thiết bị để thay thế cho thiết bị hiện tại</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Thông tin thiết bị hiện tại */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Thiết bị hiện tại:</strong> {deviceCode} - {deviceName}
            </AlertDescription>
          </Alert>

          {/* Lý do thay thế */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do thay thế *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do cần thay thế thiết bị..."
              rows={3}
            />
          </div>

          {/* Bộ lọc */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm thiết bị (mã, tên, model...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showSameModelOnly}
                onCheckedChange={setShowSameModelOnly}
                id="same-model"
              />
              <Label htmlFor="same-model" className="text-sm cursor-pointer">
                Chỉ cùng model
              </Label>
            </div>
          </div>

          {/* Danh sách thiết bị thay thế */}
          <div className="space-y-2">
            <Label>Chọn thiết bị thay thế:</Label>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDevices.length === 0 ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Không có thiết bị nào phù hợp để thay thế
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[300px]">
                <RadioGroup value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                  <div className="space-y-2">
                    {filteredDevices.map((device) => (
                      <label
                        key={device.id}
                        htmlFor={`device-${device.id}`}
                        className="cursor-pointer"
                      >
                        <Card
                          className={`transition-all ${
                            selectedDeviceId === device.id
                              ? 'border-primary border-2 bg-primary/5'
                              : 'border hover:border-primary/50'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <RadioGroupItem
                                  value={device.id}
                                  id={`device-${device.id}`}
                                  className="mt-1"
                                />
                                {device.deviceImageUrl && (
                                  <img
                                    src={getImageUrl(device.deviceImageUrl)}
                                    alt={device.deviceName}
                                    className="w-12 h-12 object-cover rounded-md border"
                                  />
                                )}
                                {!device.deviceImageUrl && (
                                  <div className="w-12 h-12 rounded-md border bg-muted flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">{device.deviceCode}</p>
                                    {device.isSameModel && (
                                      <Badge variant="secondary" className="text-xs">
                                        Cùng model
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {device.deviceName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Model: {device.modelName} | Loại: {device.typeName}
                                  </p>
                                  {device.purchaseDate && (
                                    <p className="text-xs text-muted-foreground">
                                      Ngày mua:{' '}
                                      {new Date(device.purchaseDate).toLocaleDateString('vi-VN')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {selectedDeviceId === device.id && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </ScrollArea>
            )}
          </div>

          {/* Xác nhận thay thế */}
          {selectedDevice && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>
                <strong>Sẽ thay thế bằng:</strong> {selectedDevice.deviceCode} -{' '}
                {selectedDevice.deviceName}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDeviceId || !reason.trim() || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang thay thế...
              </>
            ) : (
              <>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Xác nhận thay thế
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

