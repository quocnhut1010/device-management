import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { changePassword } from '@/services/authService'
import { useToast } from '@/hooks/use-toast'
import { Lock } from 'lucide-react'

interface ChangePasswordDialogProps {
  open: boolean
  onClose: () => void
}

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: 'Mật khẩu mới phải khác mật khẩu cũ',
  path: ['newPassword'],
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  useEffect(() => {
    if (open) {
      reset({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }, [open, reset])

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword(data.oldPassword, data.newPassword, data.confirmPassword)
      
      toast({
        title: 'Thành công',
        description: 'Đổi mật khẩu thành công',
      })
      
      // Reset form and close dialog
      reset({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu'
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Đổi mật khẩu</DialogTitle>
          </div>
          <DialogDescription>
            Cập nhật mật khẩu của bạn để bảo vệ tài khoản tốt hơn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
            <Input
              id="oldPassword"
              type="password"
              {...register('oldPassword')}
              placeholder="Nhập mật khẩu cũ"
            />
            {errors.oldPassword && (
              <p className="text-sm text-destructive">{errors.oldPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Nhập lại mật khẩu mới"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

