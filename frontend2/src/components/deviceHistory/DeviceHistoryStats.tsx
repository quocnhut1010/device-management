import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart3,
  TrendingUp,
  Activity,
  History,
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
import type { DeviceHistoryStats as StatsData, ActionType } from '@/types/deviceHistory'
import { ACTION_TYPE_COLORS, ACTION_TYPE_LABELS, ACTION_LABELS } from '@/types/deviceHistory'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface DeviceHistoryStatsProps {
  stats: StatsData
  loading?: boolean
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

const StatCard: React.FC<{
  title: string
  value: number
  icon: React.ReactNode
  color?: string
  subtitle?: string
}> = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </CardContent>
  </Card>
)

const DeviceHistoryStats: React.FC<DeviceHistoryStatsProps> = ({
  stats,
  loading = false,
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

  const getMaxCount = (data: Record<string, number>) => {
    return Math.max(...Object.values(data), 1)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng sự kiện"
          value={stats.totalEvents}
          icon={<BarChart3 className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Sự kiện gần đây"
          value={stats.recentEvents}
          icon={<TrendingUp className="h-4 w-4" />}
          color="bg-green-500"
          subtitle="7 ngày qua"
        />
        <StatCard
          title="Loại hoạt động"
          value={Object.keys(stats.eventsByType).length}
          icon={<Activity className="h-4 w-4" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Hoạt động gần nhất"
          value={stats.recentActivities.length}
          icon={<History className="h-4 w-4" />}
          color="bg-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo loại hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(stats.eventsByType).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.eventsByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const percentage =
                      (count / getMaxCount(stats.eventsByType)) * 100
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar
                              className={`h-6 w-6 ${getActionColor(type)}`}
                            >
                              <AvatarFallback className="bg-transparent text-white">
                                {getActionIcon(type)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {ACTION_TYPE_LABELS[type as ActionType] || type}
                            </span>
                          </div>
                          <span className="text-sm font-bold">{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Không có dữ liệu
              </p>
            )}
          </CardContent>
        </Card>

        {/* Events by Action */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo hành động</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(stats.eventsByAction).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.eventsByAction)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([action, count]) => {
                    const percentage =
                      (count / getMaxCount(stats.eventsByAction)) * 100
                    const label = ACTION_LABELS[action] || action
                    return (
                      <div key={action} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm truncate max-w-[75%]">
                            {label}
                          </span>
                          <span className="text-sm font-bold">{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Không có dữ liệu
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex gap-3">
                    <Avatar
                      className={`h-10 w-10 ${getActionColor(activity.actionType)}`}
                    >
                      <AvatarFallback className="bg-transparent text-white">
                        {getActionIcon(activity.actionType)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-1">
                        <span className="font-medium text-sm">
                          {activity.action}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.deviceName}
                        </Badge>
                        <Badge
                          variant={getBadgeVariant(activity.actionType)}
                          className="text-xs"
                        >
                          {ACTION_TYPE_LABELS[activity.actionType as ActionType] ||
                            activity.actionType}
                        </Badge>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5 text-xs">
                            <AvatarFallback>
                              {getInitials(activity.actionByName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {activity.actionByName}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.actionDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < stats.recentActivities.length - 1 && (
                    <div className="border-t my-4" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-md">
              <p className="text-muted-foreground">
                Không có hoạt động gần đây
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DeviceHistoryStats
