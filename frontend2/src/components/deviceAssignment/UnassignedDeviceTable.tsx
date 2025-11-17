import React from 'react'
import type { DeviceAssignmentDto, DeviceAssignmentFilters } from '@/types'
import DeviceAssignmentFiltersComponent from './DeviceAssignmentFilters'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Props {
  devices: DeviceAssignmentDto[]
  onAssign: (device: DeviceAssignmentDto) => void
  filters: DeviceAssignmentFilters
  onFiltersChange: (filters: DeviceAssignmentFilters) => void
  onSearch: () => void
  onClearFilters: () => void
}

const UnassignedDeviceTable: React.FC<Props> = ({
  devices,
  onAssign,
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters,
}) => {
  return (
    <div className="space-y-4">
      <DeviceAssignmentFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        onSearch={onSearch}
        onClear={onClearFilters}
      />

      <div className="rounded-md border">
        <div className="flex items-center justify-between p-4">
          <div className="text-lg font-semibold">Thiết bị chưa cấp phát</div>
          <div className="text-sm text-muted-foreground">
            Tổng cộng: <strong>{devices.length}</strong> thiết bị
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã thiết bị</TableHead>
              <TableHead>Tên thiết bị</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[120px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((d) => (
              <TableRow key={d.id || d.deviceId}>
                <TableCell>{d.deviceCode}</TableCell>
                <TableCell>{d.deviceName}</TableCell>
                <TableCell>{d.modelName}</TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => onAssign(d)}>Cấp phát</Button>
                </TableCell>
              </TableRow>
            ))}
            {devices.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Không có thiết bị nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default UnassignedDeviceTable

