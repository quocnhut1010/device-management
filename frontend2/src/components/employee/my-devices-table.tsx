import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getEmployeeTables } from '@/services/dashboardService'
import type { MyDeviceDto } from '@/services/dashboardService'

const isWarrantyExpiringSoon = (warrantyExpiry?: string) => {
  if (!warrantyExpiry) return false
  const expiryDate = new Date(warrantyExpiry)
  const today = new Date()
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysUntilExpiry <= 90 && daysUntilExpiry > 0
}

export function MyDevicesTable() {
  const [devices, setDevices] = useState<MyDeviceDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const tables = await getEmployeeTables()
        setDevices(tables.myDevices)
      } catch (error) {
        console.error('Error loading my devices:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thiết bị của tôi</CardTitle>
        <CardDescription>Thiết bị được gán cho tôi</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Bảo hành</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Không tìm thấy thiết bị
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.deviceCode}</TableCell>
                    <TableCell>{device.deviceName}</TableCell>
                    <TableCell>{device.departmentName || 'Không có'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {device.warrantyExpiry
                          ? new Date(device.warrantyExpiry).toLocaleDateString()
                          : 'Không có'}
                        {isWarrantyExpiringSoon(device.warrantyExpiry) && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            Sắp hết hạn
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{device.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

