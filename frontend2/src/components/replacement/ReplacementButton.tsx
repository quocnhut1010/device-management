import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowLeftRight } from 'lucide-react'
import type { DeviceDto } from '@/types'
import { getUserFromToken } from '@/services/authService'
import DeviceReplacementDialog from './DeviceReplacementDialog'

interface ReplacementButtonProps {
  device: DeviceDto
  variant?: 'button' | 'iconButton' | 'menuItem'
  onSuccess?: () => void
  incidentReportId?: string // If replacement is from incident report
  disabled?: boolean
}

export default function ReplacementButton({
  device,
  variant = 'button',
  onSuccess,
  incidentReportId,
  disabled = false,
}: ReplacementButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const currentUser = getUserFromToken()
  const isAdmin = currentUser?.role === 'Admin'

  // Only admin can create replacements
  if (!isAdmin) {
    return null
  }

  const handleClick = () => {
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  // Check if device can be replaced
  const canReplace =
    device.status === 'Đang sử dụng' ||
    device.status === 'Đã hỏng' ||
    device.status === 'Đang sửa chữa'

  if (!canReplace) {
    const reason =
      device.status === 'Chưa cấp phát'
        ? 'Thiết bị chưa được cấp phát'
        : device.status === 'Đã thay thế'
          ? 'Thiết bị đã được thay thế'
          : 'Trạng thái thiết bị không phù hợp'

    if (variant === 'menuItem') {
      return (
        <DropdownMenuItem disabled>
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Thay thế thiết bị
        </DropdownMenuItem>
      )
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              {variant === 'iconButton' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="h-8 w-8"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="outline" disabled size="sm">
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Thay thế
                </Button>
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const content = () => {
    switch (variant) {
      case 'iconButton':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClick}
                  disabled={disabled}
                  className="h-8 w-8"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Thay thế thiết bị</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )

      case 'menuItem':
        return (
          <DropdownMenuItem onClick={handleClick} disabled={disabled}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Thay thế thiết bị
          </DropdownMenuItem>
        )

      default:
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Thay thế
          </Button>
        )
    }
  }

  return (
    <>
      {content()}

      <DeviceReplacementDialog
        open={dialogOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        deviceId={device.id}
        deviceCode={device.deviceCode || ''}
        deviceName={device.deviceName}
        incidentReportId={incidentReportId}
      />
    </>
  )
}

