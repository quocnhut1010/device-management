import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { DeviceAssignmentDto, TransferDeviceAssignmentDto } from '@/types'
import { departmentService } from '@/services/departmentService'
import { userService } from '@/services/userService'
import type { DepartmentDto, UserDto } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  assignment: DeviceAssignmentDto | null
  onSubmit: (data: TransferDeviceAssignmentDto) => void
}

const TransferDialog: React.FC<Props> = ({ open, onClose, assignment, onSubmit }) => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [users, setUsers] = useState<UserDto[]>([])
  const [departmentId, setDepartmentId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open && assignment) {
      departmentService.getAllDepartments(false).then(res => setDepartments(res.data)).catch(() => {})
      setDepartmentId('')
      setUserId('')
      setNote('')
      setUsers([])
    }
  }, [open, assignment])

  useEffect(() => {
    setUserId('')
    if (departmentId) {
      userService.getUsersByDepartment(departmentId).then(setUsers).catch(() => setUsers([]))
    } else {
      setUsers([])
    }
  }, [departmentId])

  const handleSubmit = () => {
    if (!assignment || !userId || !departmentId) return
    if (userId === assignment.assignedToUserId) {
      alert('Không thể chuyển giao cho chính người đang sử dụng thiết bị!')
      return
    }
    const payload: TransferDeviceAssignmentDto = {
      OldAssignmentId: assignment.id,
      NewDepartmentId: departmentId,
      NewUserId: userId,
      Note: note,
    }
    onSubmit(payload)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển giao thiết bị</DialogTitle>
        </DialogHeader>
        {assignment && (
          <div className="space-y-1 text-sm">
            <div><strong>Thiết bị:</strong> {assignment.deviceName}</div>
            <div><strong>Người dùng hiện tại:</strong> {assignment.assignedToUserName}</div>
          </div>
        )}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Chọn phòng ban mới</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.departmentName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Chọn người dùng mới</Label>
            <Select value={userId} onValueChange={setUserId} disabled={!departmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người dùng" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Ghi chú (nếu có)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TransferDialog

