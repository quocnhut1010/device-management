import React, { useState, useEffect } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, User, AlertTriangle, FileText, Wrench, ImageIcon, ArrowLeftRight } from 'lucide-react'
import type { IncidentReport } from '@/services/incidentService'
import { getStatusText, getStatusColor, mapPriority } from '@/services/incidentService'
import { repairService, type Repair, getRepairStatusText, getRepairStatusBadge } from '@/services/repairService'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import DeviceReplacementDialog from '@/components/replacement/DeviceReplacementDialog'

interface IncidentDetailDialogProps {
  open: boolean
  onClose: () => void
  report: IncidentReport | null
}

export default function IncidentDetailDialog({
  open,
  onClose,
  report,
}: IncidentDetailDialogProps) {
  const [repairHistory, setRepairHistory] = useState<Repair[]>([])
  const [loadingRepairs, setLoadingRepairs] = useState(false)
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (open && report?.device?.id) {
      const fetchRepairHistory = async () => {
        try {
          setLoadingRepairs(true)
          const res = await repairService.getDeviceRepairHistory(report.device!.id)
          setRepairHistory(res.data || [])
        } catch (err: any) {
          const message =
            err?.response?.data?.message || err?.message || 'Không thể tải lịch sử sửa chữa thiết bị'
          toast({
            title: 'Lỗi',
            description: message,
            variant: 'destructive',
          })
          setRepairHistory([])
        } finally {
          setLoadingRepairs(false)
        }
      }

      fetchRepairHistory()
    } else {
      setRepairHistory([])
    }
  }, [open, report?.device?.id, toast])

  if (!report) return null

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5264'
  const statusColor = getStatusColor(report.status)
  const priorityInfo = mapPriority(report.reportType)

  // Check user role and permissions
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const isTechnician = user?.position?.toLowerCase() === 'kỹ thuật viên'
  const canReplaceDevice =
    (isAdmin || isTechnician) &&
    report.device?.id &&
    (report.status === 0 || report.status === 2) &&
    report.device.status !== 'Đã thay thế'

  const handleReplacementSuccess = () => {
    setReplacementDialogOpen(false)
    onClose()
    // Optionally refresh the page or update the report
    window.location.reload()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }
  
  const getStatusBadgeVariant = () => {
    if (statusColor === 'destructive') return 'destructive'
    if (statusColor === 'warning') return 'default'
    if (statusColor === 'success') return 'default'
    if (statusColor === 'info') return 'default'
    return 'secondary'
  }

  const getPriorityBadgeVariant = () => {
    if (priorityInfo.color === 'destructive') return 'destructive'
    if (priorityInfo.color === 'warning') return 'default'
    if (priorityInfo.color === 'success') return 'default'
    return 'secondary'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết báo cáo sự cố</DialogTitle>
          <DialogDescription>Thông tin đầy đủ về báo cáo sự cố thiết bị</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Incident Images */}
          {report.imageUrl && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Hình ảnh sự cố
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden border">
                    <img
                      src={`${baseUrl}${report.imageUrl}`}
                      alt="Hình ảnh sự cố"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(`${baseUrl}${report.imageUrl}`, '_blank')}
                    />
                  </div>
                  {/* Placeholder for second image if needed */}
                  {/* {report.imageUrl && (
                    <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden border flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )} */}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Incident Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Thông tin sự cố</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mã báo cáo</p>
                <p className="font-medium">{report.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <Badge 
                  variant={getStatusBadgeVariant()}
                  className={
                    statusColor === 'destructive' ? 'bg-red-600 text-white' :
                    statusColor === 'warning' ? 'bg-amber-500 text-white' :
                    statusColor === 'success' ? 'bg-emerald-600 text-white' :
                    statusColor === 'info' ? 'bg-blue-600 text-white' :
                    ''
                  }
                >
                  {getStatusText(report.status)}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mức độ ưu tiên</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <Badge 
                    variant={getPriorityBadgeVariant()}
                    className={
                      priorityInfo.color === 'destructive' ? 'bg-red-600 text-white' :
                      priorityInfo.color === 'warning' ? 'bg-orange-500 text-white' :
                      priorityInfo.color === 'success' ? 'bg-emerald-600 text-white' :
                      priorityInfo.color === 'info' ? 'bg-sky-600 text-white' :
                      'bg-gray-500 text-white'
                    }
                  >
                    {priorityInfo.label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ngày báo cáo</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{new Date(report.reportDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Device & Reporter */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Thiết bị & Người báo cáo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Thiết bị bị ảnh hưởng</p>
                <p className="font-medium">{report.device?.deviceName || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{report.device?.deviceCode || ''}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Người báo cáo</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{report.reportedByUser?.fullName || 'N/A'}</p>
                </div>
                <p className="text-xs text-muted-foreground">{report.reportedByUser?.email || ''}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Issue Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Mô tả sự cố</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-muted-foreground">Tóm tắt</p>
                  <p className="font-medium">{report.reportType || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mô tả chi tiết</p>
                <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                  {report.description || 'Không có mô tả chi tiết.'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions & Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Hành động & Dòng thời gian</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-start p-2 bg-muted rounded">
                <div>
                  <p className="font-medium">Báo cáo được tạo</p>
                  <p className="text-xs text-muted-foreground">bởi {report.reportedByUser?.fullName || 'N/A'}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(report.reportDate).toLocaleString('vi-VN')}</p>
              </div>
              {report.status === 1 && (
                <div className="flex justify-between items-start p-2 bg-muted rounded">
                  <div>
                    <p className="font-medium">Trạng thái cập nhật: Đã tạo lệnh sửa</p>
                    <p className="text-xs text-muted-foreground">bởi Admin</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{report.updatedAt ? new Date(report.updatedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
              )}
              {report.status === 2 && report.rejectedAt && (
                <div className="flex justify-between items-start p-2 bg-muted rounded">
                  <div>
                    <p className="font-medium">Báo cáo bị từ chối</p>
                    <p className="text-xs text-muted-foreground">bởi {report.rejectedBy || 'Admin'}</p>
                    {report.rejectedReason && (
                      <p className="text-xs text-muted-foreground mt-1">Lý do: {report.rejectedReason}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(report.rejectedAt).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Repair History */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Lịch sử sửa chữa thiết bị
              {repairHistory.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {repairHistory.length}
                </Badge>
              )}
            </h3>
            {loadingRepairs ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Đang tải lịch sử sửa chữa...</p>
              </div>
            ) : repairHistory.length > 0 ? (
              <div className="space-y-3">
                {repairHistory.map((repair, index) => (
                  <Card key={repair.id} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Sửa chữa #{index + 1}</span>
                          <Badge variant={getRepairStatusBadge(repair.status)}>
                            {getRepairStatusText(repair.status)}
                          </Badge>
                        </div>
                        {(repair.repairDate || repair.startDate) && (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(repair.repairDate || repair.startDate)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm space-y-2">
                        {repair.description && (
                          <p>
                            <span className="text-muted-foreground font-medium">Mô tả:</span>{' '}
                            <span>{repair.description}</span>
                          </p>
                        )}
                        {repair.cost && (
                          <p>
                            <span className="text-muted-foreground font-medium">Chi phí:</span>{' '}
                            <span>{repair.cost.toLocaleString('vi-VN')} VND</span>
                          </p>
                        )}
                        {repair.repairCompany && (
                          <p>
                            <span className="text-muted-foreground font-medium">Công ty sửa chữa:</span>{' '}
                            <span>{repair.repairCompany}</span>
                          </p>
                        )}
                        {repair.technicianName && (
                          <p>
                            <span className="text-muted-foreground font-medium">Kỹ thuật viên:</span>{' '}
                            <span>{repair.technicianName}</span>
                          </p>
                        )}
                        {repair.startDate && repair.endDate && (
                          <p>
                            <span className="text-muted-foreground font-medium">Thời gian:</span>{' '}
                            <span>
                              {formatDate(repair.startDate)} - {formatDate(repair.endDate)}
                            </span>
                          </p>
                        )}
                        {repair.laborHours && (
                          <p>
                            <span className="text-muted-foreground font-medium">Giờ công:</span>{' '}
                            <span>{repair.laborHours} giờ</span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Thiết bị chưa có lịch sử sửa chữa nào.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {canReplaceDevice && (
              <Button
                onClick={() => setReplacementDialogOpen(true)}
                className="gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Thay thế thiết bị
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Replacement Dialog */}
      {report.device?.id && (
        <DeviceReplacementDialog
          open={replacementDialogOpen}
          onClose={() => setReplacementDialogOpen(false)}
          onSuccess={handleReplacementSuccess}
          deviceId={report.device.id}
          deviceCode={report.device.deviceCode || 'N/A'}
          deviceName={report.device.deviceName || 'N/A'}
          incidentReportId={report.id}
          title="Thay thế thiết bị từ sự cố"
        />
      )}
    </Dialog>
  )
}

