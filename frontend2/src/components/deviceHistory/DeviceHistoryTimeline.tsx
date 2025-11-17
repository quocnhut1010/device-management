import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type {
  DeviceHistoryTimelineData,
  DeviceHistoryData,
  ActionType,
} from '@/types/deviceHistory'
import { ACTION_TYPE_COLORS, ACTION_TYPE_LABELS } from '@/types/deviceHistory'
import { format, isToday, isYesterday } from 'date-fns'
import { vi } from 'date-fns/locale'

interface DeviceHistoryTimelineProps {
  timelineData: DeviceHistoryTimelineData[]
  showDeviceInfo?: boolean
  onEventClick?: (event: DeviceHistoryData) => void
}

const getActionIcon = (actionType: string) => {
  switch (actionType as ActionType) {
    case 'CREATE':
      return <Plus className="h-3 w-3" />
    case 'UPDATE':
      return <Edit className="h-3 w-3" />
    case 'DELETE':
      return <Trash2 className="h-3 w-3" />
    case 'RESTORE':
      return <RotateCcw className="h-3 w-3" />
    case 'ASSIGNMENT':
      return <UserCheck className="h-3 w-3" />
    case 'REVOCATION':
      return <UserX className="h-3 w-3" />
    case 'MAINTENANCE':
      return <Wrench className="h-3 w-3" />
    case 'REPAIR':
      return <Hammer className="h-3 w-3" />
    case 'REPLACEMENT':
      return <ArrowLeftRight className="h-3 w-3" />
    case 'LIQUIDATION':
      return <Trash className="h-3 w-3" />
    case 'SYSTEM':
      return <Settings className="h-3 w-3" />
    default:
      return <Info className="h-3 w-3" />
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

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString)
  if (isToday(date)) {
    return 'Hôm nay'
  } else if (isYesterday(date)) {
    return 'Hôm qua'
  } else {
    return format(date, 'dd/MM/yyyy', { locale: vi })
  }
}

const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'HH:mm', { locale: vi })
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface TimelineDayItemProps {
  dayData: DeviceHistoryTimelineData
  showDeviceInfo?: boolean
  onEventClick?: (event: DeviceHistoryData) => void
}

const TimelineDayItem: React.FC<TimelineDayItemProps> = ({
  dayData,
  showDeviceInfo,
  onEventClick,
}) => {
  const [expanded, setExpanded] = useState(dayData.eventCount <= 3)

  const visibleEvents = expanded
    ? dayData.events
    : dayData.events.slice(0, 3)
  const hasMore = dayData.events.length > 3

  return (
    <div className="flex gap-4 mb-6">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${getActionColor(dayData.events[0]?.actionType || 'default')}`} />
        <div className="w-0.5 h-full bg-border mt-2 min-h-[50px]" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{formatDateLabel(dayData.date)}</h3>
            <Badge variant="outline" className="mt-1">
              {dayData.eventCount} sự kiện
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {visibleEvents.map((event, index) => (
                <div key={event.id}>
                  <div
                    className={`flex gap-3 items-start ${onEventClick ? 'cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2' : ''}`}
                    onClick={() => onEventClick?.(event)}
                  >
                    <Avatar
                      className={`h-8 w-8 ${getActionColor(event.actionType)}`}
                    >
                      <AvatarFallback className="bg-transparent text-white">
                        {getActionIcon(event.actionType)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-medium text-sm">{event.action}</p>
                          <div className="flex gap-2 items-center mt-1">
                            <Badge
                              variant={getBadgeVariant(event.actionType)}
                              className="text-xs"
                            >
                              {ACTION_TYPE_LABELS[event.actionType as ActionType] ||
                                event.actionType}
                            </Badge>
                            {showDeviceInfo && (
                              <Badge variant="outline" className="text-xs">
                                {event.deviceName}
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {formatTime(event.actionDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5 text-xs">
                          <AvatarFallback>
                            {getInitials(event.actionByName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {event.actionByName}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < visibleEvents.length - 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="w-full"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Xem thêm {dayData.events.length - 3} sự kiện
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const DeviceHistoryTimeline: React.FC<DeviceHistoryTimelineProps> = ({
  timelineData,
  showDeviceInfo = false,
  onEventClick,
}) => {
  if (timelineData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Không có dữ liệu lịch sử
          </h3>
          <p className="text-sm text-muted-foreground">
            Chưa có hoạt động nào được ghi lại trong khoảng thời gian này.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-0">
      {timelineData.map((dayData) => (
        <TimelineDayItem
          key={dayData.date}
          dayData={dayData}
          showDeviceInfo={showDeviceInfo}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  )
}

export default DeviceHistoryTimeline
