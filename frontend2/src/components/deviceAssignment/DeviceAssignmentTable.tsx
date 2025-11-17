import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RotateCcw, Eye } from 'lucide-react'
import { format } from 'date-fns'
import type { DeviceAssignmentDto } from '@/types'

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
}

const DeviceAssignmentTable: React.FC<Props> = ({
  assignments,
  onRevoke,
  onView,
  onSearchChange,
  onStatusChange,
  totalCount,
  loading,
  searchValue = '',
  statusValue = 'all',
}) => {
  const isActive = (assignment: DeviceAssignmentDto) => !assignment.returnedDate

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment History</CardTitle>
        <CardDescription>View all device assignments and returns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by device or user name..."
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
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Returned Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                      ? format(new Date(a.assignedDate), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {a.returnedDate
                      ? format(new Date(a.returnedDate), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive(a) ? 'default' : 'secondary'}>
                      {isActive(a) ? 'active' : 'returned'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{a.note || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView?.(a)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isActive(a) && (
                        <Button variant="outline" size="sm" onClick={() => onRevoke(a)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Return
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default DeviceAssignmentTable
