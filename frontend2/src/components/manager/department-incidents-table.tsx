import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, ChevronUp } from 'lucide-react'
import { getManagerTables } from '@/services/dashboardService'
import { getUserProfile } from '@/services/userService'
import type { DepartmentIncidentDto } from '@/services/dashboardService'
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

export function DepartmentIncidentsTable() {
  const [incidents, setIncidents] = useState<DepartmentIncidentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

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
        setIncidents(tables.departmentIncidents)
      } catch (error) {
        console.error('Error loading department incidents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Limit to 5 items by default, show all if showAll is true
  const displayedIncidents = showAll ? incidents : incidents.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sự cố phòng ban</CardTitle>
            <CardDescription>Báo cáo sự cố từ phòng ban của bạn</CardDescription>
          </div>
          {incidents.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Thu gọn
                </>
              ) : (
                <>
                  <MoreHorizontal className="h-4 w-4" />
                  Xem tất cả ({incidents.length})
                </>
              )}
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
                <TableHead>Báo cáo bởi</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Loại</TableHead>
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
                    <TableCell>{incident.reportedBy}</TableCell>
                    <TableCell>{formatDateForTable(incident.reportDate)}</TableCell>
                    <TableCell>{incident.reportType || 'Không có'}</TableCell>
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

