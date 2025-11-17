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
import { Edit, Trash2, RotateCcw, Package } from 'lucide-react'
import type { DeviceModelDto } from '@/types'

interface DeviceModelTableProps {
  data: DeviceModelDto[]
  onEdit: (model: DeviceModelDto) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isAdmin: boolean
  statusFilter: 'all' | 'active' | 'deleted'
}

export default function DeviceModelTable({
  data,
  onEdit,
  onDelete,
  onRestore,
  isAdmin,
  statusFilter,
}: DeviceModelTableProps) {
  const activeModels = data.filter((m) => !m.isDeleted)
  const deletedModels = data.filter((m) => m.isDeleted)

  const renderRow = (row: DeviceModelDto) => (
    <TableRow key={row.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.modelName}</span>
        </div>
      </TableCell>
      <TableCell>{row.typeName || '-'}</TableCell>
      <TableCell>{row.manufacturer || '-'}</TableCell>
      <TableCell>
        {row.specifications && row.specifications.length > 50 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  {row.specifications.slice(0, 50)}...
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p>{row.specifications}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          row.specifications || '-'
        )}
      </TableCell>
      <TableCell>
        {row.isDeleted ? (
          <Badge variant="destructive">Đã xoá</Badge>
        ) : (
          <Badge variant="default">Đang sử dụng</Badge>
        )}
      </TableCell>
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
                  >
                    <RotateCcw className="h-4 w-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Khôi phục</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          isAdmin && (
            <div className="flex justify-end gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(row)}
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
    </TableRow>
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên model</TableHead>
            <TableHead>Loại thiết bị</TableHead>
            <TableHead>Hãng</TableHead>
            <TableHead>Thông số kỹ thuật</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statusFilter === 'all' ? (
            <>
              {activeModels.length > 0 && activeModels.map(renderRow)}
              {deletedModels.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="bg-muted/50 font-semibold"
                    >
                      ➤ Model đã xoá
                    </TableCell>
                  </TableRow>
                  {deletedModels.map(renderRow)}
                </>
              )}
              {activeModels.length === 0 && deletedModels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
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
