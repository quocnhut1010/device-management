import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { EligibleDeviceDto } from '@/types/liquidation'
import { cn } from '@/lib/utils'

interface EligibleDevicesTableProps {
  devices: EligibleDeviceDto[]
  selectedDeviceIds: string[]
  onSelectDevice: (deviceId: string) => void
  onSelectAll: (checked: boolean) => void
}

function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function getStatusColor(status: string): 'default' | 'destructive' | 'secondary' | 'outline' {
  switch (status) {
    case 'Chờ thanh lý':
      return 'secondary'
    case 'Đã hỏng':
      return 'destructive'
    case 'Mất':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default function EligibleDevicesTable({
  devices,
  selectedDeviceIds,
  onSelectDevice,
  onSelectAll,
}: EligibleDevicesTableProps) {
  const allSelected = devices.length > 0 && selectedDeviceIds.length === devices.length
  const someSelected = selectedDeviceIds.length > 0 && selectedDeviceIds.length < devices.length

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Chọn tất cả"
              />
            </TableHead>
            <TableHead>Mã thiết bị</TableHead>
            <TableHead>Tên thiết bị</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Lý do đủ điều kiện</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead className="text-right">Giá trị (VND)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Không có thiết bị nào đủ điều kiện thanh lý
              </TableCell>
            </TableRow>
          ) : (
            devices.map((device) => {
              const isSelected = selectedDeviceIds.includes(device.id)
              return (
                <TableRow
                  key={device.id}
                  className={cn('cursor-pointer', isSelected && 'bg-muted/50')}
                  onClick={() => onSelectDevice(device.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectDevice(device.id)}
                      aria-label={`Chọn ${device.deviceCode}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{device.deviceCode}</TableCell>
                  <TableCell>{device.deviceName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(device.status)}>{device.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm truncate block" title={device.eligibilityReason}>
                      {device.eligibilityReason}
                    </span>
                  </TableCell>
                  <TableCell>{device.currentDepartmentName || '—'}</TableCell>
                  <TableCell>{device.currentUserFullName || '—'}</TableCell>
                  <TableCell className="text-right">
                    {device.purchasePrice ? formatCurrency(device.purchasePrice) : '—'}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

