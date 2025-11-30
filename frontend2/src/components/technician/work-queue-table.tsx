import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getTechnicianTables } from '@/services/dashboardService'
import type { WorkQueueDto } from '@/services/dashboardService'
import { formatDateForTable } from '@/lib/dateUtils'

const getPriorityBadge = (priority: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    low: 'default',
    medium: 'secondary',
    high: 'destructive',
    critical: 'destructive',
  }
  return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>
}

export function WorkQueueTable() {
  const [repairs, setRepairs] = useState<WorkQueueDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('[WorkQueueTable] Fetching technician tables...')
        const tables = await getTechnicianTables()
        console.log('[WorkQueueTable] Full response:', tables)
        console.log('[WorkQueueTable] workQueue:', tables.workQueue)
        console.log('[WorkQueueTable] workQueue type:', typeof tables.workQueue)
        console.log('[WorkQueueTable] workQueue is array:', Array.isArray(tables.workQueue))
        
        if (tables && tables.workQueue) {
          setRepairs(Array.isArray(tables.workQueue) ? tables.workQueue : [])
        } else {
          console.warn('[WorkQueueTable] No workQueue in response, setting empty array')
          setRepairs([])
        }
      } catch (error) {
        console.error('[WorkQueueTable] Error loading work queue:', error)
        setRepairs([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hàng đợi công việc</CardTitle>
        <CardDescription>Lệnh sửa chữa khả dụng được sắp xếp theo độ ưu tiên</CardDescription>
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
                <TableHead>Độ ưu tiên</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Không tìm thấy mục hàng đợi
                  </TableCell>
                </TableRow>
              ) : (
                repairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">
                      {repair.deviceName} ({repair.deviceCode})
                    </TableCell>
                    <TableCell>{getPriorityBadge(repair.priority)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          repair.sla?.includes('Overdue') || repair.sla?.includes('N/A')
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {repair.sla}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateForTable(repair.createdDate)}</TableCell>
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

