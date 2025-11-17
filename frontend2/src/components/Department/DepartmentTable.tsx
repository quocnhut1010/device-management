import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Edit, Trash2, RotateCcw, Building2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DepartmentDto, UserDto } from '@/types'

interface DepartmentTableProps {
  data: DepartmentDto[]
  users?: UserDto[]
  onEdit: (department: DepartmentDto) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isAdmin: boolean
  isManager: boolean
  statusFilter: 'all' | 'active' | 'deleted'
  isLoading?: boolean
}

export default function DepartmentTable({
  data,
  users = [],
  onEdit,
  onDelete,
  onRestore,
  isAdmin,
  isManager,
  statusFilter,
  isLoading = false,
}: DepartmentTableProps) {
  const navigate = useNavigate()
  const showUserCount = isAdmin || isManager
  const activeDepartments = data.filter((d) => !d.isDeleted)
  const deletedDepartments = data.filter((d) => d.isDeleted)

  // Get manager name for a department
  const getManagerName = (departmentId: string): string => {
    const manager = users.find(
      (u) => u.departmentId === departmentId && u.position?.toLowerCase() === 'trưởng phòng'
    )
    return manager?.fullName || '-'
  }

  const renderRow = (row: DepartmentDto) => (
    <TableRow key={row.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.departmentName}</span>
        </div>
      </TableCell>
      <TableCell>{row.departmentCode || '-'}</TableCell>
      <TableCell>{getManagerName(row.id)}</TableCell>
      <TableCell>{row.location || '-'}</TableCell>
      {showUserCount && (
        <TableCell className="text-center">
          <Badge variant="default">{row.userCount}</Badge>
        </TableCell>
      )}
      <TableCell className="text-center">
        <Badge variant={row.deviceCount > 0 ? 'default' : 'outline'}>
          {row.deviceCount}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        {row.isDeleted ? (
          <Badge variant="destructive">Đã xoá</Badge>
        ) : (
          <Badge variant="default">Hoạt động</Badge>
        )}
      </TableCell>
      {isAdmin && (
        <TableCell className="text-right">
          {row.isDeleted ? (
            <div className="flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRestore(row.id)}
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-4 w-4 text-green-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Khôi phục</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/devices?departmentId=${row.id}`)}
                      disabled={isLoading}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Devices
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Xem thiết bị</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(row)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Chỉnh sửa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => row.id && onDelete(row.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Xóa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </TableCell>
      )}
    </TableRow>
  )

  if (data.length === 0 && !isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          Chưa có phòng ban nào được thêm.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Vị trí</TableHead>
            {showUserCount && <TableHead className="text-center">Số nhân viên</TableHead>}
            <TableHead className="text-center">Số thiết bị</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {statusFilter === 'all' ? (
            <>
              {activeDepartments.length > 0 && activeDepartments.map(renderRow)}
              {deletedDepartments.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? (showUserCount ? 8 : 7) : (showUserCount ? 7 : 6)}
                      className="bg-muted/50 font-semibold"
                    >
                      ➤ Phòng ban đã xoá
                    </TableCell>
                  </TableRow>
                  {deletedDepartments.map(renderRow)}
                </>
              )}
              {activeDepartments.length === 0 && deletedDepartments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? (showUserCount ? 8 : 7) : (showUserCount ? 7 : 6)}
                    className="text-center text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </>
          ) : (
            <>
              {data.length > 0 ? (
                data.map(renderRow)
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? (showUserCount ? 8 : 7) : (showUserCount ? 7 : 6)}
                    className="text-center text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

