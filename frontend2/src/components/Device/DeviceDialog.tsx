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
import { Loader2, Upload, X } from 'lucide-react'
import { getAllDeviceModels } from '@/services/deviceModelService'
import { getAllSuppliers } from '@/services/supplierService'
import { getImageUrl } from '@/utils/imageUtils'
import type { DeviceDto, CreateDeviceDto, DeviceModelDto, SupplierDto } from '@/types'

const deviceSchema = z.object({
  deviceName: z.string().min(1, 'Tên thiết bị không được để trống'),
  modelId: z.string().optional().or(z.literal('')),
  supplierId: z.string().optional().or(z.literal('')),
  purchasePrice: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return undefined
      const num = Number(val)
      return isNaN(num) ? undefined : num
    },
    z.number().min(0, 'Giá mua phải lớn hơn hoặc bằng 0').optional()
  ),
  usefulLifeYears: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return undefined
      const num = Number(val)
      return isNaN(num) ? undefined : num
    },
    z.number().int('Tuổi thọ phải là số nguyên').min(1, 'Tuổi thọ phải lớn hơn 0').max(100, 'Tuổi thọ không được vượt quá 100 năm').optional()
  ),
  serialNumber: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  purchaseDate: z.string().optional().or(z.literal('')),
  warrantyExpiry: z.string().optional().or(z.literal('')),
  warrantyProvider: z.string().optional().or(z.literal('')),
})

type DeviceFormData = z.infer<typeof deviceSchema>

interface DeviceDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateDeviceDto & { file?: File | null }) => Promise<void>
  initialData?: DeviceDto | null
  isLoading?: boolean
}

const statusOptions = [
  { value: 'Chưa cấp phát', label: 'Chưa cấp phát' },
  { value: 'Đang sử dụng', label: 'Đang sử dụng' },
  { value: 'Đang sửa chữa', label: 'Đang sửa chữa' },
  { value: 'Đã thanh lý', label: 'Đã thanh lý' },
  { value: 'Bảo trì', label: 'Bảo trì' },
  { value: 'Mất', label: 'Mất' },
  { value: 'Hỏng', label: 'Hỏng' },
  { value: 'Chờ thanh lý', label: 'Chờ thanh lý' },
  { value: 'Đã thanh lý', label: 'Đã thanh lý' },
]

