import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import DeviceAssignmentTable from '@/components/deviceAssignment/DeviceAssignmentTable'
import AssignmentDialog from '@/components/deviceAssignment/AssignmentDialog'
import AssignmentDetailDialog from '@/components/deviceAssignment/AssignmentDetailDialog'
import { deviceAssignmentService } from '@/services/deviceAssignmentService'
import type { CreateDeviceAssignmentDto, DeviceAssignmentDto } from '@/types'

export default function AssignmentsPage() {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<DeviceAssignmentDto[]>([])
  const [inUseAssignments, setInUseAssignments] = useState<DeviceAssignmentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned'>('all')

  const [assignOpen, setAssignOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<DeviceAssignmentDto | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [allResponse, inUseResponse] = await Promise.all([
        deviceAssignmentService.getAssignments(),
        deviceAssignmentService.getInUseAssignments(),
      ])
      setAssignments(allResponse.data)
      setInUseAssignments(inUseResponse.data)
    } catch (e: any) {
      toast({
        title: 'Lỗi tải dữ liệu',
        description: e?.message || 'Không thể tải dữ liệu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredAssignments = useMemo(() => {
    // Determine which source to use based on status filter
    let source: DeviceAssignmentDto[] = []
    
    if (statusFilter === 'active') {
      // Use inUseAssignments from API when filtering for active
      source = inUseAssignments
    } else if (statusFilter === 'returned') {
      // Filter returned assignments from all assignments
      source = assignments.filter((a) => !!a.returnedDate)
    } else {
      // Use all assignments when filter is 'all'
      source = assignments
    }

    // Apply search filter
    if (searchTerm) {
      return source.filter((a) => {
        const matchesSearch =
          (a.deviceName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (a.assignedToUserName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        return matchesSearch
      })
    }

    return source
  }, [assignments, inUseAssignments, searchTerm, statusFilter])

  const handleSubmitAssign = async (payload: CreateDeviceAssignmentDto) => {
    try {
      await deviceAssignmentService.createAssignment(payload)
      toast({ title: 'Cấp phát thành công' })
      await loadData() // Reload both all and inUse assignments
      setAssignOpen(false)
    } catch (e: any) {
      toast({
        title: 'Cấp phát thất bại',
        description: e?.response?.data?.message || e?.message,
        variant: 'destructive',
      })
    }
  }

  const handleView = (assignment: DeviceAssignmentDto) => {
    setSelectedAssignment(assignment)
    setViewDialogOpen(true)
  }

  const handleRevoke = async (assignment: DeviceAssignmentDto) => {
    try {
      await deviceAssignmentService.revokeAssignment(assignment.id)
      toast({ title: 'Thu hồi thành công' })
      await loadData() // Reload both all and inUse assignments
    } catch (e: any) {
      toast({
        title: 'Thu hồi thất bại',
        description: e?.response?.data?.message || e?.message,
        variant: 'destructive',
      })
    }
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = assignments.length
    const active = assignments.filter((a) => !a.returnedDate).length
    const returned = assignments.filter((a) => !!a.returnedDate).length
    const thisMonth = assignments.filter((a) => {
      if (!a.assignedDate) return false
      const assignedDate = new Date(a.assignedDate)
      const now = new Date()
      return (
        assignedDate.getMonth() === now.getMonth() &&
        assignedDate.getFullYear() === now.getFullYear()
      )
    }).length

    return { total, active, returned, thisMonth }
  }, [assignments])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Device Assignments</h1>
          <p className="text-muted-foreground">Track device assignment and return history</p>
        </div>
        <Button onClick={() => setAssignOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Assignment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.returned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment History Table */}
      <DeviceAssignmentTable
        assignments={filteredAssignments}
        onRevoke={handleRevoke}
        onView={handleView}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        totalCount={assignments.length}
        loading={loading}
        searchValue={searchTerm}
        statusValue={statusFilter}
      />

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        device={null}
        onSubmit={handleSubmitAssign}
      />

      {/* Assignment Detail Dialog */}
      <AssignmentDetailDialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false)
          setSelectedAssignment(null)
        }}
        assignment={selectedAssignment}
      />
    </div>
  )
}
