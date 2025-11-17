import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Filter, X, Search } from 'lucide-react'
import type { DeviceHistoryFilter } from '@/types/deviceHistory'
import { ACTION_TYPE_LABELS } from '@/types/deviceHistory'
import {
  getAvailableActions,
  getAvailableActionTypes,
} from '@/services/deviceHistoryService'

interface DeviceHistoryFiltersProps {
  filters: DeviceHistoryFilter
  onFiltersChange: (filters: DeviceHistoryFilter) => void
  onApply: () => void
  onClear: () => void
}

const DeviceHistoryFilters: React.FC<DeviceHistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onClear,
}) => {
  const [availableActions, setAvailableActions] = useState<string[]>([])
  const [availableActionTypes, setAvailableActionTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadAvailableOptions()
  }, [])

  const loadAvailableOptions = async () => {
    setLoading(true)
    try {
      const [actions, actionTypes] = await Promise.all([
        getAvailableActions(),
        getAvailableActionTypes(),
      ])
      setAvailableActions(actions)
      setAvailableActionTypes(actionTypes)
    } catch (error) {
      console.error('Error loading filter options:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: keyof DeviceHistoryFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
      page: 1, // Reset to first page when filters change
    })
  }

  const handleDateChange = (field: 'fromDate' | 'toDate', value: string) => {
    const date = value ? new Date(value).toISOString() : undefined
    handleFilterChange(field, date)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.action) count++
    if (filters.actionType) count++
    if (filters.fromDate) count++
    if (filters.toDate) count++
    if (filters.deviceId) count++
    if (filters.userId) count++
    return count
  }

  const formatDateForInput = (isoString?: string) => {
    if (!isoString) return ''
    return new Date(isoString).toISOString().slice(0, 16)
  }

  return (
    <Card className="mb-4">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Bộ lọc lịch sử thiết bị</CardTitle>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="default">
                    {getActiveFiltersCount()} bộ lọc
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Action Filter */}
              <div className="space-y-2">
                <Label>Hành động</Label>
                <Select
                  value={filters.action || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('action', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {availableActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Type Filter */}
              <div className="space-y-2">
                <Label>Loại hành động</Label>
                <Select
                  value={filters.actionType || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('actionType', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {availableActionTypes.map((actionType) => (
                      <SelectItem key={actionType} value={actionType}>
                        {ACTION_TYPE_LABELS[actionType as keyof typeof ACTION_TYPE_LABELS] ||
                          actionType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From Date */}
              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Input
                  type="datetime-local"
                  value={formatDateForInput(filters.fromDate)}
                  onChange={(e) => handleDateChange('fromDate', e.target.value)}
                />
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Input
                  type="datetime-local"
                  value={formatDateForInput(filters.toDate)}
                  onChange={(e) => handleDateChange('toDate', e.target.value)}
                />
              </div>

              {/* Page Size */}
              <div className="space-y-2">
                <Label>Số bản ghi/trang</Label>
                <Select
                  value={(filters.pageSize || 20).toString()}
                  onValueChange={(value) =>
                    handleFilterChange('pageSize', Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sắp xếp theo</Label>
                <Select
                  value={filters.sortBy || 'ActionDate'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ActionDate">Ngày thực hiện</SelectItem>
                    <SelectItem value="Action">Hành động</SelectItem>
                    <SelectItem value="ActionType">Loại hành động</SelectItem>
                    <SelectItem value="DeviceName">Tên thiết bị</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>Thứ tự sắp xếp</Label>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onValueChange={(value) =>
                    handleFilterChange('sortOrder', value as 'asc' | 'desc')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Giảm dần</SelectItem>
                    <SelectItem value="asc">Tăng dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={onClear}>
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
              <Button onClick={onApply}>
                <Search className="h-4 w-4 mr-2" />
                Áp dụng
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default DeviceHistoryFilters
