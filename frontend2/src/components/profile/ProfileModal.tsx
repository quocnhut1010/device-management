import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updateUserProfile } from '@/services/userService'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import type { UserDto } from '@/types'
import { formatDateTime } from '@/lib/dateUtils'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
  user: UserDto | null
  onSuccess?: () => void
}

const profileSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  position: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileModal({ open, onClose, user, onSuccess }: ProfileModalProps) {
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const isAdmin = authUser?.role === 'Admin'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (user && open) {
      reset({
        fullName: user.fullName || '',
        position: user.position || '',
      })
    }
  }, [user, open, reset])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    try {
      const updateData: Partial<UserDto> = {
        ...user,
        fullName: data.fullName,
        position: data.position,
      }

      await updateUserProfile(updateData as UserDto)
      
      toast({
        title: 'Thành công',
        description: 'Cập nhật thông tin cá nhân thành công',
      })
      
      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật thông tin'
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-user.jpg" alt={user.fullName} />
              <AvatarFallback className="text-lg">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <DialogTitle className="text-2xl">Thông tin cá nhân</DialogTitle>
              <DialogDescription className="mt-2">
                Cập nhật thông tin cá nhân của bạn
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ tên</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Nhập họ tên"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Input
              id="role"
              value={user.role}
              readOnly={!isAdmin}
              className="bg-muted"
            />
          </div>

          {user.departmentName && (
            <div className="space-y-2">
              <Label htmlFor="departmentName">Phòng ban</Label>
              <Input
                id="departmentName"
                value={user.departmentName}
                readOnly={!isAdmin}
                className="bg-muted"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position">Vị trí</Label>
            <Input
              id="position"
              {...register('position')}
              placeholder="Nhập vị trí"
            />
            {errors.position && (
              <p className="text-sm text-destructive">{errors.position.message}</p>
            )}
          </div>

          {user.updatedAt && (
            <div className="text-sm text-muted-foreground text-center pt-2">
              Lần cập nhật: {formatDateTime(user.updatedAt)}
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Đóng
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