export default function DeviceDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: DeviceDialogProps) {
  const [deviceModels, setDeviceModels] = useState<DeviceModelDto[]>([])
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      deviceName: '',
      modelId: '',
      supplierId: '',
      purchasePrice: undefined,
      usefulLifeYears: undefined,
      serialNumber: '',
      status: 'Chưa cấp phát',
      purchaseDate: '',
      warrantyExpiry: '',
      warrantyProvider: '',
    },
  })

  const modelId = watch('modelId')
  const supplierId = watch('supplierId')
  const status = watch('status')

  // Convert undefined/empty string to "none" for Select display
  const getSelectValue = (value: string | undefined): string => {
    if (!value || value.trim() === '') return 'none'
    return value
  }

  // Convert "none" back to undefined (form will store as empty string)
  const getFormValue = (value: string): string => {
    return value === 'none' ? '' : value
  }

  // Fetch device models and suppliers
  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        setLoadingModels(true)
        setLoadingSuppliers(true)
        try {
          const [modelsRes, suppliersRes] = await Promise.all([
            getAllDeviceModels(false), // Only active models
            getAllSuppliers(false), // Only active suppliers
          ])
          setDeviceModels(modelsRes.data)
          setSuppliers(suppliersRes.data)
        } catch (err) {
          console.error('Error fetching device models or suppliers:', err)
        } finally {
          setLoadingModels(false)
          setLoadingSuppliers(false)
        }
      }
    }
    fetchData()
  }, [open])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          deviceName: initialData.deviceName || '',
          modelId: initialData.modelId || '',
          supplierId: initialData.supplierId || '',
          purchasePrice: initialData.purchasePrice !== undefined && initialData.purchasePrice !== null 
            ? initialData.purchasePrice 
            : undefined,
          usefulLifeYears: initialData.usefulLifeYears !== undefined && initialData.usefulLifeYears !== null 
            ? initialData.usefulLifeYears 
            : undefined,
          serialNumber: initialData.serialNumber || '',
          status: initialData.status || 'Chưa cấp phát',
          purchaseDate: initialData.purchaseDate
            ? initialData.purchaseDate.split('T')[0]
            : '',
          warrantyExpiry: initialData.warrantyExpiry
            ? initialData.warrantyExpiry.split('T')[0]
            : '',
          warrantyProvider: initialData.warrantyProvider || '',
        })

        // Set preview image if exists
        if (initialData.deviceImageUrl) {
          setPreviewUrl(getImageUrl(initialData.deviceImageUrl))
        } else {
          setPreviewUrl(null)
        }
      } else {
        reset({
          deviceName: '',
          modelId: '',
          supplierId: '',
          purchasePrice: undefined,
          usefulLifeYears: undefined,
          serialNumber: '',
          status: 'Chưa cấp phát',
          purchaseDate: '',
          warrantyExpiry: '',
          warrantyProvider: '',
        })
        setPreviewUrl(null)
      }
      setSelectedFile(null)
    }
  }, [open, initialData, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (initialData?.deviceImageUrl) {
      setValue('deviceImageUrl', undefined as any)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedFile(null)
    setPreviewUrl(null)
    onClose()
  }

  const onFormSubmit = async (data: DeviceFormData) => {
    // Helper to convert empty string to undefined
    const toUndefined = (value: string | undefined): string | undefined => {
      return value && value.trim() !== '' ? value.trim() : undefined
    }

    // Helper to convert date string to ISO string
    const toISOString = (dateStr: string | undefined): string | undefined => {
      if (!dateStr || dateStr.trim() === '') return undefined
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return undefined
        return date.toISOString()
      } catch {
        return undefined
      }
    }

    // Build payload, filtering out undefined/null/empty values and "none"
    const payload: CreateDeviceDto & { file?: File | null } = {
      deviceName: data.deviceName.trim(),
      // Only include optional fields if they have values (filter out "none", empty strings, and undefined)
      ...(data.modelId && 
          data.modelId.trim() !== '' && 
          data.modelId !== 'none' && 
          { modelId: data.modelId.trim() }),
      ...(data.supplierId && 
          data.supplierId.trim() !== '' && 
          data.supplierId !== 'none' && 
          { supplierId: data.supplierId.trim() }),
      // Include purchasePrice if it's a valid number (including 0)
      ...(typeof data.purchasePrice === 'number' && 
          !isNaN(data.purchasePrice) && 
          isFinite(data.purchasePrice) && 
          data.purchasePrice >= 0 && 
          { purchasePrice: data.purchasePrice }),
      // Include usefulLifeYears if it's a valid number (including 0)
      ...(typeof data.usefulLifeYears === 'number' && 
          !isNaN(data.usefulLifeYears) && 
          isFinite(data.usefulLifeYears) && 
          data.usefulLifeYears > 0 && 
          { usefulLifeYears: data.usefulLifeYears }),
      ...(toUndefined(data.serialNumber) && { serialNumber: toUndefined(data.serialNumber) }),
      ...(toUndefined(data.status) && { status: toUndefined(data.status) }),
      ...(toISOString(data.purchaseDate) && { purchaseDate: toISOString(data.purchaseDate) }),
      ...(toISOString(data.warrantyExpiry) && { warrantyExpiry: toISOString(data.warrantyExpiry) }),
      ...(toUndefined(data.warrantyProvider) && { warrantyProvider: toUndefined(data.warrantyProvider) }),
      ...(selectedFile && { file: selectedFile }),
    }

    await onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Cập nhật' : 'Thêm'} thiết bị
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Cập nhật thông tin thiết bị'
              : 'Thêm thiết bị mới vào hệ thống'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deviceName">
                Tên thiết bị <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deviceName"
                placeholder="Nhập tên thiết bị"
                {...register('deviceName')}
                disabled={isLoading}
              />
              {errors.deviceName && (
                <p className="text-sm text-destructive">
                  {errors.deviceName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="modelId">Model</Label>
                <Select
                  value={getSelectValue(modelId)}
                  onValueChange={(value) => setValue('modelId', getFormValue(value))}
                  disabled={isLoading || loadingModels}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn</SelectItem>
                    {deviceModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.modelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supplierId">Nhà cung cấp</Label>
                <Select
                  value={getSelectValue(supplierId)}
                  onValueChange={(value) => setValue('supplierId', getFormValue(value))}
                  disabled={isLoading || loadingSuppliers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">Giá mua</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="Nhập giá mua"
                  {...register('purchasePrice', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-destructive">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="usefulLifeYears">Tuổi thọ hữu ích (năm)</Label>
                <Input
                  id="usefulLifeYears"
                  type="number"
                  placeholder="Ví dụ: 5"
                  {...register('usefulLifeYears', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {errors.usefulLifeYears && (
                  <p className="text-sm text-destructive">
                    {errors.usefulLifeYears.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Số năm dự kiến sử dụng thiết bị để tính khấu hao
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="serialNumber">Số Serial</Label>
                <Input
                  id="serialNumber"
                  placeholder="Nhập số serial"
                  {...register('serialNumber')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={status || 'Chưa cấp phát'}
                  onValueChange={(value) => setValue('status', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Ngày mua</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...register('purchaseDate')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="warrantyExpiry">Ngày hết hạn bảo hành</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  {...register('warrantyExpiry')}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="warrantyProvider">Nhà cung cấp bảo hành</Label>
                <Input
                  id="warrantyProvider"
                  placeholder="Nhập nhà cung cấp bảo hành"
                  {...register('warrantyProvider')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file">Hình ảnh thiết bị</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn ảnh
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-32 object-contain rounded-md border"
                  />
                </div>
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

