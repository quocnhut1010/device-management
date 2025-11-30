import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAdminTables } from '@/services/dashboardService'
import type { RecentIncidentDto } from '@/services/dashboardService'

const getStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return 'Chờ duyệt'
    case 1:
      return 'Đã tạo lệnh sửa'
    case 2:
      return 'Đã từ chối'
    case 3:
      return 'Đã đóng'
    case 4:
      return 'Đang xử lý'
    default:
      return 'Không xác định'
  }
}

const getStatusBadge = (status: number) => {
  const variants: Record<number, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    0: 'outline',
    1: 'default',
    2: 'destructive',
    3: 'default',
    4: 'secondary',
  }
  return (
    <Badge variant={variants[status] || 'default'}>{getStatusLabel(status)}</Badge>
  )
}

export function RecentIncidentsTable() {
  const [incidents, setIncidents] = useState<RecentIncidentDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const tables = await getAdminTables()
        setIncidents(tables.recentIncidents)
      } catch (error) {
        console.error('Error loading recent incidents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sự cố gần đây</CardTitle>
        <CardDescription>Các báo cáo sự cố mới nhất cần được xử lý</CardDescription>
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
                <TableHead>Người báo cáo</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Không có sự cố nào
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">
                      {incident.deviceName} ({incident.deviceCode})
                    </TableCell>
                    <TableCell>{incident.reportedBy}</TableCell>
                    <TableCell>{new Date(incident.reportDate).toLocaleDateString()}</TableCell>
                    <TableCell>{incident.reportType || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
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

