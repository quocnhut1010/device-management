import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getEmployeeTables } from '@/services/dashboardService'
import type { MyIncidentDto } from '@/services/dashboardService'
import { formatDateForTable } from '@/lib/dateUtils'

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
  return <Badge variant={variants[status] || 'default'}>{getStatusLabel(status)}</Badge>
}

export function MyIncidentsTable() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<MyIncidentDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const tables = await getEmployeeTables()
        setIncidents(tables.myIncidents)
      } catch (error) {
        console.error('Error loading my incidents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Limit to 5 most recent incidents
  const displayedIncidents = incidents.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Báo cáo sự cố của tôi</CardTitle>
            <CardDescription>Sự cố tôi đã báo cáo và trạng thái của chúng</CardDescription>
          </div>
          {incidents.length > 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/incidents')}
            >
              Xem tất cả ({incidents.length})
            </Button>
          )}
        </div>
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
                <TableHead>Thiết bị</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Không tìm thấy sự cố
                  </TableCell>
                </TableRow>
              ) : (
                displayedIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">
                      {incident.deviceName} ({incident.deviceCode})
                    </TableCell>
                    <TableCell>{incident.reportType || 'Không có'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {incident.description || 'Không có'}
                    </TableCell>
                    <TableCell>{formatDateForTable(incident.reportDate)}</TableCell>
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

