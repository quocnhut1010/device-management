import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Loader2, Eye, Edit, Users, Package } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  restoreDepartment,
} from '@/services/departmentService'
import DepartmentDialog from '@/components/Department/DepartmentDialog'
import DepartmentTable from '@/components/Department/DepartmentTable'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getAllUsersData, getUsersByDepartment } from '@/services/userService'
import type { DepartmentDto, UserDto } from '@/types'

export default function DepartmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDto | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    id: string | null
    action: 'delete' | 'restore' | null
  }>({
    open: false,
    id: null,
    action: null,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all')
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'hasDevice' | 'noDevice'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = user?.role.toLowerCase() === 'admin'
  const isManager = user?.position?.toLowerCase() === 'trưởng phòng'

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true)
      let isDeletedParam: boolean | undefined
      if (statusFilter === 'active') {
        isDeletedParam = false
      } else if (statusFilter === 'deleted') {
        isDeletedParam = true
      }

      const res = await getAllDepartments(isDeletedParam)
      setDepartments(res.data)
    } catch (err: any) {
      console.error('Error fetching departments:', err)
      toast.error(
        err.response?.data?.message || 'Không thể tải danh sách phòng ban'
      )
    } finally {
      setLoading(false)
    }
  }

  // Fetch users (for manager info)
  const fetchUsers = async () => {
    if (!isAdmin && !isManager) return
    
    try {
      // Try to fetch all users (works for Admin, may fail for Manager)
      const usersData = await getAllUsersData(false) // Only active users
      setUsers(usersData)
    } catch (err: any) {
      // If getAllUsersData fails (e.g., Manager doesn't have permission),
      // try to fetch users for each department individually
      if (departments.length > 0) {
        const uniqueDeptIds = [...new Set(departments.map(d => d.id))]
        const allUsers: UserDto[] = []
        for (const deptId of uniqueDeptIds) {
          try {
            const deptUsers = await getUsersByDepartment(deptId)
            // Avoid duplicates by checking if user already exists
            deptUsers.forEach(user => {
              if (!allUsers.find(u => u.id === user.id)) {
                allUsers.push(user)
              }
            })
          } catch (deptErr: any) {
            // Silently skip if we can't fetch users for a department
            console.warn(`Could not fetch users for department ${deptId}:`, deptErr)
          }
        }
        setUsers(allUsers)
      } else {
        console.error('Error fetching users:', err)
      }
    }
  }

  // Fetch departments
  useEffect(() => {
    fetchDepartments()
  }, [statusFilter])

  // Fetch users after departments are loaded (for both Admin and Manager)
  useEffect(() => {
    if ((isAdmin || isManager) && departments.length > 0) {
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments.length, isAdmin, isManager])

  // Filter departments
  const filtered = departments
    .filter((dept) => {
      const matchKeyword =
        dept.departmentName.toLowerCase().includes(search.toLowerCase()) ||
        (dept.departmentCode?.toLowerCase().includes(search.toLowerCase()) || false)
      return matchKeyword
    })
    .filter((dept) => {
      if (deviceFilter === 'all') return true
      if (deviceFilter === 'hasDevice') return dept.deviceCount > 0
      if (deviceFilter === 'noDevice') return dept.deviceCount === 0
      return true
    })

  // Handle submit (create/update)
  const handleSubmit = async (data: Partial<DepartmentDto>) => {
    setIsSubmitting(true)
    try {
      if (data.id) {
        await updateDepartment(data.id, data as DepartmentDto)
        toast.success('Cập nhật phòng ban thành công!')
      } else {
        await createDepartment(data as DepartmentDto)
        toast.success('Thêm phòng ban mới thành công!')
      }
      fetchDepartments()
      setOpenDialog(false)
      setSelectedDepartment(null)
    } catch (err: any) {
      console.error('Error saving department:', err)
      toast.error(
        err.response?.data?.message || 'Thao tác thất bại. Vui lòng kiểm tra lại!'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = (id: string) => {
    setConfirmDialog({ open: true, id, action: 'delete' })
  }

  // Handle restore
  const handleRestore = (id: string) => {
    setConfirmDialog({ open: true, id, action: 'restore' })
  }

  // Confirm action
  const confirmAction = async () => {
    if (!confirmDialog.id || !confirmDialog.action) return

    setIsSubmitting(true)
    try {
      if (confirmDialog.action === 'delete') {
        await deleteDepartment(confirmDialog.id)
        toast.success('Đã xóa phòng ban!')
      } else if (confirmDialog.action === 'restore') {
        await restoreDepartment(confirmDialog.id)
        toast.success('Đã khôi phục phòng ban!')
      }
      fetchDepartments()
    } catch (err: any) {
      console.error('Error:', err)
      // Check if error is about department being in use
      if (err?.response?.data?.message?.includes('Không thể xoá phòng ban')) {
        toast.warning(err.response.data.message)
      } else {
        toast.error(
          err.response?.data?.message ||
            (confirmDialog.action === 'delete' ? 'Lỗi khi xóa' : 'Lỗi khi khôi phục')
        )
      }
    } finally {
      setIsSubmitting(false)
      setConfirmDialog({ open: false, id: null, action: null })
    }
  }

  // Stats
  const totalDepartments = departments.length
  const totalEmployees = departments.reduce((sum, d) => sum + d.userCount, 0)
  const totalDevices = departments.reduce((sum, d) => sum + d.deviceCount, 0)
  const avgDevicesPerDept = totalDepartments > 0 ? Math.round(totalDevices / totalDepartments) : 0

  // Get manager for a department
  const getManagerName = (departmentId: string): string => {
    const manager = users.find(
      (u) => u.departmentId === departmentId && u.position?.toLowerCase() === 'trưởng phòng'
    )
    return manager?.fullName || '-'
  }

  // Active departments for cards grid
  const activeDepartmentsForCards = departments.filter((d) => !d.isDeleted)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Phòng ban</h1>
          <p className="text-muted-foreground">
            Quản lý các phòng ban trong hệ thống
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedDepartment(null)
              setOpenDialog(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm phòng ban
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số phòng ban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số thiết bị</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">TB thiết bị / phòng ban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDevicesPerDept}</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {activeDepartmentsForCards.map((dept) => (
          <Card key={dept.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dept.departmentName}</CardTitle>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        navigate(`/devices?departmentId=${dept.id}`)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedDepartment(dept)
                        setOpenDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>Mã: {dept.departmentCode || '-'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Trưởng phòng</p>
                <p className="font-medium">{getManagerName(dept.id)}</p>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{dept.userCount} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{dept.deviceCount} devices</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm kiếm và lọc phòng ban</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phòng ban..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="deleted">Đã xóa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={deviceFilter} onValueChange={(value: any) => setDeviceFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Thiết bị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="hasDevice">Có thiết bị</SelectItem>
                <SelectItem value="noDevice">Chưa có thiết bị</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng ban</CardTitle>
          <CardDescription>
            Hiển thị {filtered.length} / {departments.length} phòng ban
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DepartmentTable
              data={filtered}
              users={users}
              onEdit={(dept) => {
                setSelectedDepartment(dept)
                setOpenDialog(true)
              }}
              onDelete={handleDelete}
              onRestore={handleRestore}
              isAdmin={isAdmin}
              isManager={isManager}
              statusFilter={statusFilter}
              isLoading={isSubmitting}
            />
          )}
        </CardContent>
      </Card>

      {/* Department Dialog */}
      {isAdmin && (
        <DepartmentDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false)
            setSelectedDepartment(null)
          }}
          onSubmit={handleSubmit}
          initialData={selectedDepartment}
          isLoading={isSubmitting}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ open: false, id: null, action: null })
          }
        }}
        onConfirm={confirmAction}
        title={
          confirmDialog.action === 'delete' ? 'Xác nhận xóa' : 'Xác nhận khôi phục'
        }
        description={
          confirmDialog.action === 'delete'
            ? 'Bạn có chắc muốn xóa phòng ban này? Hành động này sẽ xóa mềm phòng ban.'
            : 'Bạn có chắc muốn khôi phục phòng ban này?'
        }
        confirmText={confirmDialog.action === 'delete' ? 'Xóa' : 'Khôi phục'}
        cancelText="Hủy"
        variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'}
      />
    </div>
  )
}
