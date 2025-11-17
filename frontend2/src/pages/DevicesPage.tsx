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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import {
  getPagedDevices,
  getAllDevices,
  getDeletedDevices,
  getDeviceById,
  getMyDevices,
  getManagedDevices,
  createDeviceWithImage,
  updateDeviceWithImage,
  deleteDevice,
  restoreDevice,
} from '@/services/deviceService'
import { getAllDeviceModels } from '@/services/deviceModelService'
import { getAllDepartments } from '@/services/departmentService'
import DeviceDialog from '@/components/Device/DeviceDialog'
import DeviceTable from '@/components/Device/DeviceTable'
import DeviceDetailDialog from '@/components/Device/DeviceDetailDialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ExportDialog from '@/components/reports/ExportDialog'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { DeviceDto, CreateDeviceDto, DeviceModelDto, DepartmentDto } from '@/types'

export default function DevicesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [devices, setDevices] = useState<DeviceDto[]>([])
  const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null)
  const [viewingDevice, setViewingDevice] = useState<DeviceDto | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    id: string | null
    action: 'delete' | 'restore' | null
  }>({
    open: false,
    id: null,
    action: null,
  })

  // Filters and pagination
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modelFilter, setModelFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [viewDeleted, setViewDeleted] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Tabs for Manager
  const [currentTab, setCurrentTab] = useState<'my' | 'managed'>('my')

  // Dropdown data
  const [deviceModels, setDeviceModels] = useState<DeviceModelDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = user?.role.toLowerCase() === 'admin'
  const position = user?.position
  const isManager = position === 'Trưởng phòng'
  const isUser = user?.role.toLowerCase() === 'user' || user?.role.toLowerCase() === 'employee'

  // Fetch device models and departments for filters
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (isAdmin) {
        try {
          const [modelsRes, departmentsRes] = await Promise.all([
            getAllDeviceModels(false),
            getAllDepartments(false),
          ])
          setDeviceModels(modelsRes.data)
          setDepartments(departmentsRes.data)
        } catch (err) {
          console.error('Error fetching dropdown data:', err)
        }
      }
    }
    fetchDropdownData()
  }, [isAdmin])

  // Fetch devices
  const fetchDevices = async () => {
    try {
      setLoading(true)
      console.log('[DevicesPage] ===== Fetch Devices Start =====')
      console.log('[DevicesPage] User info:', {
        role: user?.role,
        position: user?.position,
        isAdmin,
        isManager,
        isUser,
      })

      if (isAdmin) {
        // Admin: xem tất cả thiết bị (có phân trang và deleted)
        if (viewDeleted) {
          const deletedDevices = await getDeletedDevices()
          setDevices(deletedDevices || [])
          setTotalCount(deletedDevices?.length || 0)
        } else {
          const result = await getPagedDevices({
            page,
            pageSize,
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            modelId: modelFilter !== 'all' ? modelFilter : undefined,
          })
          
          // Validate response before setting state
          if (result && (result.items || result.devices)) {
            setDevices(result.items || result.devices || [])
            setTotalCount(result.totalCount || result.total || 0)
          } else {
            console.warn('Unexpected response format from getPagedDevices:', result)
            setDevices([])
            setTotalCount(0)
          }
        }
      } else {
        // User: chỉ xem thiết bị của mình
        let userDevices: DeviceDto[] = []
        
        if (isManager) {
          // Trưởng phòng: có thể xem thiết bị của mình hoặc phòng ban
          if (currentTab === 'my') {
            console.log('[DevicesPage] Trưởng phòng - Tab "my": Lấy thiết bị của tôi')
            userDevices = await getMyDevices()
          } else {
            console.log('[DevicesPage] Trưởng phòng - Tab "managed": Lấy thiết bị phòng ban')
            userDevices = await getManagedDevices()
          }
        } else {
          // Nhân viên: chỉ xem thiết bị của mình
          console.log('[DevicesPage] Nhân viên - Lấy thiết bị của tôi')
          userDevices = await getMyDevices()
        }
        
        console.log('[DevicesPage] Fetched devices count:', userDevices?.length || 0)
        if (userDevices && userDevices.length > 0) {
          console.log('[DevicesPage] Sample device:', userDevices[0])
        }
        setDevices(userDevices || [])
        setTotalCount(userDevices?.length || 0)
      }
    } catch (err: any) {
      console.error('[DevicesPage] ===== Fetch Devices Error =====')
      console.error('[DevicesPage] Error fetching devices:', err)
      
      // Extract error message
      let errorMessage = 'Không thể tải danh sách thiết bị'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Log detailed error for debugging
      if (err.response) {
        console.error('[DevicesPage] Error response:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        })
        
        // Handle 403 specifically
        if (err.response.status === 403) {
          errorMessage = 'Bạn không có quyền xem danh sách thiết bị này.'
        }
      }
      
      toast.error(errorMessage)
      setDevices([])
      setTotalCount(0)
    } finally {
      setLoading(false)
      console.log('[DevicesPage] ===== Fetch Devices End =====')
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [
    isAdmin,
    isManager,
    position,
    viewDeleted,
    page,
    pageSize,
    search,
    statusFilter,
    modelFilter,
    departmentFilter,
    currentTab,
  ])

  // Filter devices (for User/Manager who don't have server-side filtering)
  const filteredDevices = devices.filter((device) => {
    const matchSearch =
      device.deviceName?.toLowerCase().includes(search.toLowerCase()) ||
      device.deviceCode?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || device.status === statusFilter
    const matchModel = modelFilter === 'all' || device.modelId === modelFilter
    const matchDepartment =
      departmentFilter === 'all' || device.currentDepartmentId === departmentFilter

    return matchSearch && matchStatus && matchModel && matchDepartment
  })

  // Stats
  const totalDevices = devices.length
  const activeDevices = devices.filter((d) => !d.isDeleted && d.status === 'Đang sử dụng').length
  const availableDevices = devices.filter((d) => !d.isDeleted && d.status === 'Chưa cấp phát').length
  const devicesInUse = devices.filter((d) => !d.isDeleted && d.status === 'Đang sử dụng').length

  // Handle submit (create/update)
  const handleSubmit = async (data: CreateDeviceDto & { file?: File | null }) => {
    setIsSubmitting(true)
    try {
      let response
      if (selectedDevice) {
        response = await updateDeviceWithImage(selectedDevice.id, data)
        toast.success(response.message || 'Cập nhật thiết bị thành công!')
      } else {
        response = await createDeviceWithImage(data)
        toast.success(response.message || 'Thêm thiết bị mới thành công!')
      }
      
      // Refresh device list
      await fetchDevices()
      
      // Close dialog and reset state
      setOpenDialog(false)
      setSelectedDevice(null)
    } catch (err: any) {
      console.error('Error saving device:', err)
      
      // Extract error message
      let errorMessage = 'Thao tác thất bại. Vui lòng kiểm tra lại!'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Log detailed error for debugging
      if (err.response?.data) {
        console.error('Error response data:', err.response.data)
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const device = await getDeviceById(id)
      const forbiddenStatuses = ['Đang sử dụng', 'Đã hỏng', 'Đang bảo trì']
      if (forbiddenStatuses.includes(device.status || '')) {
        toast.error(`Không thể xoá thiết bị đang ở trạng thái "${device.status}"`)
        return
      }
      setConfirmDialog({ open: true, id, action: 'delete' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể lấy thông tin thiết bị')
    }
  }

  // Handle restore
  const handleRestore = (id: string) => {
    setConfirmDialog({ open: true, id, action: 'restore' })
  }

  // Handle view
  const handleView = (device: DeviceDto) => {
    setViewingDevice(device)
    setOpenDetailDialog(true)
  }

  // Confirm action
  const confirmAction = async () => {
    if (!confirmDialog.id || !confirmDialog.action) return

    setIsSubmitting(true)
    try {
      if (confirmDialog.action === 'delete') {
        await deleteDevice(confirmDialog.id)
        toast.success('Đã xóa thiết bị!')
      } else if (confirmDialog.action === 'restore') {
        await restoreDevice(confirmDialog.id)
        toast.success('Đã khôi phục thiết bị!')
      }
      fetchDevices()
    } catch (err: any) {
      console.error('Error:', err)
      toast.error(
        err.response?.data?.message ||
          (confirmDialog.action === 'delete' ? 'Lỗi khi xóa' : 'Lỗi khi khôi phục')
      )
    } finally {
      setIsSubmitting(false)
      setConfirmDialog({ open: false, id: null, action: null })
    }
  }

  // Status options
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Chưa cấp phát', label: 'Chưa cấp phát' },
    { value: 'Đang sử dụng', label: 'Đang sử dụng' },
    { value: 'Đang sửa chữa', label: 'Đang sửa chữa' },
    { value: 'Đã thanh lý', label: 'Đã thanh lý' },
    { value: 'Bảo trì', label: 'Bảo trì' },
    { value: 'Mất', label: 'Mất' },
    { value: 'Hỏng', label: 'Hỏng' },
    { value: 'Chờ thanh lý', label: 'Chờ thanh lý' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin
              ? 'Quản lý thiết bị'
              : isManager
                ? currentTab === 'my'
                  ? 'Thiết bị của tôi'
                  : 'Thiết bị phòng ban'
                : 'Thiết bị của tôi'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Quản lý tất cả thiết bị trong hệ thống'
              : 'Xem danh sách thiết bị được gán cho bạn'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant={viewDeleted ? 'outline' : 'default'}
              onClick={() => setViewDeleted(false)}
            >
              Tất cả thiết bị
            </Button>
            <Button
              variant={viewDeleted ? 'default' : 'outline'}
              onClick={() => setViewDeleted(true)}
            >
              Đã xoá
            </Button>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button
              onClick={() => {
                setSelectedDevice(null)
                setOpenDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm thiết bị
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards - Only for Admin */}
      {isAdmin && !viewDeleted && (
        <div className="grid gap-4 md:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Đang sử dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{devicesInUse}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Chưa cấp phát</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableDevices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Thiết bị hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDevices}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Manager */}
      {isManager && (
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'my' | 'managed')}>
          <TabsList>
            <TabsTrigger value="my">Thiết bị của tôi</TabsTrigger>
            <TabsTrigger value="managed">Thiết bị phòng ban</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm kiếm và lọc thiết bị</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã thiết bị..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdmin && (
              <>
                <Select value={modelFilter} onValueChange={setModelFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả model</SelectItem>
                    {deviceModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.modelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phòng ban</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thiết bị</CardTitle>
          <CardDescription>
            Hiển thị {isAdmin && !viewDeleted ? totalCount : filteredDevices.length} thiết bị
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DeviceTable
              data={
                isAdmin && viewDeleted
                  ? devices // When viewing deleted, show all deleted devices (no client-side filtering)
                  : isAdmin && !viewDeleted
                  ? devices // When viewing active with pagination, use devices directly
                  : filteredDevices // For User/Manager, use filtered devices
              }
              onEdit={(device) => {
                setSelectedDevice(device)
                setOpenDialog(true)
              }}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onView={handleView}
              isAdmin={isAdmin}
              isDeletedView={viewDeleted}
              isLoading={isSubmitting}
              pagination={
                isAdmin && !viewDeleted
                  ? {
                      page,
                      pageSize,
                      totalCount,
                      onPageChange: setPage,
                      onPageSizeChange: setPageSize,
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Device Dialog */}
      {isAdmin && (
        <DeviceDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false)
            setSelectedDevice(null)
          }}
          onSubmit={handleSubmit}
          initialData={selectedDevice}
          isLoading={isSubmitting}
        />
      )}

      {/* Device Detail Dialog */}
      <DeviceDetailDialog
        open={openDetailDialog}
        device={viewingDevice}
        onClose={() => {
          setOpenDetailDialog(false)
          setViewingDevice(null)
        }}
      />

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
            ? 'Bạn có chắc muốn xóa thiết bị này? Hành động này sẽ xóa mềm thiết bị.'
            : 'Bạn có chắc muốn khôi phục thiết bị này?'
        }
        confirmText={confirmDialog.action === 'delete' ? 'Xóa' : 'Khôi phục'}
        cancelText="Hủy"
        variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        reportType="Devices"
        disableReportTypeSelection={true}
      />
    </div>
  )
}
