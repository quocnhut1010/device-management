import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { DeviceHistoryData } from '@/types/deviceHistory'

interface DeviceHistoryTableProps {
  histories: DeviceHistoryData[]
  onViewDetails?: (history: DeviceHistoryData) => void
}

const actionColors: Record<string, string> = {
  created: 'bg-blue-500',
  assigned: 'bg-green-500',
  returned: 'bg-yellow-500',
  repaired: 'bg-purple-500',
  replaced: 'bg-orange-500',
  liquidated: 'bg-red-500',
  updated: 'bg-gray-500',
}

const DeviceHistoryTable: React.FC<DeviceHistoryTableProps> = ({
  histories,
  onViewDetails,
}) => {
  const getActionColor = (action: string): string => {
    const actionLower = action.toLowerCase()
    return actionColors[actionLower] || 'bg-gray-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>History Table View</CardTitle>
        <CardDescription>Tabular view of device history</CardDescription>
      </CardHeader>
      <CardContent>
        {histories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không có dữ liệu lịch sử</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {histories.map((history) => (
                <TableRow
                  key={history.id}
                  className={onViewDetails ? 'cursor-pointer' : ''}
                  onClick={() => onViewDetails?.(history)}
                >
                  <TableCell>
                    {format(new Date(history.actionDate), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {history.deviceName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize"
                      style={{
                        backgroundColor: `${getActionColor(history.action)}20`,
                        borderColor: getActionColor(history.action),
                      }}
                    >
                      {history.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{history.actionByName}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {history.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default DeviceHistoryTable
