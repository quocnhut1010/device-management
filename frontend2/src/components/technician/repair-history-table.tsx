import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import { getTechnicianTables } from '@/services/dashboardService'
import type { RepairHistoryDto } from '@/services/dashboardService'
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

export function RepairHistoryTable() {
  const [repairs, setRepairs] = useState<RepairHistoryDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('[RepairHistoryTable] Fetching technician tables...')
        const tables = await getTechnicianTables()
        console.log('[RepairHistoryTable] Full response:', tables)
        console.log('[RepairHistoryTable] repairHistory:', tables.repairHistory)
        console.log('[RepairHistoryTable] repairHistory type:', typeof tables.repairHistory)
        console.log('[RepairHistoryTable] repairHistory is array:', Array.isArray(tables.repairHistory))
        
        if (tables && tables.repairHistory) {
          setRepairs(Array.isArray(tables.repairHistory) ? tables.repairHistory : [])
        } else {
          console.warn('[RepairHistoryTable] No repairHistory in response, setting empty array')
          setRepairs([])
        }
      } catch (error) {
        console.error('[RepairHistoryTable] Error loading repair history:', error)
        setRepairs([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const calculateDuration = (startDate?: string, endDate?: string): string => {
    if (!startDate || !endDate) return 'Không có'
    const start = new Date(startDate)
    const end = new Date(endDate)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return `${hours.toFixed(1)}h`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử sửa chữa gần đây</CardTitle>
        <CardDescription>Các lần sửa chữa đã hoàn thành và kết quả của tôi</CardDescription>
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
                <TableHead>Mô tả</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Chi phí</TableHead>
                <TableHead>Hoàn thành</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Không tìm thấy lịch sử sửa chữa
                  </TableCell>
                </TableRow>
              ) : (
                repairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">
                      {repair.deviceName} ({repair.deviceCode})
                    </TableCell>
                    <TableCell>{repair.description || 'Không có'}</TableCell>
                    <TableCell>{calculateDuration(repair.startDate, repair.endDate)}</TableCell>
                    <TableCell>
                      {repair.cost ? `${repair.cost.toLocaleString()} VNĐ` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {repair.endDate ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {formatDateForTable(repair.endDate)}
                        </Badge>
                      ) : (
                        <Badge variant="outline">{getStatusLabel(repair.status)}</Badge>
                      )}
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

