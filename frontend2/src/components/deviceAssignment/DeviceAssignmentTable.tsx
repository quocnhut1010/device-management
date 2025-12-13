import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RotateCcw, Eye } from 'lucide-react'
import { formatDateForTable } from '@/lib/dateUtils'
import type { DeviceAssignmentDto } from '@/types'

interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

interface Props {
  assignments: DeviceAssignmentDto[]
  onRevoke: (assignment: DeviceAssignmentDto) => void
  onView?: (assignment: DeviceAssignmentDto) => void
  onSearchChange?: (value: string) => void
  onStatusChange?: (value: 'all' | 'active' | 'returned') => void
  totalCount?: number
  loading?: boolean
  searchValue?: string
  statusValue?: 'all' | 'active' | 'returned'
  pagination?: PaginationProps
}

const DeviceAssignmentTable: React.FC<Props> = ({
  assignments,
  onRevoke,
  onView,
  onSearchChange,
  onStatusChange,
  totalCount = 0,
  loading,
  searchValue = '',
  statusValue = 'all',
  pagination,
}) => {
  const isActive = (assignment: DeviceAssignmentDto) => !assignment.returnedDate

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử cấp phát thiết bị</CardTitle>
        <CardDescription>
          {pagination
            ? `Hiển thị ${pagination.page * pagination.pageSize + 1} - ${Math.min(
                (pagination.page + 1) * pagination.pageSize,
                pagination.totalCount
              )} trong tổng số ${pagination.totalCount} lượt cấp phát`
            : 'Xem tất cả lượt cấp phát và thu hồi thiết bị'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên thiết bị hoặc người dùng..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusValue}
            onValueChange={(v) => onStatusChange?.(v as 'all' | 'active' | 'returned')}
          >
            <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang cấp phát</SelectItem>
              <SelectItem value="returned">Đã thu hồi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thiết bị</TableHead>
              <TableHead>Người được cấp phát</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Ngày cấp phát</TableHead>
              <TableHead>Ngày thu hồi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Không có thiết bị nào đang được cấp phát
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.deviceName}</TableCell>
                  <TableCell>{a.assignedToUserName}</TableCell>
                  <TableCell>{a.assignedToDepartmentName}</TableCell>
                  <TableCell>
                    {a.assignedDate
                      ? formatDateForTable(a.assignedDate)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {a.returnedDate
                      ? formatDateForTable(a.returnedDate)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive(a) ? 'default' : 'secondary'}>
                      {isActive(a) ? 'Đang cấp phát' : 'Đã thu hồi'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{a.note || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView?.(a)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isActive(a) && (
                        <Button variant="outline" size="sm" onClick={() => onRevoke(a)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Thu hồi
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && assignments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {pagination.page * pagination.pageSize + 1} -{' '}
              {Math.min(
                (pagination.page + 1) * pagination.pageSize,
                pagination.totalCount
              )}{' '}
              trong tổng số {pagination.totalCount} lượt cấp phát
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 0 || loading}
              >
                Trước
              </Button>
              <span className="text-sm">
                Trang {pagination.page + 1} / {Math.ceil(pagination.totalCount / pagination.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={
                  pagination.page >=
                    Math.ceil(pagination.totalCount / pagination.pageSize) - 1 ||
                  loading
                }
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DeviceAssignmentTable
