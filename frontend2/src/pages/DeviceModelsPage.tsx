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
import { Plus, Search, Filter, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAllDeviceModels,
  createDeviceModel,
  updateDeviceModel,
  deleteDeviceModel,
  restoreDeviceModel,
} from '@/services/deviceModelService'
import { getAllDeviceTypes } from '@/services/deviceTypeService'
import DeviceModelDialog from '@/components/DeviceModel/DeviceModelDialog'
import DeviceModelTable from '@/components/DeviceModel/DeviceModelTable'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'
import type { DeviceModelDto, DeviceTypeDto } from '@/types'

export default function DeviceModelsPage() {
  const { user } = useAuth()
  const [models, setModels] = useState<DeviceModelDto[]>([])
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState<DeviceModelDto | null>(null)
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
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const isAdmin = user?.role.toLowerCase() === 'admin'

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true)
      const isDeletedParam =
        statusFilter === 'active'
          ? false
          : statusFilter === 'deleted'
          ? true
          : undefined

      const [modelRes, typeRes] = await Promise.all([
        getAllDeviceModels(isDeletedParam),
        getAllDeviceTypes(),
      ])

      setModels(modelRes.data)
      setDeviceTypes(typeRes.data)
    } catch (err: any) {
      console.error('Error fetching data:', err)
      toast.error(
        err.response?.data?.message || 'Không thể tải dữ liệu Device Models'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  // Helper function to get typeName from deviceTypes
  const getTypeName = (deviceTypeId: string | null | undefined): string | undefined => {
    if (!deviceTypeId) return undefined
    const deviceType = deviceTypes.find((type) => type.id === deviceTypeId)
    return deviceType?.typeName
  }

  // Map models to include typeName
  const modelsWithTypeName = models.map((model) => ({
    ...model,
    typeName: model.typeName || getTypeName(model.deviceTypeId),
  }))

  // Filter models
  const filtered = modelsWithTypeName
    .filter((m) => m.modelName.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => {
      if (typeFilter === 'all') return true
      return m.deviceTypeId === typeFilter
    })

  // Pagination
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalPages = Math.ceil(filtered.length / rowsPerPage)

  // Handle submit (create/update)
  const handleSubmit = async (data: Partial<DeviceModelDto>) => {
    try {
      if (data.id) {
        await updateDeviceModel(data.id, data as DeviceModelDto)
        toast.success('Cập nhật thành công')
      } else {
        await createDeviceModel(data as DeviceModelDto)
        toast.success('Thêm mới thành công')
      }

      fetchData()
      setSelectedModel(null)
      setOpenDialog(false)
    } catch (err: any) {
      console.error('Error saving model:', err)
      toast.error(err.response?.data?.message || 'Lỗi khi lưu model')
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

    try {
      if (confirmDialog.action === 'delete') {
        await deleteDeviceModel(confirmDialog.id)
        toast.success('Xóa thành công')
      } else if (confirmDialog.action === 'restore') {
        await restoreDeviceModel(confirmDialog.id)
        toast.success('Khôi phục thành công')
      }

      fetchData()
    } catch (err: any) {
      console.error('Error:', err)
      toast.error(
        err.response?.data?.message ||
          (confirmDialog.action === 'delete' ? 'Lỗi khi xóa' : 'Lỗi khi khôi phục')
      )
    } finally {
      setConfirmDialog({ open: false, id: null, action: null })
    }
  }

  // Stats
  const totalModels = models.length
  const activeModels = models.filter((m) => !m.isDeleted).length
  const deletedModels = models.filter((m) => m.isDeleted).length
  const activePercentage =
    totalModels > 0 ? ((activeModels / totalModels) * 100).toFixed(1) : '0'
  const deletedPercentage =
    totalModels > 0 ? ((deletedModels / totalModels) * 100).toFixed(1) : '0'

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Model thiết bị</h1>
          <p className="text-muted-foreground">
            Quản lý các model thiết bị trong hệ thống
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedModel(null)
              setOpenDialog(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm model
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModels}</div>
            <p className="text-xs text-muted-foreground">Trong hệ thống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModels}</div>
            <p className="text-xs text-muted-foreground">
              {activePercentage}% tổng số
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đã xóa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deletedModels}</div>
            <p className="text-xs text-muted-foreground">
              {deletedPercentage}% tổng số
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Loại thiết bị</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceTypes.length}</div>
            <p className="text-xs text-muted-foreground">Loại khác nhau</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm kiếm và lọc model thiết bị</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm model..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Loại thiết bị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {deviceTypes
                  .filter((type) => !type.isDeleted)
                  .map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.typeName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách model thiết bị</CardTitle>
          <CardDescription>
            Hiển thị {paginated.length} / {filtered.length} model
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DeviceModelTable
                data={paginated}
                onEdit={(m) => {
                  setSelectedModel(m)
                  setOpenDialog(true)
                }}
                onDelete={handleDelete}
                onRestore={handleRestore}
                isAdmin={isAdmin}
                statusFilter={statusFilter}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Trang {page + 1} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* DeviceModel Dialog */}
      <DeviceModelDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false)
          setSelectedModel(null)
        }}
        onSubmit={handleSubmit}
        initialData={selectedModel}
        deviceTypes={deviceTypes}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
        title="Xác nhận"
        description={
          confirmDialog.action === 'delete'
            ? 'Bạn có chắc muốn xóa model này?'
            : 'Bạn có chắc muốn khôi phục model này?'
        }
        confirmText={confirmDialog.action === 'delete' ? 'Xóa' : 'Khôi phục'}
        cancelText="Hủy"
        variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'}
        onConfirm={confirmAction}
      />
    </div>
  )
}