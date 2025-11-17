import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Package,
  Wrench,
  AlertTriangle,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Loader2,
  Plus,
  FileText,
  FileSpreadsheet,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getExportHistory } from '@/services/reportExportService'
import ExportDialog from '@/components/reports/ExportDialog'
import type { ReportExportDto, ReportType } from '@/types/reportExport'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const formatIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  excel: <FileSpreadsheet className="h-4 w-4" />,
  xlsx: <FileSpreadsheet className="h-4 w-4" />,
}

// Helper to get format from fileUrl
const getFormatFromUrl = (fileUrl?: string): string => {
  if (!fileUrl) return 'unknown'
  const extension = fileUrl.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') return 'pdf'
  if (extension === 'xlsx' || extension === 'xls') return 'excel'
  return 'unknown'
}

// Helper to get format label
const getFormatLabel = (format: string): string => {
  if (format === 'excel' || format === 'xlsx') return 'Excel'
  if (format === 'pdf') return 'PDF'
  return 'Unknown'
}

export default function ReportsPage() {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<ReportType | 'Device Inventory' | 'Incident Summary' | 'Repair Metrics'>('Devices')
  const [exportHistory, setExportHistory] = useState<ReportExportDto[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formatFilter, setFormatFilter] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    loadExportHistory()
  }, [])

  const loadExportHistory = async () => {
    try {
      setIsLoadingHistory(true)
      setHistoryError(null)
      const history = await getExportHistory()
      setExportHistory(history)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Đã xảy ra lỗi khi tải lịch sử xuất báo cáo'
      setHistoryError(errorMessage)
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleExportClick = (reportType: ReportType | 'Device Inventory' | 'Incident Summary' | 'Repair Metrics') => {
    // Map demo report types to actual report types
    const reportTypeMap: Record<string, ReportType> = {
      'Device Inventory': 'Devices',
      'Incident Summary': 'Incidents',
      'Repair Metrics': 'Repairs',
    }
    const actualReportType = reportTypeMap[reportType] || reportType
    setSelectedReportType(actualReportType as ReportType)
    setExportDialogOpen(true)
  }

  const handleExportSuccess = () => {
    loadExportHistory()
  }

  const handleGenerateReport = () => {
    setSelectedReportType('Devices')
    setExportDialogOpen(true)
  }

  // Calculate stats
  const totalReports = exportHistory.length
  const thisMonthReports = exportHistory.filter((r) => {
    const reportDate = new Date(r.exportDate)
    const now = new Date()
    return (
      reportDate.getMonth() === now.getMonth() &&
      reportDate.getFullYear() === now.getFullYear()
    )
  }).length
  // All reports are considered completed since backend doesn't have status
  const completedReports = exportHistory.length
  const processingReports = 0

  // Filter history
  const filteredHistory = exportHistory.filter((item) => {
    const matchesSearch =
      item.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.exportedByName.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by format if not "all"
    if (formatFilter !== 'all') {
      const itemFormat = getFormatFromUrl(item.fileUrl)
      if (formatFilter === 'pdf' && itemFormat !== 'pdf') return false
      if (formatFilter === 'excel' && itemFormat !== 'excel' && itemFormat !== 'xlsx') return false
    }
    
    return matchesSearch
  })

  // Get report type label
  const getReportTypeLabel = (reportType: string): string => {
    const labels: Record<string, string> = {
      Devices: 'Thiết bị',
      Repairs: 'Sửa chữa',
      Incidents: 'Báo cáo sự cố',
      Liquidation: 'Thanh lý',
    }
    return labels[reportType] || reportType
  }

  // Get report type icon
  const getReportTypeIcon = (reportType: string): React.ReactNode => {
    if (reportType === 'Devices' || reportType.includes('Device')) {
      return <Package className="h-4 w-4" />
    }
    if (reportType === 'Repairs' || reportType.includes('Repair')) {
      return <Wrench className="h-4 w-4" />
    }
    if (reportType === 'Incidents' || reportType.includes('Incident')) {
      return <AlertTriangle className="h-4 w-4" />
    }
    if (reportType === 'Liquidation') {
      return <Trash2 className="h-4 w-4" />
    }
    return <Package className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and manage system reports</p>
        </div>
        <Button onClick={handleGenerateReport}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingReports}</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Device Inventory Report</CardTitle>
            <CardDescription>Complete list of all devices with status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleExportClick('Device Inventory')}>
              <Plus className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Incident Summary Report</CardTitle>
            <CardDescription>Analysis of incidents by department and priority</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleExportClick('Incident Summary')}>
              <Plus className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Repair Metrics Report</CardTitle>
            <CardDescription>MTTR, MTBF, and repair performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleExportClick('Repair Metrics')}>
              <Plus className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Previously generated reports and exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by report type or generated by..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={formatFilter || 'all'} onValueChange={(value) => setFormatFilter(value === 'all' ? 'all' : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadExportHistory} disabled={isLoadingHistory}>
              <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {historyError && (
            <div className="text-center text-destructive mb-4">{historyError}</div>
          )}

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có lịch sử xuất báo cáo nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Generated By</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Parameters</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => {
                  const itemFormat = getFormatFromUrl(item.fileUrl)
                  const formatLabel = getFormatLabel(itemFormat)
                  const FormatIcon = formatIcons[itemFormat] || formatIcons.excel
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="text-primary">{getReportTypeIcon(item.reportType)}</div>
                          {getReportTypeLabel(item.reportType)}
                        </div>
                      </TableCell>
                      <TableCell>{item.exportedByName}</TableCell>
                      <TableCell>
                        {format(new Date(item.exportDate), 'MMM dd, yyyy HH:mm', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {FormatIcon}
                          <span className="uppercase">{formatLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {/* Parameters not available from backend, show placeholder */}
                        <span className="text-muted-foreground">-</span>
                      </TableCell>
                      <TableCell>
                        {/* File size not available from backend, show placeholder */}
                        <span className="text-muted-foreground">-</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">completed</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.fileUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(item.fileUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">No file</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        reportType={selectedReportType as ReportType}
        onSuccess={handleExportSuccess}
      />
    </div>
  )
}
