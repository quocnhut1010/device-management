import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { CreateDeviceAssignmentDto, DeviceAssignmentDto } from '@/types'
import { departmentService } from '@/services/departmentService'
import { userService } from '@/services/userService'
import { deviceAssignmentService } from '@/services/deviceAssignmentService'

interface Props {
  open: boolean
  onClose: () => void
  device: DeviceAssignmentDto | null
  onSubmit: (data: CreateDeviceAssignmentDto) => void
}

const AssignmentDialog: React.FC<Props> = ({ open, onClose, device, onSubmit }) => {
  const [departments, setDepartments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [unassignedDevices, setUnassignedDevices] = useState<DeviceAssignmentDto[]>([])
  const [deviceId, setDeviceId] = useState<string>('')
  const [departmentId, setDepartmentId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      // Load departments
      departmentService
        .getAllDepartments(false)
        .then((res) => setDepartments(res.data))
        .catch(() => {})

      // Load unassigned devices
      deviceAssignmentService
        .getUnassignedDevices()
        .then((res) => setUnassignedDevices(res.data))
        .catch(() => {})

      // If device is pre-selected, set it
      if (device) {
        setDeviceId(device.deviceId || device.id)
      }
    } else {
      // Reset form when dialog closes
      setDeviceId('')
      setDepartmentId('')
      setUserId('')
      setNote('')
      setUsers([])
    }
  }, [open, device])

  useEffect(() => {
    setUserId('')
    if (departmentId) {
      userService
        .getUsersByDepartment(departmentId)
        .then(setUsers)
        .catch(() => setUsers([]))
    } else {
      setUsers([])
    }
  }, [departmentId])

  const handleSubmit = () => {
    if (!deviceId || !userId || !departmentId) {
      return
    }
    const payload: CreateDeviceAssignmentDto = {
      DeviceId: deviceId,
      AssignedToDepartmentId: departmentId,
      AssignedToUserId: userId,
      Note: note,
    }
    onSubmit(payload)
  }

  const getStatusVariant = (status?: string) => {
    if (status === 'Chưa cấp phát') return 'secondary'
    if (status === 'Sẵn sàng') return 'outline'
    return 'default'
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cấp phát thiết bị</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device">Chọn thiết bị *</Label>
            <Select value={deviceId} onValueChange={setDeviceId} disabled={!!device}>
              <SelectTrigger id="device">
                <SelectValue placeholder="Chọn thiết bị" />
              </SelectTrigger>
              <SelectContent>
                {unassignedDevices.map((d) => (
                  <SelectItem key={d.deviceId || d.id} value={d.deviceId || d.id}>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {d.deviceName} {d.deviceCode ? `(${d.deviceCode})` : ''}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Trạng thái:</span>
                        <Badge variant={getStatusVariant(d.status)}>{d.status ?? 'Không xác định'}</Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {unassignedDevices.length === 0 && (
              <p className="text-sm text-muted-foreground">Không có thiết bị nào chưa được cấp phát</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Chọn phòng ban *</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">Chọn người dùng *</Label>
            <Select value={userId} onValueChange={setUserId} disabled={!departmentId}>
              <SelectTrigger id="user">
                <SelectValue placeholder="Chọn người dùng" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {departmentId && users.length === 0 && (
              <p className="text-sm text-muted-foreground">Không có người dùng nào trong phòng ban này</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú (nếu có)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Nhập ghi chú..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!deviceId || !userId || !departmentId}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AssignmentDialog
