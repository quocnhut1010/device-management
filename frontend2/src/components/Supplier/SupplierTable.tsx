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
import { Edit, Trash2, RotateCcw, Mail, Phone, Store } from 'lucide-react'
import type { SupplierDto } from '@/types'

interface SupplierTableProps {
  data: SupplierDto[]
  onEdit: (supplier: SupplierDto) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isAdmin: boolean
  statusFilter: 'all' | 'active' | 'deleted'
  isLoading?: boolean
}

export default function SupplierTable({
  data,
  onEdit,
  onDelete,
  onRestore,
  isAdmin,
  statusFilter,
  isLoading = false,
}: SupplierTableProps) {
  const activeSuppliers = data.filter((s) => !s.isDeleted)
  const deletedSuppliers = data.filter((s) => s.isDeleted)

  const renderRow = (row: SupplierDto) => (
    <TableRow key={row.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.supplierName}</span>
        </div>
      </TableCell>
      <TableCell>{row.contactPerson || '-'}</TableCell>
      <TableCell>
        <div className="space-y-1">
          {row.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{row.phone}</span>
            </div>
          )}
          {!row.email && !row.phone && <span className="text-muted-foreground">-</span>}
        </div>
      </TableCell>
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
                      onClick={() => onDelete(row.id)}
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
          Chưa có nhà cung cấp nào được thêm.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên nhà cung cấp</TableHead>
            <TableHead>Người liên hệ</TableHead>
            <TableHead>Thông tin liên hệ</TableHead>
            <TableHead className="text-center">Số thiết bị đã cung cấp</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            {isAdmin && <TableHead className="text-right">Hành động</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {statusFilter === 'all' ? (
            <>
              {activeSuppliers.length > 0 && activeSuppliers.map(renderRow)}
              {deletedSuppliers.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="bg-muted/50 font-semibold"
                    >
                      ➤ Nhà cung cấp đã xoá
                    </TableCell>
                  </TableRow>
                  {deletedSuppliers.map(renderRow)}
                </>
              )}
              {activeSuppliers.length === 0 && deletedSuppliers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
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
                    colSpan={isAdmin ? 6 : 5}
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

