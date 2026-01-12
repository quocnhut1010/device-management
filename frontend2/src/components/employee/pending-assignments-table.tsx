import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { deviceAssignmentService } from '@/services/deviceAssignmentService'
import { RejectAssignmentDialog } from './RejectAssignmentDialog'
import type { DeviceAssignmentDto } from '@/types'

export function PendingAssignmentsTable() {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<DeviceAssignmentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<DeviceAssignmentDto | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await deviceAssignmentService.getAssignments()

      const items = 'items' in response.data ? response.data.items : response.data

      const pending = (items as DeviceAssignmentDto[]).filter(
        (a) => a.status === 'Pending'
      )

      setAssignments(pending)
    } catch (error: any) {
      console.error('Error loading pending assignments:', error)
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || error?.message || 'Không thể tải danh sách thiết bị chờ xác nhận',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAccept = async (assignment: DeviceAssignmentDto) => {
    try {
      await deviceAssignmentService.confirmAssignment(assignment.id, 'accept')
      toast({
        title: 'Xác nhận nhận thiết bị thành công',
      })
      await loadData()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || error?.message || 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      })
    }
  }

  const handleRejectClick = (assignment: DeviceAssignmentDto) => {
    setSelectedAssignment(assignment)
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async (rejectionReason: string) => {
    if (!selectedAssignment) return

    try {
      await deviceAssignmentService.confirmAssignment(selectedAssignment.id, 'reject', rejectionReason)
      toast({
        title: 'Đã từ chối nhận thiết bị',
        description: 'Thiết bị sẽ không được gán cho bạn.',
      })
      setRejectDialogOpen(false)
      setSelectedAssignment(null)
      await loadData()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || error?.message || 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thiết bị chờ bạn xác nhận</CardTitle>
        <CardDescription>
          Các cấp phát thiết bị mà bạn cần chấp nhận hoặc từ chối trước khi chính thức sử dụng
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Không có thiết bị nào đang chờ bạn xác nhận</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thiết bị</TableHead>
                <TableHead>Mã thiết bị</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Người cấp phát</TableHead>
                <TableHead>Ngày cấp phát</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.deviceName}</TableCell>
                  <TableCell>{a.deviceCode}</TableCell>
                  <TableCell>{a.assignedToDepartmentName || '-'}</TableCell>
                  <TableCell>{a.assignedByUserName || '-'}</TableCell>
                  <TableCell>{a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Chờ xác nhận</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAccept(a)}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectClick(a)}
                      >
                        Từ chối
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Reject Assignment Dialog */}
      <RejectAssignmentDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        deviceName={selectedAssignment?.deviceName}
        deviceCode={selectedAssignment?.deviceCode}
        onConfirm={handleRejectConfirm}
      />
    </Card>
  )
}


