import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RejectAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deviceName?: string
  deviceCode?: string
  onConfirm: (rejectionReason: string) => void
}

export function RejectAssignmentDialog({
  open,
  onOpenChange,
  deviceName,
  deviceCode,
  onConfirm,
}: RejectAssignmentDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!rejectionReason.trim()) {
      setError('Vui lòng nhập lý do từ chối')
      return
    }

    if (rejectionReason.trim().length < 10) {
      setError('Lý do từ chối phải có ít nhất 10 ký tự')
      return
    }

    setError('')
    onConfirm(rejectionReason.trim())
    setRejectionReason('')
  }

  const handleCancel = () => {
    setRejectionReason('')
    setError('')
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận từ chối nhận thiết bị
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Bạn có chắc chắn muốn từ chối nhận thiết bị{' '}
              <span className="font-semibold">{deviceName || deviceCode || 'này'}</span>?
            </div>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Sau khi từ chối, thiết bị sẽ không được gán cho bạn và có thể được cấp phát cho người khác.
              </AlertDescription>
            </Alert>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rejectionReason">
            Lý do từ chối <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="rejectionReason"
            placeholder="Nhập lý do từ chối nhận thiết bị (tối thiểu 10 ký tự)..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value)
              setError('')
            }}
            rows={4}
            className={error ? 'border-destructive' : ''}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Xác nhận từ chối
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

