import React, { useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'
import type { DepartmentDto } from '@/types'

const departmentSchema = z.object({
  departmentName: z.string().min(1, 'Tên phòng ban không được để trống').max(100, 'Tên phòng ban không được vượt quá 100 ký tự'),
  departmentCode: z.string().max(50, 'Mã phòng ban không được vượt quá 50 ký tự').optional().or(z.literal('')),
  location: z.string().max(100, 'Vị trí không được vượt quá 100 ký tự').optional().or(z.literal('')),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<DepartmentDto>) => Promise<void>
  initialData?: DepartmentDto | null
  isLoading?: boolean
}

export default function DepartmentDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: DepartmentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      departmentName: '',
      departmentCode: '',
      location: '',
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          departmentName: initialData.departmentName || '',
          departmentCode: initialData.departmentCode || '',
          location: initialData.location || '',
        })
      } else {
        reset({
          departmentName: '',
          departmentCode: '',
          location: '',
        })
      }
    }
  }, [open, initialData, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onFormSubmit = async (data: DepartmentFormData) => {
    const payload: Partial<DepartmentDto> = {
      ...data,
      id: initialData?.id,
    }
    await onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Cập nhật' : 'Thêm'} phòng ban
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Cập nhật thông tin phòng ban'
              : 'Thêm phòng ban mới vào hệ thống'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="departmentName">
                Tên phòng ban <span className="text-destructive">*</span>
              </Label>
              <Input
                id="departmentName"
                placeholder="Nhập tên phòng ban"
                {...register('departmentName')}
                disabled={isLoading}
              />
              {errors.departmentName && (
                <p className="text-sm text-destructive">
                  {errors.departmentName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="departmentCode">Mã phòng ban</Label>
              <Input
                id="departmentCode"
                placeholder="Nhập mã phòng ban"
                {...register('departmentCode')}
                disabled={isLoading}
              />
              {errors.departmentCode && (
                <p className="text-sm text-destructive">
                  {errors.departmentCode.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Vị trí</Label>
              <Input
                id="location"
                placeholder="Nhập vị trí phòng ban"
                {...register('location')}
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

