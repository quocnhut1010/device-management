import React, { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, History, Download, Package, User, Calendar, Wrench, AlertCircle, ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDeviceQrToken } from '@/services/deviceService'
import { getImageUrl } from '@/utils/imageUtils'
import { toast } from 'sonner'
import type { DeviceDto } from '@/types'

interface DeviceDetailDialogProps {
  open: boolean
  device: DeviceDto | null
  onClose: () => void
}

export default function DeviceDetailDialog({
  open,
  device,
  onClose,
}: DeviceDetailDialogProps) {
  const [qrToken, setQrToken] = useState<string>('')
  const [loadingToken, setLoadingToken] = useState(false)
  const qrCanvasRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchToken = async () => {
      if (!device?.id || !open) {
        setQrToken('')
        return
      }

      setLoadingToken(true)
      try {
        const token = await getDeviceQrToken(device.id)
        setQrToken(token)
      } catch (err) {
        console.error('Error fetching QR token:', err)
        setQrToken('')
      } finally {
        setLoadingToken(false)
      }
    }

    fetchToken()
  }, [open, device?.id])

  const handleViewHistory = () => {
    if (device) {
      navigate(`/device-history/${device.id}`)
      onClose()
    }
  }

  const handleDownloadQR = () => {
    if (!qrToken) {
      toast.error('Không có mã QR để tải')
      return
    }

    try {
      // Get the SVG element from the QR code display
      const svgElement = qrCanvasRef.current?.querySelector('svg')
      if (!svgElement) {
        toast.error('Không thể tải mã QR')
        return
      }

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `QR_${device?.deviceCode || 'device'}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading QR code:', err)
      toast.error('Lỗi khi tải mã QR')
    }
  }

  if (!device) return null

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'outline'
    
    const statusLower = status.toLowerCase()
    if (statusLower.includes('đang sử dụng')) return 'default'
    if (statusLower.includes('chưa cấp phát')) return 'secondary'
    if (statusLower.includes('hỏng') || statusLower.includes('mất')) return 'destructive'
    if (statusLower.includes('thanh lý')) return 'destructive'
    return 'outline'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết thiết bị</DialogTitle>
          <DialogDescription>Thông tin đầy đủ về thiết bị</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Device Image */}
          {device.deviceImageUrl && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Hình ảnh thiết bị
                </h3>
                <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border">
                  <img
                    src={getImageUrl(device.deviceImageUrl)}
                    alt={device.deviceName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load device image:', device.deviceImageUrl)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mã thiết bị</p>
                <p className="font-medium">{device.deviceCode || device.id || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tên thiết bị</p>
                <p className="font-medium">{device.deviceName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loại thiết bị</p>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{device.deviceTypeName || '-'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <Badge variant={getStatusBadgeVariant(device.status)}>
                  {device.status || '-'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Assignment */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Cấp phát</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phòng ban</p>
                <p className="font-medium">{device.departmentName || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Người phụ trách</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{device.currentUserName || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Warranty & Maintenance */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Bảo hành & Bảo trì</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ngày hết hạn bảo hành</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {device.warrantyExpiry
                      ? new Date(device.warrantyExpiry).toLocaleDateString('vi-VN')
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Bảo trì lần cuối</p>
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Chưa có thông tin</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Thông tin bổ sung</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-muted-foreground">Ngày mua</p>
                  <p className="font-medium">
                    {device.purchaseDate
                      ? new Date(device.purchaseDate).toLocaleDateString('vi-VN')
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Số Serial</p>
                <p className="font-mono text-sm">{device.serialNumber || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Barcode</p>
                <p className="font-mono text-sm">{device.barcode || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="text-sm">{device.modelName || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
                <p className="text-sm">{device.supplierName || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Giá mua</p>
                <p className="text-sm">
                  {device.purchasePrice
                    ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(device.purchasePrice)
                    : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nhà cung cấp bảo hành</p>
                <p className="text-sm">{device.warrantyProvider || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* QR Code */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Mã QR</h3>
            <div className="border rounded-md p-4">
              <div ref={qrCanvasRef} className="flex justify-center items-center min-h-[128px]">
                {loadingToken ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : qrToken ? (
                  <QRCodeDisplay value={qrToken} />
                ) : (
                  <p className="text-sm text-muted-foreground">Không có mã QR</p>
                )}
              </div>
              {qrToken && (
                <div className="flex justify-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadQR}
                    disabled={loadingToken}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải mã QR
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleViewHistory}>
            <History className="h-4 w-4 mr-2" />
            Xem lịch sử
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// QR Code Display Component (using a simple approach)
function QRCodeDisplay({ value }: { value: string }) {
  const [QRCodeSVG, setQRCodeSVG] = useState<any>(null)

  useEffect(() => {
    import('qrcode.react')
      .then((module) => {
        setQRCodeSVG(() => module.QRCodeSVG)
      })
      .catch((err) => {
        console.error('Error loading QRCode library:', err)
      })
  }, [])

  if (!QRCodeSVG) {
    return (
      <div className="h-32 w-32 flex items-center justify-center border rounded">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <QRCodeSVG value={value} size={128} level="H" includeMargin />
}

