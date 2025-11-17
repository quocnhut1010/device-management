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
import type { SupplierDto } from '@/types'

const supplierSchema = z.object({
  supplierName: z
    .string()
    .min(1, 'Tên nhà cung cấp không được để trống')
    .max(100, 'Tên nhà cung cấp không được vượt quá 100 ký tự'),
  contactPerson: z
    .string()
    .max(100, 'Tên người liên hệ không được vượt quá 100 ký tự')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Email không hợp lệ')
    .max(100, 'Email không được vượt quá 100 ký tự')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Số điện thoại không được vượt quá 20 ký tự')
    .regex(/^[0-9+\-()\s]*$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
})

type SupplierFormData = z.infer<typeof supplierSchema>

interface SupplierDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<SupplierDto>) => Promise<void>
  initialData?: SupplierDto | null
  isLoading?: boolean
}

export default function SupplierDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: SupplierDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplierName: '',
      contactPerson: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          supplierName: initialData.supplierName || '',
          contactPerson: initialData.contactPerson || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
        })
      } else {
        reset({
          supplierName: '',
          contactPerson: '',
          email: '',
          phone: '',
        })
      }
    }
  }, [open, initialData, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onFormSubmit = async (data: SupplierFormData) => {
    const payload: Partial<SupplierDto> = {
      ...data,
      id: initialData?.id,
    }
    await onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Cập nhật' : 'Thêm'} nhà cung cấp
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Cập nhật thông tin nhà cung cấp'
              : 'Thêm nhà cung cấp mới vào hệ thống'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="supplierName">
                Tên nhà cung cấp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="supplierName"
                placeholder="Nhập tên nhà cung cấp"
                {...register('supplierName')}
                disabled={isLoading}
              />
              {errors.supplierName && (
                <p className="text-sm text-destructive">
                  {errors.supplierName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactPerson">Người liên hệ</Label>
              <Input
                id="contactPerson"
                placeholder="Nhập tên người liên hệ"
                {...register('contactPerson')}
                disabled={isLoading}
              />
              {errors.contactPerson && (
                <p className="text-sm text-destructive">
                  {errors.contactPerson.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="Nhập số điện thoại"
                {...register('phone')}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
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

