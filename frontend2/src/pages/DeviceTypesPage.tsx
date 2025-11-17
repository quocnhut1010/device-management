import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Loader2, Edit, Trash2, Laptop, Monitor, Printer, Computer, ScanLine, Layers, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAllDeviceTypes,
  createDeviceType,
  updateDeviceType,
  deleteDeviceType,
} from '@/services/deviceTypeService'
import DeviceTypeDialog from '@/components/DeviceType/DeviceTypeDialog'
import DeviceTypeTable from '@/components/DeviceType/DeviceTypeTable'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getAllDeviceModels } from '@/services/deviceModelService'
import type { DeviceTypeDto, DeviceModelDto } from '@/types'

// Icon mapping
const iconMap: Record<string, any> = {
  Laptop,
  Monitor,
  Printer,
  Computer,
  Desktop: Computer,
  Scanner: ScanLine,
  ScanLine,
}

const getIconForType = (typeName: string) => {
  const normalizedName = typeName.toLowerCase()
  for (const [key, icon] of Object.entries(iconMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return icon
    }
  }
  return Layers // default icon
}

export default function DeviceTypesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeDto[]>([])
  const [deviceModels, setDeviceModels] = useState<DeviceModelDto[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<DeviceTypeDto | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    id: string | null
  }>({
    open: false,
    id: null,
  })
  const [search, setSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = user?.role.toLowerCase() === 'admin'

  // Fetch device types
  const fetchDeviceTypes = async () => {
    try {
      setLoading(true)
      const res = await getAllDeviceTypes()
      setDeviceTypes(res.data)
    } catch (err: any) {
      console.error('Error fetching device types:', err)
      toast.error(
        err.response?.data?.message || 'Không thể tải danh sách loại thiết bị'
      )
    } finally {
      setLoading(false)
    }
  }

  // Fetch device models to calculate device count
  const fetchDeviceModels = async () => {
    try {
      const res = await getAllDeviceModels(false) // Only active models
      setDeviceModels(res.data)
    } catch (err: any) {
      console.error('Error fetching device models:', err)
    }
  }

  useEffect(() => {
    fetchDeviceTypes()
    fetchDeviceModels()
  }, [])

  // Calculate device count for each type
  useEffect(() => {
    if (deviceTypes.length > 0 && deviceModels.length > 0) {
      const counts = deviceModels.reduce((acc, model) => {
        if (model.deviceTypeId && !model.isDeleted) {
          acc[model.deviceTypeId] = (acc[model.deviceTypeId] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      setDeviceTypes((types) =>
        types.map((type) => ({
          ...type,
          deviceCount: counts[type.id] || 0,
        }))
      )
    }
  }, [deviceModels])

  // Filter device types
  const filtered = deviceTypes.filter((type) =>
    type.typeName.toLowerCase().includes(search.toLowerCase())
  )

  // Handle submit (create/update)
  const handleSubmit = async (data: Partial<DeviceTypeDto>) => {
    setIsSubmitting(true)
    try {
      if (data.id) {
        await updateDeviceType(data.id, data as DeviceTypeDto)
        toast.success('Cập nhật loại thiết bị thành công!')
      } else {
        await createDeviceType(data as DeviceTypeDto)
        toast.success('Thêm loại thiết bị mới thành công!')
      }
      fetchDeviceTypes()
      setOpenDialog(false)
      setSelectedType(null)
    } catch (err: any) {
      console.error('Error saving device type:', err)
      toast.error(
        err.response?.data?.message || 'Thao tác thất bại. Vui lòng kiểm tra lại!'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = (id: string) => {
    setConfirmDialog({ open: true, id })
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!confirmDialog.id) return

    setIsSubmitting(true)
    try {
      await deleteDeviceType(confirmDialog.id)
      toast.success('Đã xóa loại thiết bị!')
      fetchDeviceTypes()
    } catch (err: any) {
      console.error('Error deleting device type:', err)
      // Check if error is about device type being in use
      if (err?.response?.data?.message?.includes('Không thể xoá loại thiết bị')) {
        toast.warning(err.response.data.message)
      } else {
        toast.error('Xóa thất bại. Vui lòng thử lại!')
      }
    } finally {
      setIsSubmitting(false)
      setConfirmDialog({ open: false, id: null })
    }
  }

  // Stats
  const totalTypes = deviceTypes.length
  const typesWithDescription = deviceTypes.filter(
    (type) => type.description && type.description.trim().length > 0
  ).length
  const typesWithoutDescription = totalTypes - typesWithDescription

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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý loại thiết bị</h1>
          <p className="text-muted-foreground">
            Quản lý các loại thiết bị trong hệ thống
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedType(null)
              setOpenDialog(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm loại thiết bị
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số loại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTypes}</div>
            <p className="text-xs text-muted-foreground">Trong hệ thống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Có mô tả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typesWithDescription}</div>
            <p className="text-xs text-muted-foreground">
              {totalTypes > 0
                ? ((typesWithDescription / totalTypes) * 100).toFixed(1)
                : 0}
              % tổng số
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Chưa có mô tả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typesWithoutDescription}</div>
            <p className="text-xs text-muted-foreground">
              {totalTypes > 0
                ? ((typesWithoutDescription / totalTypes) * 100).toFixed(1)
                : 0}
              % tổng số
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Device Type Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {deviceTypes.map((type) => {
          const Icon = getIconForType(type.typeName)
          return (
            <Card key={type.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-primary" />
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedType(type)
                          setOpenDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(type.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1">{type.typeName}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">
                  {type.description || 'Chưa có mô tả'}
                </p>
                <div className="text-2xl font-bold">{type.deviceCount || 0}</div>
                <p className="text-xs text-muted-foreground">Total Devices</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm kiếm loại thiết bị</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm loại thiết bị..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Device Type Details */}
      <Card>
        <CardHeader>
          <CardTitle>Device Type Details</CardTitle>
          <CardDescription>Detailed view of all device categories</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((type) => {
                const Icon = getIconForType(type.typeName)
                return (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.typeName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {type.description || 'Chưa có mô tả'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{type.deviceCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Devices</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedType(type)
                            setOpenDialog(true)
                          }}
                          disabled={isSubmitting}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/devices?deviceTypeId=${type.id}`)}
                          disabled={isSubmitting}
                        >
                          View Devices
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  Không có loại thiết bị nào
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DeviceType Dialog */}
      <DeviceTypeDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false)
          setSelectedType(null)
        }}
        onSubmit={handleSubmit}
        initialData={selectedType}
        isLoading={isSubmitting}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ open: false, id: null })
          }
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description="Bạn có chắc muốn xóa loại thiết bị này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  )
}
