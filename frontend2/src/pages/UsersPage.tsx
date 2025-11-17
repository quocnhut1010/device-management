import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Download, Upload, Loader2, Edit, Eye, Trash2, RotateCcw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser, updateUser, deleteUser, restoreUser, getAllUsersData } from "@/services/userService"
import type { UserDto, RegisterUserDto } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import UserDialog from "@/components/user/UserDialog"
import ConfirmDialog from "@/components/common/ConfirmDialog"

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserDto[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [positionFilter, setPositionFilter] = useState("")
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: 'delete' | 'restore' | null
    id?: string
  }>({ open: false, action: null })

  // Get unique values for filters
  const uniqueRoles = Array.from(new Set(users.map((u) => u.role))).filter(Boolean)
  const uniqueDepartments = Array.from(new Set(users.map((u) => u.departmentName))).filter(Boolean) as string[]
  const uniquePositions = Array.from(new Set(users.map((u) => u.position))).filter(Boolean) as string[]

  // Fetch users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Filter users when filters change
  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, departmentFilter, positionFilter])

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllUsersData(true) // Include deleted users
      // Filter out current user if admin (like frontend does)
      const currentUserId = currentUser?.nameid
      const filtered = currentUser?.role.toLowerCase() === 'admin'
        ? data.filter((user: UserDto) => 
            user.id !== currentUserId || (user.id === currentUserId && user.isDeleted)
          )
        : data
      setUsers(filtered)
    } catch (err: any) {
      console.error("Failed to fetch users:", err)
      setError(err.response?.data?.message || "Không thể tải danh sách người dùng")
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role.toLowerCase() === roleFilter.toLowerCase())
    }

    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter((user) => user.departmentName === departmentFilter)
    }

    // Apply position filter
    if (positionFilter) {
      filtered = filtered.filter((user) => user.position === positionFilter)
    }

    setFilteredUsers(filtered)
  }

  // Handlers
  const handleAdd = () => {
    setSelectedUser(null)
    setOpenDialog(true)
  }

  const handleEdit = (user: UserDto) => {
    setSelectedUser(user)
    setOpenDialog(true)
  }

  const handleView = (user: UserDto) => {
    setSelectedUser(user)
    setOpenDialog(true)
  }

  const handleDelete = (id: string) => {
    setConfirmDialog({ open: true, action: 'delete', id })
  }

  const handleRestore = (id: string) => {
    setConfirmDialog({ open: true, action: 'restore', id })
  }

  const executeConfirm = async () => {
    if (!confirmDialog.id || !confirmDialog.action) return
    try {
      if (confirmDialog.action === 'delete') {
        await deleteUser(confirmDialog.id)
        toast({
          title: "Thành công",
          description: "Xóa người dùng thành công",
        })
      } else {
        await restoreUser(confirmDialog.id)
        toast({
          title: "Thành công",
          description: "Khôi phục người dùng thành công",
        })
      }
      loadUsers()
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.response?.data?.message || "Thao tác thất bại",
        variant: "destructive",
      })
    } finally {
      setConfirmDialog({ open: false, action: null })
    }
  }

  const handleSubmit = async (data: RegisterUserDto | UserDto) => {
    try {
      if ('id' in data) {
        await updateUser(data.id, data as UserDto)
        toast({
          title: "Thành công",
          description: "Cập nhật người dùng thành công",
        })
      } else {
        await createUser(data as RegisterUserDto)
        toast({
          title: "Thành công",
          description: "Thêm người dùng thành công",
        })
      }
      setOpenDialog(false)
      loadUsers()
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.response?.data?.message || "Thao tác thất bại",
        variant: "destructive",
      })
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "destructive",
      user: "default",
      manager: "secondary",
      technician: "outline",
    }
    return <Badge variant={variants[role.toLowerCase()] || "default"}>{role}</Badge>
  }

  const getStatusBadge = (isDeleted: boolean) => {
    return (
      <Badge variant={isDeleted ? "secondary" : "default"}>
        {isDeleted ? "Inactive" : "Active"}
      </Badge>
    )
  }

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter((u) => !u.isDeleted).length
  const adminUsers = users.filter((u) => u.role.toLowerCase() === "admin").length
  const technicianUsers = users.filter((u) => u.position?.toLowerCase().includes("kỹ thuật")).length

  // This check is redundant because PrivateRoute already handles it
  // But we keep it for extra safety
  if (!currentUser || currentUser.role.toLowerCase() !== "admin") {
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
          <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
          <p className="text-muted-foreground">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Trong hệ thống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}% tổng số
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Quản trị hệ thống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Kỹ thuật viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicianUsers}</div>
            <p className="text-xs text-muted-foreground">Sẵn sàng sửa chữa</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>Tất cả người dùng trong hệ thống</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role.toLowerCase()}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={departmentFilter || "all"} onValueChange={(value) => setDepartmentFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={positionFilter || "all"} onValueChange={(value) => setPositionFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Vị trí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vị trí</SelectItem>
                  {uniquePositions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadUsers} className="mt-4">
                Thử lại
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id}
                    className={user.isDeleted ? "opacity-60" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.fullName}
                        {user.isDeleted && (
                          <Badge variant="destructive" className="text-xs">Đã xóa</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.position || "-"}</TableCell>
                    <TableCell>{user.departmentName || "-"}</TableCell>
                    <TableCell>{getStatusBadge(user.isDeleted)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(user.id)}
                            disabled={user.id === currentUser?.nameid}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Khôi phục
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(user)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              disabled={user.id === currentUser?.nameid}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Sửa
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              disabled={user.id === currentUser?.nameid}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Dialog */}
      <UserDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false)
          setSelectedUser(null)
        }}
        onSubmit={handleSubmit}
        user={selectedUser}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, action: null })}
        title="Xác nhận"
        description={
          confirmDialog.action === 'delete'
            ? 'Bạn có chắc chắn muốn xóa người dùng này không?'
            : 'Bạn có chắc chắn muốn khôi phục người dùng này không?'
        }
        confirmText={confirmDialog.action === 'delete' ? 'Xóa' : 'Khôi phục'}
        variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'}
        onConfirm={executeConfirm}
      />
    </div>
  )
}