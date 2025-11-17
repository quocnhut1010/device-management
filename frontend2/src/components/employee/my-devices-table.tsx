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
        <CardTitle>My Devices</CardTitle>
        <CardDescription>Devices assigned to me</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.deviceCode}</TableCell>
                    <TableCell>{device.deviceName}</TableCell>
                    <TableCell>{device.departmentName || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {device.warrantyExpiry
                          ? new Date(device.warrantyExpiry).toLocaleDateString()
                          : 'N/A'}
                        {isWarrantyExpiringSoon(device.warrantyExpiry) && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            Expiring Soon
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

