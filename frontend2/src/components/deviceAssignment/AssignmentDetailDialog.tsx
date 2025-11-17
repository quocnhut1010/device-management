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
import { format } from 'date-fns'
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
          <DialogTitle className="text-2xl">Assignment Details</DialogTitle>
          <DialogDescription>Complete information about this device assignment</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Returned'}
            </Badge>
          </div>

          <Separator />

          {/* Device Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Device Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Device Name</p>
                <p className="font-medium">{assignment.deviceName || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Device Code</p>
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
                  <p className="text-sm text-muted-foreground">Device Type</p>
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
              Assignment Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{assignment.assignedToUserName || '-'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{assignment.assignedToDepartmentName || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assigned Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {assignment.assignedDate
                      ? format(new Date(assignment.assignedDate), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </p>
                </div>
              </div>
              {assignment.returnedDate && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Returned Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {format(new Date(assignment.returnedDate), 'MMM dd, yyyy HH:mm')}
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
                  Notes
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Additional Information</p>
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

