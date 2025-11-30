import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { getAdminTables } from '@/services/dashboardService'
import type { RiskDeviceDto } from '@/services/dashboardService'

export function RiskDevicesTable() {
  const [devices, setDevices] = useState<RiskDeviceDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const tables = await getAdminTables()
        setDevices(tables.riskDevices)
      } catch (error) {
        console.error('Error loading risk devices:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Thiết bị rủi ro cao
        </CardTitle>
        <CardDescription>
          Thiết bị cần chú ý dựa trên lịch sử sự cố và thời gian sử dụng
        </CardDescription>
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
                <TableHead>Thiết bị</TableHead>
                <TableHead>Số sự cố</TableHead>
                <TableHead>Tuổi đời</TableHead>
                <TableHead>Khuyến nghị</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Không có thiết bị rủi ro nào
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">
                      {device.deviceName} ({device.deviceCode})
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{device.incidentCount}</Badge>
                    </TableCell>
                    <TableCell>{device.age}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{device.recommendation}</Badge>
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

