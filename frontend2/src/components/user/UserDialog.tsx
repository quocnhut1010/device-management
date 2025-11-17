import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { getAllDepartments } from '@/services/departmentService'
import type { UserDto, RegisterUserDto, DepartmentDto } from '@/types'

// Schema with conditional password validation
const createUserSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ').min(1, 'Vui lòng nhập email'),
  password: z.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  role: z.string().min(1, 'Vui lòng chọn vai trò'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  position: z.string().min(1, 'Vui lòng chọn vị trí'),
  customPosition: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu nhập lại không khớp',
  path: ['confirmPassword'],
})

const updateUserSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ').min(1, 'Vui lòng nhập email'),
  role: z.string().min(1, 'Vui lòng chọn vai trò'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  position: z.string().min(1, 'Vui lòng chọn vị trí'),
  customPosition: z.string().optional(),
})

type UserFormData = z.infer<typeof createUserSchema> | z.infer<typeof updateUserSchema>

const commonPositions = ['Nhân viên', 'Trưởng phòng', 'Kỹ thuật viên', 'Khác']

interface UserDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: RegisterUserDto | UserDto) => Promise<void>
  user?: UserDto | null
}

export default function UserDialog({ open, onClose, onSubmit, user }: UserDialogProps) {
  const isEdit = Boolean(user)
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'User',
      departmentId: '',
      position: '',
      customPosition: '',
    },
  })

  const position = watch('position')
  const customPosition = watch('customPosition')

  // Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true)
      try {
        const res = await getAllDepartments(false)
        // Handle both direct array and axios response
        const data = Array.isArray(res) ? res : (res.data || [])
        setDepartments(data)
      } catch (err) {
        console.error('Lỗi khi tải danh sách phòng ban', err)
      } finally {
        setLoadingDepartments(false)
      }
    }
    if (open) {
      fetchDepartments()
    }
  }, [open])

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || 'User',
        departmentId: user.departmentId || '',
        position: user.position || '',
        customPosition: user.position && !commonPositions.includes(user.position) ? user.position : '',
      })
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'User',
        departmentId: '',
        position: '',
        customPosition: '',
      })
    }
  }, [user, reset])

  const onSubmitForm = async (data: any) => {
    setLoading(true)
    try {
      const finalData = {
        ...data,
        position: data.position === 'Khác' ? (data.customPosition || '') : data.position,
      }
      
      // Remove confirmPassword and customPosition from final data
      delete finalData.confirmPassword
      delete finalData.customPosition

      // If editing, include id
      if (isEdit && user) {
        await onSubmit({ ...finalData, id: user.id } as UserDto)
      } else {
        await onSubmit(finalData as RegisterUserDto)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin người dùng' : 'Thêm người dùng mới vào hệ thống'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Họ tên */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Nhập họ tên"
                disabled={loading}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message as string}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Nhập email"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message as string}</p>
              )}
            </div>
          </div>

          {/* Mật khẩu & Xác nhận mật khẩu (chỉ khi thêm mới) */}
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Nhập lại mật khẩu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Nhập lại mật khẩu"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Vai trò & Phòng ban */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Vai trò <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('role')}
                onValueChange={(value) => setValue('role', value)}
                disabled={loading || loadingDepartments}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">
                Phòng ban <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('departmentId')}
                onValueChange={(value) => setValue('departmentId', value)}
                disabled={loading || loadingDepartments}
              >
                <SelectTrigger id="departmentId">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dep) => (
                    <SelectItem key={dep.id} value={dep.id}>
                      {dep.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-sm text-destructive">{errors.departmentId.message as string}</p>
              )}
            </div>
          </div>

          {/* Vị trí */}
          <div className="space-y-2">
            <Label htmlFor="position">
              Vị trí <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('position')}
              onValueChange={(value) => setValue('position', value)}
              disabled={loading}
            >
              <SelectTrigger id="position">
                <SelectValue placeholder="Chọn vị trí" />
              </SelectTrigger>
              <SelectContent>
                {commonPositions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-destructive">{errors.position.message as string}</p>
            )}
          </div>

          {/* Custom position field khi chọn "Khác" */}
          {position === 'Khác' && (
            <div className="space-y-2">
              <Label htmlFor="customPosition">Nhập vị trí khác</Label>
              <Input
                id="customPosition"
                {...register('customPosition')}
                placeholder="Nhập vị trí"
                disabled={loading}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

