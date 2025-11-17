import React, { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { exportReport, downloadFile } from '@/services/reportExportService'
import { useToast } from '@/hooks/use-toast'
import type { ExportRequestDto, ReportType, ExportFormat } from '@/types/reportExport'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  reportType?: ReportType
  filters?: Record<string, string>
  onSuccess?: () => void
  disableReportTypeSelection?: boolean
}

const reportTypeOptions: { value: ReportType; label: string }[] = [
  { value: 'Devices', label: 'Thiết bị' },
  { value: 'Repairs', label: 'Sửa chữa' },
  { value: 'Incidents', label: 'Báo cáo sự cố' },
  { value: 'Liquidation', label: 'Thanh lý' },
]

export default function ExportDialog({
  open,
  onClose,
  reportType = 'Devices',
  filters = {},
  onSuccess,
  disableReportTypeSelection = false,
}: ExportDialogProps) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>(reportType)
  const [format, setFormat] = useState<ExportFormat>('Excel')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [saveToHistory, setSaveToHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const request: ExportRequestDto = {
        reportType: selectedReportType,
        format,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        saveToHistory,
        filters,
      }

      const blob = await exportReport(request)

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const extension = format === 'Excel' ? 'xlsx' : 'pdf'
      const filename = `${selectedReportType}_Export_${timestamp}.${extension}`

      downloadFile(blob, filename)
      toast({
        title: 'Thành công',
        description: `Đã xuất báo cáo ${reportTypeOptions.find((r) => r.value === selectedReportType)?.label} thành công!`,
      })
      onSuccess?.()
      handleClose()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi xuất báo cáo'
      setError(errorMessage)
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      setFromDate('')
      setToDate('')
      setSaveToHistory(false)
      onClose()
    }
  }

  // Reset when reportType prop changes
  React.useEffect(() => {
    if (open) {
      setSelectedReportType(reportType)
    }
  }, [reportType, open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Xuất báo cáo</DialogTitle>
          <DialogDescription>
            Chọn loại báo cáo và định dạng file bạn muốn xuất
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reportType">
              Loại báo cáo <span className="text-destructive">*</span>
            </Label>
            {disableReportTypeSelection ? (
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {reportTypeOptions.find((r) => r.value === selectedReportType)?.label || selectedReportType}
              </div>
            ) : (
              <Select
                value={selectedReportType}
                onValueChange={(value) => setSelectedReportType(value as ReportType)}
                disabled={isLoading}
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Chọn loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Định dạng file <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={format === 'Excel' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setFormat('Excel')}
                disabled={isLoading}
              >
                Excel (.xlsx)
              </Button>
              <Button
                type="button"
                variant={format === 'PDF' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setFormat('PDF')}
                disabled={isLoading}
              >
                PDF (.pdf)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">Từ ngày</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">Đến ngày</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveToHistory"
              checked={saveToHistory}
              onCheckedChange={(checked) => setSaveToHistory(checked === true)}
              disabled={isLoading}
            />
            <Label
              htmlFor="saveToHistory"
              className="text-sm font-normal cursor-pointer"
            >
              Lưu vào lịch sử xuất báo cáo
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="button" onClick={handleExport} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xuất báo cáo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

