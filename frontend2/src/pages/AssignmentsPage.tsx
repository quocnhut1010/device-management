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
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [assignOpen, setAssignOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<DeviceAssignmentDto | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [pagedResponse, inUseResponse] = await Promise.all([
        deviceAssignmentService.getAssignments(page, pageSize, statusFilter),
        deviceAssignmentService.getInUseAssignments(),
      ])
      
      // Check if response is paged or array
      if ('items' in pagedResponse.data) {
        setAssignments(pagedResponse.data.items)
        setTotal(pagedResponse.data.total)
        setTotalPages(pagedResponse.data.totalPages)
      } else {
        // Fallback for backward compatibility
        setAssignments(pagedResponse.data as DeviceAssignmentDto[])
        setTotal((pagedResponse.data as DeviceAssignmentDto[]).length)
        setTotalPages(1)
      }
      
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
  
  // Reload when page, pageSize, or statusFilter changes
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter])
  
  // Reset to page 1 when status filter changes
  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  const filteredAssignments = useMemo(() => {
    // Apply search filter on current page assignments
    // Note: Backend already handles status filter and pagination
    if (searchTerm) {
      return assignments.filter((a) => {
        const matchesSearch =
          (a.deviceName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (a.assignedToUserName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        return matchesSearch
      })
    }

    return assignments
  }, [assignments, searchTerm])

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

  // Calculate statistics - load all for accurate stats
  const [statsData, setStatsData] = useState<DeviceAssignmentDto[]>([])
  
  useEffect(() => {
    // Load all assignments for statistics calculation
    deviceAssignmentService.getAssignments().then((response) => {
      if ('items' in response.data) {
        setStatsData((response.data as any).items)
      } else {
        setStatsData(response.data as DeviceAssignmentDto[])
      }
    }).catch(() => {
      // Fallback: use current assignments if stats load fails
      setStatsData(assignments)
    })
  }, [])
  
  const statistics = useMemo(() => {
    const total = statsData.length
    const active = statsData.filter((a) => !a.returnedDate).length
    const returned = statsData.filter((a) => !!a.returnedDate).length
    const thisMonth = statsData.filter((a) => {
      if (!a.assignedDate) return false
      const assignedDate = new Date(a.assignedDate)
      const now = new Date()
      return (
        assignedDate.getMonth() === now.getMonth() &&
        assignedDate.getFullYear() === now.getFullYear()
      )
    }).length

    return { total, active, returned, thisMonth }
  }, [statsData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cấp phát thiết bị</h1>
          <p className="text-muted-foreground">Theo dõi lịch sử cấp phát và thu hồi thiết bị</p>
        </div>
        <Button onClick={() => setAssignOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo cấp phát mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số lượt cấp phát</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đang cấp phát</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đã thu hồi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.returned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Trong tháng này</CardTitle>
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
        totalCount={total}
        loading={loading}
        searchValue={searchTerm}
        statusValue={statusFilter}
        pagination={{
          page: page - 1, // Convert to 0-based for UI
          pageSize,
          totalCount: total,
          onPageChange: (newPage) => setPage(newPage + 1), // Convert back to 1-based
          onPageSizeChange: setPageSize,
        }}
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
