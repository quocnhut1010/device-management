import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getManagerTables } from '@/services/dashboardService'
import { getUserProfile } from '@/services/userService'
import type { DepartmentDeviceDto } from '@/services/dashboardService'

export function DepartmentDevicesTable() {
  const [devices, setDevices] = useState<DepartmentDeviceDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const profileResponse = await getUserProfile()
        const departmentId = profileResponse.data.departmentId
        if (!departmentId) {
          console.error('No department ID found for manager')
          return
        }
        const tables = await getManagerTables(departmentId)
        setDevices(tables.departmentDevices)
      } catch (error) {
        console.error('Error loading department devices:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Devices</CardTitle>
        <CardDescription>All devices assigned to your department</CardDescription>
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
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Warranty Expiry</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">{device.status}</Badge>
                    </TableCell>
                    <TableCell>{device.assignedTo || 'Unassigned'}</TableCell>
                    <TableCell>
                      {device.warrantyExpiry
                        ? new Date(device.warrantyExpiry).toLocaleDateString()
                        : 'N/A'}
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

