import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAdminTables } from '@/services/dashboardService'
import type { ActiveRepairDto } from '@/services/dashboardService'

const getStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return 'Chờ thực hiện'
    case 1:
      return 'Đang sửa'
    case 2:
      return 'Chờ duyệt hoàn tất'
    case 3:
      return 'Đã hoàn tất'
    default:
      return 'Không xác định'
  }
}

const getStatusBadge = (status: number) => {
  const variants: Record<number, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    0: 'outline',
    1: 'default',
    2: 'secondary',
    3: 'default',
  }
  return <Badge variant={variants[status] || 'default'}>{getStatusLabel(status)}</Badge>
}

export function ActiveRepairsTable() {
  const [repairs, setRepairs] = useState<ActiveRepairDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const tables = await getAdminTables()
        setRepairs(tables.activeRepairs)
      } catch (error) {
        console.error('Error loading active repairs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lệnh sửa chữa đang hoạt động</CardTitle>
        <CardDescription>Các lệnh sửa chữa đang được thực hiện</CardDescription>
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
                <TableHead>Kỹ thuật viên</TableHead>
                <TableHead>Thời gian SLA còn lại</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Không có lệnh sửa chữa nào đang hoạt động
                  </TableCell>
                </TableRow>
              ) : (
                repairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">
                      {repair.deviceName} ({repair.deviceCode})
                    </TableCell>
                    <TableCell>{repair.technicianName || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          repair.slaRemaining?.includes('Overdue') || repair.slaRemaining?.includes('N/A')
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {repair.slaRemaining}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(repair.status)}</TableCell>
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

