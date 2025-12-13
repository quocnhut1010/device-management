import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, User, Package, FileText } from 'lucide-react'
import { formatDateOnly } from '@/lib/dateUtils'
import type { DeviceAssignmentDto } from '@/types'

interface AssignmentDetailDialogProps {
  open: boolean
  onClose: () => void
  assignment: DeviceAssignmentDto | null
}

export default function AssignmentDetailDialog({
  open,
  onClose,
  assignment,
}: AssignmentDetailDialogProps) {
  if (!assignment) return null

  const isActive = !assignment.returnedDate

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết phân công</DialogTitle>
          <DialogDescription>Thông tin đầy đủ về phân công thiết bị</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trạng thái:</span>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Đang hoạt động' : 'Đã trả'}
            </Badge>
          </div>

          <Separator />

          {/* Device Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Thông tin thiết bị
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tên thiết bị</p>
                <p className="font-medium">{assignment.deviceName || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mã thiết bị</p>
                <p className="font-medium">{assignment.deviceCode || '-'}</p>
              </div>
              {assignment.modelName && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{assignment.modelName}</p>
                </div>
              )}
              {assignment.deviceTypeName && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Loại thiết bị</p>
                  <p className="font-medium">{assignment.deviceTypeName}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Assignment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin phân công
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phân công cho</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{assignment.assignedToUserName || '-'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phòng ban</p>
                <p className="font-medium">{assignment.assignedToDepartmentName || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ngày phân công</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {assignment.assignedDate
                      ? formatDateOnly(assignment.assignedDate)
                      : '-'}
                  </p>
                </div>
              </div>
              {assignment.returnedDate && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ngày trả</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {formatDateOnly(assignment.returnedDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {assignment.note && (
            <>
              <Separator />
              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ghi chú
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Thông tin bổ sung</p>
                  <p className="font-medium whitespace-pre-wrap">{assignment.note}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

