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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { DeviceModelDto, DeviceTypeDto } from '@/types'

const deviceModelSchema = z.object({
  modelName: z.string().min(1, 'Tên model không được để trống'),
  deviceTypeId: z.string().min(1, 'Vui lòng chọn loại thiết bị'),
  manufacturer: z.string().optional(),
  specifications: z.string().optional(),
})

type DeviceModelFormData = z.infer<typeof deviceModelSchema>

interface DeviceModelDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<DeviceModelDto>) => void
  initialData?: DeviceModelDto | null
  deviceTypes: DeviceTypeDto[]
  isLoading?: boolean
}

export default function DeviceModelDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  deviceTypes,
  isLoading = false,
}: DeviceModelDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeviceModelFormData>({
    resolver: zodResolver(deviceModelSchema),
    defaultValues: {
      modelName: '',
      deviceTypeId: '',
      manufacturer: '',
      specifications: '',
    },
  })

  const deviceTypeId = watch('deviceTypeId')

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          modelName: initialData.modelName || '',
          deviceTypeId: initialData.deviceTypeId || '',
          manufacturer: initialData.manufacturer || '',
          specifications: initialData.specifications || '',
        })
      } else {
        reset({
          modelName: '',
          deviceTypeId: '',
          manufacturer: '',
          specifications: '',
        })
      }
    }
  }, [open, initialData, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onFormSubmit = (data: DeviceModelFormData) => {
    const payload: Partial<DeviceModelDto> = {
      ...data,
      id: initialData?.id,
    }
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Cập nhật' : 'Thêm'} model thiết bị
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Cập nhật thông tin model thiết bị'
              : 'Thêm model thiết bị mới vào hệ thống'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="modelName">
                Tên model <span className="text-destructive">*</span>
              </Label>
              <Input
                id="modelName"
                placeholder="Nhập tên model"
                {...register('modelName')}
                disabled={isLoading}
              />
              {errors.modelName && (
                <p className="text-sm text-destructive">
                  {errors.modelName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deviceTypeId">
                Loại thiết bị <span className="text-destructive">*</span>
              </Label>
              <Select
                value={deviceTypeId}
                onValueChange={(value) => setValue('deviceTypeId', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="deviceTypeId">
                  <SelectValue placeholder="Chọn loại thiết bị" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.length === 0 ? (
                    <SelectItem value="" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : (
                    deviceTypes
                      .filter((type) => !type.isDeleted)
                      .map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.typeName}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.deviceTypeId && (
                <p className="text-sm text-destructive">
                  {errors.deviceTypeId.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="manufacturer">Hãng sản xuất</Label>
              <Input
                id="manufacturer"
                placeholder="Nhập hãng sản xuất"
                {...register('manufacturer')}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specifications">Thông số kỹ thuật</Label>
              <Textarea
                id="specifications"
                placeholder="Nhập thông số kỹ thuật"
                rows={4}
                {...register('specifications')}
                disabled={isLoading}
              />
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
