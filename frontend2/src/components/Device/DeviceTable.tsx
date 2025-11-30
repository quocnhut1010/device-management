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
import { Edit, Trash2, RotateCcw, Package, Eye } from 'lucide-react'
import type { DeviceDto } from '@/types'
import { formatDateForTable } from '@/lib/dateUtils'

interface DeviceTableProps {
  data: DeviceDto[]
  onEdit: (device: DeviceDto) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onView: (device: DeviceDto) => void
  isAdmin: boolean
  isDeletedView: boolean
  isLoading?: boolean
  pagination?: {
    page: number
    pageSize: number
    totalCount: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
}

const getStatusBadgeVariant = (status?: string) => {
  if (!status) return 'outline'
  
  const statusLower = status.toLowerCase()
  if (statusLower.includes('đang sử dụng')) return 'default'
  if (statusLower.includes('chưa cấp phát')) return 'secondary'
  if (statusLower.includes('hỏng') || statusLower.includes('mất')) return 'destructive'
  if (statusLower.includes('thanh lý')) return 'destructive'
  return 'outline'
}

export default function DeviceTable({
  data,
  onEdit,
  onDelete,
  onRestore,
  onView,
  isAdmin,
  isDeletedView,
  isLoading = false,
  pagination,
}: DeviceTableProps) {
  const activeDevices = data.filter((d) => !d.isDeleted)
  const deletedDevices = data.filter((d) => d.isDeleted)

  const renderRow = (row: DeviceDto) => (
    <TableRow
      key={row.id}
      className={!isDeletedView ? "cursor-pointer hover:bg-muted/50" : ""}
      onClick={() => !isDeletedView && onView(row)}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.deviceName}</span>
        </div>
      </TableCell>
      <TableCell>{row.deviceCode || '-'}</TableCell>
      <TableCell>{row.deviceTypeName || row.modelName || '-'}</TableCell>
      <TableCell>{row.supplierName || '-'}</TableCell>
      {isAdmin && <TableCell>{row.departmentName || '-'}</TableCell>}
      <TableCell>{row.currentUserName || '-'}</TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status || '-'}
        </Badge>
      </TableCell>
      <TableCell>
        {row.warrantyExpiry
          ? formatDateForTable(row.warrantyExpiry)
          : '-'}
      </TableCell>
      {isAdmin && (
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          {isDeletedView ? (
            // Deleted view: Show only restore button
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
            // Active view: Show view/edit/delete for active, restore for deleted (if mixed)
            row.isDeleted ? (
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
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(row)
                        }}
                        disabled={isLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Xem chi tiết</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(row)
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(row.id)
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Xóa</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )
          )}
        </TableCell>
      )}
    </TableRow>
  )

  if (data.length === 0 && !isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          Chưa có thiết bị nào.
        </div>
      </div>
    )
  }

  const columnCount = isAdmin ? 9 : 8

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên thiết bị</TableHead>
            <TableHead>Mã thiết bị</TableHead>
            <TableHead>Loại thiết bị</TableHead>
            <TableHead>Nhà cung cấp</TableHead>
            {isAdmin && <TableHead>Phòng ban</TableHead>}
            <TableHead>Người phụ trách</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hết hạn BH</TableHead>
            {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isDeletedView ? (
            <>
              {data.length > 0 ? (
                data.map(renderRow)
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="text-center text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </>
          ) : (
            <>
              {activeDevices.length > 0 && activeDevices.map(renderRow)}
              {deletedDevices.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={columnCount}
                      className="bg-muted/50 font-semibold"
                    >
                      ➤ Thiết bị đã xoá
                    </TableCell>
                  </TableRow>
                  {deletedDevices.map(renderRow)}
                </>
              )}
              {activeDevices.length === 0 && deletedDevices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
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

      {/* Pagination - Only show for Admin */}
      {isAdmin && pagination && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Hiển thị {pagination.page * pagination.pageSize + 1} -{' '}
            {Math.min(
              (pagination.page + 1) * pagination.pageSize,
              pagination.totalCount
            )}{' '}
            trong tổng số {pagination.totalCount} thiết bị
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0 || isLoading}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {pagination.page + 1} /{' '}
              {Math.ceil(pagination.totalCount / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={
                pagination.page >=
                  Math.ceil(pagination.totalCount / pagination.pageSize) - 1 ||
                isLoading
              }
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

