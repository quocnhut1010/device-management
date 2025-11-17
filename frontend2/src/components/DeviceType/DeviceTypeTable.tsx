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
import { Edit, Trash2, Layers } from 'lucide-react'
import type { DeviceTypeDto } from '@/types'

interface DeviceTypeTableProps {
  data: DeviceTypeDto[]
  onEdit: (type: DeviceTypeDto) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export default function DeviceTypeTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
}: DeviceTypeTableProps) {
  if (data.length === 0 && !isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          Chưa có loại thiết bị nào được thêm.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loại thiết bị</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="font-medium">{row.typeName}</span>
                </div>
              </TableCell>
              <TableCell>
                {row.description ? (
                  <span className="text-muted-foreground">{row.description}</span>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Chưa có mô tả
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

