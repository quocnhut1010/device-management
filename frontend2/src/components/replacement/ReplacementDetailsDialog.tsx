import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeftRight,
  Package,
  User,
  Calendar,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import type { ReplacementDto } from '@/types'
import {
  formatReplacementDate,
  getReplacementStatusText,
} from '@/services/replacementService'

interface ReplacementDetailsDialogProps {
  open: boolean
  onClose: () => void
  replacement: ReplacementDto | null
}

export default function ReplacementDetailsDialog({
  open,
  onClose,
  replacement,
}: ReplacementDetailsDialogProps) {
  if (!replacement) return null

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A'
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Chi tiết thay thế thiết bị
          </DialogTitle>
          <DialogDescription>
            ID: {replacement.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-end">
            <Badge
              variant={replacement.replacementDate ? 'default' : 'secondary'}
              className={
                replacement.replacementDate
                  ? 'bg-green-500 hover:bg-green-600'
                  : ''
              }
            >
              {getReplacementStatusText(replacement)}
            </Badge>
          </div>

          {/* Device Replacement Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowLeftRight className="h-5 w-5" />
                Quá trình thay thế
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Old Device */}
                <div className="md:col-span-5">
                  <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50 text-center">
                    <Avatar className="h-12 w-12 mx-auto mb-2 bg-red-500">
                      <AvatarFallback>
                        <Package className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-red-700 mb-1">
                      Thiết bị cũ (được thay thế)
                    </p>
                    <p className="font-bold text-lg">{replacement.oldDeviceCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {replacement.oldDeviceName}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="md:col-span-2 flex justify-center">
                  <ArrowLeftRight className="h-8 w-8 text-primary" />
                </div>

                {/* New Device */}
                <div className="md:col-span-5">
                  <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50 text-center">
                    <Avatar className="h-12 w-12 mx-auto mb-2 bg-green-500">
                      <AvatarFallback>
                        <Package className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      Thiết bị mới (thay thế)
                    </p>
                    <p className="font-bold text-lg">{replacement.newDeviceCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {replacement.newDeviceName}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          {replacement.userFullName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Người dùng được gán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{replacement.userFullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {replacement.userEmail}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Replacement Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin thay thế</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày thay thế</p>
                    <p className="font-semibold">
                      {formatDate(replacement.replacementDate)}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                    <Badge
                      variant={
                        replacement.replacementDate ? 'default' : 'secondary'
                      }
                      className={
                        replacement.replacementDate
                          ? 'bg-green-500 hover:bg-green-600'
                          : ''
                      }
                    >
                      {getReplacementStatusText(replacement)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reason */}
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Lý do thay thế
                  </p>
                  <p className="text-sm">
                    {replacement.reason || 'Không có lý do được ghi nhận'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Lưu ý:</strong> Việc thay thế này đã được thực hiện tự động
                bao gồm:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Cập nhật trạng thái thiết bị cũ thành "Đã thay thế"</li>
                <li>Gán thiết bị mới cho người dùng hiện tại</li>
                <li>Ghi lại lịch sử thay đổi cho cả hai thiết bị</li>
                <li>Tạo bản ghi cấp phát mới cho thiết bị thay thế</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

