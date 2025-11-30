import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, ChevronUp } from 'lucide-react'
import { getManagerTables } from '@/services/dashboardService'
import { getUserProfile } from '@/services/userService'
import type { DepartmentRepairDto } from '@/services/dashboardService'
import { formatDateForTable } from '@/lib/dateUtils'

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

export function DepartmentRepairsTable() {
  const [repairs, setRepairs] = useState<DepartmentRepairDto[]>([])
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
        setRepairs(tables.departmentRepairs)
      } catch (error) {
        console.error('Error loading department repairs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Limit to 5 items by default, show all if showAll is true
  const displayedRepairs = showAll ? repairs : repairs.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lệnh sửa chữa phòng ban</CardTitle>
            <CardDescription>Lệnh sửa chữa cho thiết bị phòng ban</CardDescription>
          </div>
          {repairs.length > 5 && (
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
                  Xem tất cả ({repairs.length})
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
                <TableHead>Kỹ thuật viên</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRepairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Không tìm thấy lệnh sửa
                  </TableCell>
                </TableRow>
              ) : (
                displayedRepairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">
                      {repair.deviceName} ({repair.deviceCode})
                    </TableCell>
                    <TableCell>{repair.technicianName || 'Chưa gán'}</TableCell>
                    <TableCell>
                      {formatDateForTable(repair.startDate)}
                    </TableCell>
                    <TableCell>
                      {formatDateForTable(repair.endDate)}
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

