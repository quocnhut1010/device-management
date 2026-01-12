import React from 'react'
import { MyDevicesTable } from '@/components/employee/my-devices-table'
import { PendingAssignmentsTable } from '@/components/employee/pending-assignments-table'

export default function MyDevicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thiết bị của tôi</h1>
        <p className="text-muted-foreground">
          Xem danh sách thiết bị đã được bạn xác nhận nhận và đang sử dụng
        </p>
      </div>

      <PendingAssignmentsTable />

      <MyDevicesTable />
    </div>
  )
}
