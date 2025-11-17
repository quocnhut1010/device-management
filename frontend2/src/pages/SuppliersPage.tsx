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
import { Plus, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
} from '@/services/supplierService'
import SupplierDialog from '@/components/Supplier/SupplierDialog'
import SupplierTable from '@/components/Supplier/SupplierTable'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'
import type { SupplierDto } from '@/types'

export default function SuppliersPage() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDto | null>(null)
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = user?.role.toLowerCase() === 'admin'

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      let isDeletedParam: boolean | undefined
      if (statusFilter === 'active') {
        isDeletedParam = false
      } else if (statusFilter === 'deleted') {
        isDeletedParam = true
      }

      const res = await getAllSuppliers(isDeletedParam)
      setSuppliers(res.data)
    } catch (err: any) {
      console.error('Error fetching suppliers:', err)
      toast.error(
        err.response?.data?.message || 'Không thể tải danh sách nhà cung cấp'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [statusFilter])

  // Filter suppliers
  const filtered = suppliers
    .filter((supplier) => {
      const matchKeyword =
        supplier.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        (supplier.contactPerson?.toLowerCase().includes(search.toLowerCase()) || false)
      return matchKeyword
    })

  // Handle submit (create/update)
  const handleSubmit = async (data: Partial<SupplierDto>) => {
    setIsSubmitting(true)
    try {
      if (data.id) {
        await updateSupplier(data.id, data as SupplierDto)
        toast.success('Cập nhật nhà cung cấp thành công!')
      } else {
        await createSupplier(data as SupplierDto)
        toast.success('Thêm nhà cung cấp mới thành công!')
      }
      fetchSuppliers()
      setOpenDialog(false)
      setSelectedSupplier(null)
    } catch (err: any) {
      console.error('Error saving supplier:', err)
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
        await deleteSupplier(confirmDialog.id)
        toast.success('Đã xóa nhà cung cấp!')
      } else if (confirmDialog.action === 'restore') {
        await restoreSupplier(confirmDialog.id)
        toast.success('Đã khôi phục nhà cung cấp!')
      }
      fetchSuppliers()
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

  // Stats
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((s) => !s.isDeleted).length
  const totalDevicesSupplied = suppliers.reduce((sum, s) => sum + s.deviceCount, 0)
  const avgDevicesPerSupplier =
    totalSuppliers > 0 ? Math.round(totalDevicesSupplied / totalSuppliers) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage supplier information and contacts
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedSupplier(null)
              setOpenDialog(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Devices Supplied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevicesSupplied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Devices/Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDevicesPerSupplier}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>View and manage all supplier information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by supplier name or contact person..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhà cung cấp</CardTitle>
          <CardDescription>
            Hiển thị {filtered.length} / {suppliers.length} nhà cung cấp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SupplierTable
              data={filtered}
              onEdit={(supplier) => {
                setSelectedSupplier(supplier)
                setOpenDialog(true)
              }}
              onDelete={handleDelete}
              onRestore={handleRestore}
              isAdmin={isAdmin}
              statusFilter={statusFilter}
              isLoading={isSubmitting}
            />
          )}
        </CardContent>
      </Card>

      {/* Supplier Dialog */}
      {isAdmin && (
        <SupplierDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false)
            setSelectedSupplier(null)
          }}
          onSubmit={handleSubmit}
          initialData={selectedSupplier}
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
            ? 'Bạn có chắc muốn xóa nhà cung cấp này? Hành động này sẽ xóa mềm nhà cung cấp.'
            : 'Bạn có chắc muốn khôi phục nhà cung cấp này?'
        }
        confirmText={confirmDialog.action === 'delete' ? 'Xóa' : 'Khôi phục'}
        cancelText="Hủy"
        variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'}
      />
    </div>
  )
}
