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
import {
  Edit,
  Trash2,
  RotateCcw,
  Package,
  Eye,
  CheckCircle2,
  Circle,
  Wrench,
  AlertTriangle,
  XCircle,
  Clock,
  Ban,
} from 'lucide-react'
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
  
  // Tích cực - Đang sử dụng
  if (statusLower.includes('đang sử dụng')) return 'default'
  
  // Trung tính - Chưa cấp phát, Chờ thanh lý
  if (statusLower.includes('chưa cấp phát')) return 'secondary'
  if (statusLower.includes('chờ thanh lý')) return 'secondary'
  
  // Cảnh báo - Đang sửa chữa, Bảo trì (sử dụng outline với màu vàng)
  if (statusLower.includes('đang sửa chữa') || statusLower.includes('bảo trì')) {
    return 'outline'
  }
  
  // Vấn đề - Hỏng, Mất, Đã thanh lý
  if (statusLower.includes('hỏng') || statusLower.includes('mất')) return 'destructive'
  if (statusLower.includes('đã thanh lý')) return 'destructive'
  
  return 'outline'
}

const getStatusIcon = (status?: string) => {
  if (!status) return null
  
  const statusLower = status.toLowerCase()
  
  if (statusLower.includes('đang sử dụng')) return CheckCircle2
  if (statusLower.includes('chưa cấp phát')) return Circle
  if (statusLower.includes('đang sửa chữa')) return Wrench
  if (statusLower.includes('bảo trì')) return Wrench
  if (statusLower.includes('chờ thanh lý')) return Clock
  if (statusLower.includes('hỏng')) return XCircle
  if (statusLower.includes('mất')) return AlertTriangle
  if (statusLower.includes('đã thanh lý')) return Ban
  
  return null
}

const getStatusBadgeClassName = (status?: string) => {
  if (!status) return ''
  
  const statusLower = status.toLowerCase()
  
  // Cảnh báo - màu vàng
  if (statusLower.includes('đang sửa chữa') || statusLower.includes('bảo trì')) {
    return 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:border-yellow-400 dark:text-yellow-300 dark:bg-yellow-950/20'
  }
  
  return ''
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
  // Sort by createdAt descending (newest first)
  const sortedData = [...data].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    // Descending order: newer dates first
    return dateB - dateA
  })

  // When viewing deleted devices, data already contains only deleted devices
  // So we don't need to filter, just use sortedData directly
  const activeDevices = isDeletedView ? [] : sortedData.filter((d) => !d.isDeleted)
  const deletedDevices = isDeletedView ? sortedData : sortedData.filter((d) => d.isDeleted)

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
        {row.status ? (
          <Badge
            variant={getStatusBadgeVariant(row.status)}
            className={getStatusBadgeClassName(row.status)}
          >
            {(() => {
              const Icon = getStatusIcon(row.status)
              return Icon ? (
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3" />
                  {row.status}
                </span>
              ) : (
                row.status
              )
            })()}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
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
              {deletedDevices.length > 0 ? (
                deletedDevices.map(renderRow)
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

