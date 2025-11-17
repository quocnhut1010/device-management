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
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { DeviceTypeDto } from '@/types'

const deviceTypeSchema = z.object({
  typeName: z.string().min(1, 'Tên loại thiết bị không được để trống').max(100, 'Tên loại thiết bị không được vượt quá 100 ký tự'),
  description: z.string().max(255, 'Mô tả không được vượt quá 255 ký tự').optional().or(z.literal('')),
})

type DeviceTypeFormData = z.infer<typeof deviceTypeSchema>

interface DeviceTypeDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<DeviceTypeDto>) => Promise<void>
  initialData?: DeviceTypeDto | null
  isLoading?: boolean
}

export default function DeviceTypeDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: DeviceTypeDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceTypeFormData>({
    resolver: zodResolver(deviceTypeSchema),
    defaultValues: {
      typeName: '',
      description: '',
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          typeName: initialData.typeName || '',
          description: initialData.description || '',
        })
      } else {
        reset({
          typeName: '',
          description: '',
        })
      }
    }
  }, [open, initialData, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onFormSubmit = async (data: DeviceTypeFormData) => {
    const payload: Partial<DeviceTypeDto> = {
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
            {initialData ? 'Cập nhật' : 'Thêm'} loại thiết bị
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Cập nhật thông tin loại thiết bị'
              : 'Thêm loại thiết bị mới vào hệ thống'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="typeName">
                Tên loại thiết bị <span className="text-destructive">*</span>
              </Label>
              <Input
                id="typeName"
                placeholder="Nhập tên loại thiết bị"
                {...register('typeName')}
                disabled={isLoading}
              />
              {errors.typeName && (
                <p className="text-sm text-destructive">
                  {errors.typeName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả loại thiết bị"
                rows={4}
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
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

