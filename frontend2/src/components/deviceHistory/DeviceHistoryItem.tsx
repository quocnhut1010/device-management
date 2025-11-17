import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  UserCheck,
  UserX,
  Wrench,
  Hammer,
  ArrowLeftRight,
  Trash,
  Settings,
  Info,
} from 'lucide-react'
import type { DeviceHistoryData, ActionType } from '@/types/deviceHistory'
import { ACTION_TYPE_COLORS, ACTION_TYPE_LABELS } from '@/types/deviceHistory'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface DeviceHistoryItemProps {
  history: DeviceHistoryData
  showDeviceInfo?: boolean
  onViewDetails?: (history: DeviceHistoryData) => void
}

const getActionIcon = (actionType: string) => {
  switch (actionType as ActionType) {
    case 'CREATE':
      return <Plus className="h-4 w-4" />
    case 'UPDATE':
      return <Edit className="h-4 w-4" />
    case 'DELETE':
      return <Trash2 className="h-4 w-4" />
    case 'RESTORE':
      return <RotateCcw className="h-4 w-4" />
    case 'ASSIGNMENT':
      return <UserCheck className="h-4 w-4" />
    case 'REVOCATION':
      return <UserX className="h-4 w-4" />
    case 'MAINTENANCE':
      return <Wrench className="h-4 w-4" />
    case 'REPAIR':
      return <Hammer className="h-4 w-4" />
    case 'REPLACEMENT':
      return <ArrowLeftRight className="h-4 w-4" />
    case 'LIQUIDATION':
      return <Trash className="h-4 w-4" />
    case 'SYSTEM':
      return <Settings className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

const getActionColor = (actionType: string): string => {
  const color = ACTION_TYPE_COLORS[actionType as ActionType] || 'default'
  const colorMap: Record<string, string> = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    default: 'bg-gray-500',
  }
  return colorMap[color] || colorMap.default
}

const getBadgeVariant = (actionType: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const color = ACTION_TYPE_COLORS[actionType as ActionType] || 'default'
  switch (color) {
    case 'error':
      return 'destructive'
    case 'success':
      return 'default'
    case 'warning':
      return 'secondary'
    default:
      return 'outline'
  }
}

const DeviceHistoryItem: React.FC<DeviceHistoryItemProps> = ({
  history,
  showDeviceInfo = false,
  onViewDetails,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
    } catch {
      return dateString
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Action Icon */}
          <Avatar className={`h-12 w-12 ${getActionColor(history.actionType)}`}>
            <AvatarFallback className="bg-transparent text-white">
              {getActionIcon(history.actionType)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg mb-1">{history.action}</h3>
                <div className="flex gap-2 items-center mb-2">
                  <Badge variant={getBadgeVariant(history.actionType)}>
                    {ACTION_TYPE_LABELS[history.actionType as ActionType] ||
                      history.actionType}
                  </Badge>
                  {showDeviceInfo && (
                    <Badge variant="outline">{history.deviceName}</Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              {onViewDetails && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(history)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Xem chi tiết</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Description */}
            {history.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {history.description}
              </p>
            )}

            {/* Footer with user and date info */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 text-xs">
                  <AvatarFallback>
                    {getInitials(history.actionByName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {history.actionByName}
                </span>
              </div>

              <span className="text-sm text-muted-foreground">
                {formatDate(history.actionDate)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DeviceHistoryItem
