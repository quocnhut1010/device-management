import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { DeviceAssignmentFilters } from '@/types'
import { getActiveDeviceModels } from '@/services/deviceModelService'
import type { DeviceModelDto } from '@/types'

interface Props {
  filters: DeviceAssignmentFilters
  onFiltersChange: (filters: DeviceAssignmentFilters) => void
  onSearch: () => void
  onClear: () => void
}

const DeviceAssignmentFiltersComponent: React.FC<Props> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
}) => {
  const [models, setModels] = useState<DeviceModelDto[]>([])

  const statusValue = filters.status ?? 'all'
  const modelValue = filters.modelName ?? 'all'

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getActiveDeviceModels()
        setModels(res.data)
      } catch {
        // no-op
      }
    })()
  }, [])

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="text-lg font-semibold">Bộ lọc nâng cao</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select
            value={statusValue}
            onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Chưa cấp phát">Chưa cấp phát</SelectItem>
              <SelectItem value="Sẵn sàng">Sẵn sàng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Model</Label>
          <Select
            value={modelValue}
            onValueChange={(v) => onFiltersChange({ ...filters, modelName: v === 'all' ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn model..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.modelName}>{m.modelName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Mã thiết bị</Label>
          <Input
            placeholder="Nhập mã thiết bị..."
            value={filters.deviceCode ?? ''}
            onChange={(e) => onFiltersChange({ ...filters, deviceCode: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSearch}>Tìm kiếm</Button>
        <Button variant="outline" onClick={() => { onFiltersChange({}); onClear(); }}>Xóa bộ lọc</Button>
      </div>
    </div>
  )
}

export default DeviceAssignmentFiltersComponent

