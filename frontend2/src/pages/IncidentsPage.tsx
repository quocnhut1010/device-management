import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { incidentService, type IncidentReport } from "@/services/incidentService"
import IncidentDetailDialog from "@/components/incident/IncidentDetailDialog"
import IncidentRejectDialog from "@/components/incident/IncidentRejectDialog"
import CreateIncidentDialog from "@/components/incident/CreateIncidentDialog"
import ExportDialog from "@/components/reports/ExportDialog"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, CheckCircle2, XCircle, Search, Filter, Download, Plus } from "lucide-react"
import { formatDateTimeForTable } from "@/lib/dateUtils"

export default function IncidentsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [reports, setReports] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all"|"pending"|"approved"|"rejected"|"closed"|"inprogress">("all")
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingReportId, setRejectingReportId] = useState<string>("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  // Pagination (client-side)
  const [page, setPage] = useState(0) // 0-based index, giống pattern ở DeviceTable
  const [pageSize, setPageSize] = useState(10)

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(0)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value as typeof status)
    setPage(0)
  }

  const getIsAdmin = (): boolean => {
    if (!user) return false
    const roleLower = user.role.toLowerCase()
    return roleLower === "admin"
  }
  const isAdmin = getIsAdmin()

  // Check if user can create reports (only Employee or Manager)
  const canCreateReport = (): boolean => {
    if (!user) return false
    const roleLower = user.role.toLowerCase()
    const positionLower = user.position?.toLowerCase() || ""
    
    // Only Employees and Managers can create reports
    if (roleLower === "user" && positionLower) {
      return positionLower === "nhân viên" || positionLower === "trưởng phòng"
    }
    
    return false
  }

  const loadReports = async () => {
    setLoading(true)
    try {
      // Try to get all (admin or technician); fallback to mine
      try {
        const res = await incidentService.getAllIncidents()
        setReports(res.data)
      } catch (err: any) {
        if (err?.response?.status === 403) {
          const resMine = await incidentService.getMyIncidents()
          setReports(resMine.data)
        } else {
          throw err
        }
      }
    } catch (e: any) {
      toast({ title: "Lỗi tải danh sách sự cố", description: e?.message || "Không thể tải dữ liệu", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = (r.device?.deviceName || "").toLowerCase().includes(search.toLowerCase())
        || (r.reportedByUser?.fullName || "").toLowerCase().includes(search.toLowerCase())
        || (r.reportType || "").toLowerCase().includes(search.toLowerCase())
      const statusMap: Record<typeof status, number[] | "all"> = {
        all: "all",
        pending: [0],
        approved: [1],
        rejected: [2],
        closed: [3],
        inprogress: [4],
      }
      const expect = statusMap[status]
      const matchesStatus = expect === "all" || expect.includes(r.status)
      return matchesSearch && matchesStatus
    })
  }, [reports, search, status])

  const totalCount = filtered.length
  const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)

  // Đảm bảo page luôn trong khoảng hợp lệ khi dữ liệu thay đổi
  const currentPage = Math.min(page, totalPages - 1)

  const paginatedReports = useMemo(() => {
    if (totalCount === 0) return []

    const start = currentPage * pageSize
    const end = start + pageSize
    return filtered.slice(start, end)
  }, [filtered, currentPage, pageSize, totalCount])

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = reports.length
    const open = reports.filter(r => r.status === 0).length
    const inProgress = reports.filter(r => r.status === 1 || r.status === 4).length
    
    // Calculate average resolution time for closed incidents
    const closedIncidents = reports.filter(r => r.status === 3 && r.updatedAt)
    let avgResolutionTime = 0
    if (closedIncidents.length > 0) {
      const totalDays = closedIncidents.reduce((sum, r) => {
        const reportDate = new Date(r.reportDate).getTime()
        const updatedDate = new Date(r.updatedAt!).getTime()
        const days = (updatedDate - reportDate) / (1000 * 60 * 60 * 24)
        return sum + days
      }, 0)
      avgResolutionTime = totalDays / closedIncidents.length
    }

    return {
      total,
      open,
      inProgress,
      avgResolutionTime: closedIncidents.length > 0 ? avgResolutionTime : null
    }
  }, [reports])

  const approve = async (id: string) => {
    try {
      await incidentService.approveIncident(id)
      toast({ title: "Đã duyệt và tạo lệnh sửa chữa" })
      loadReports()
    } catch (e: any) {
      toast({ title: "Duyệt thất bại", description: e?.response?.data?.message || e?.message, variant: "destructive" })
    }
  }

  const handleViewDetails = (report: IncidentReport) => {
    setSelectedReport(report)
    setDetailDialogOpen(true)
  }

  const handleRejectClick = (id: string) => {
    setRejectingReportId(id)
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async (reason: string, decision: 'Keep' | 'Liquidate') => {
    try {
      await incidentService.rejectIncident(rejectingReportId, { reason, decision })
      toast({ 
        title: "Đã từ chối báo cáo",
        description: decision === 'Liquidate' 
          ? 'Thiết bị đã được chuyển sang danh sách chờ thanh lý'
          : 'Thiết bị vẫn giữ trạng thái đang sử dụng'
      })
      await loadReports()
    } catch (e: any) {
      toast({ title: "Từ chối thất bại", description: e?.response?.data?.message || e?.message, variant: "destructive" })
      throw e
    }
  }

  const handleCreateSuccess = () => {
    loadReports()
  }

  const renderPriority = (type: string) => {
    const { label } = incidentService.mapPriority(type)
    const cls =
      label === 'Critical' ? 'bg-red-600 text-white' :
      label === 'High' ? 'bg-orange-500 text-white' :
      label === 'Medium' ? 'bg-amber-500 text-white' :
      label === 'Low' ? 'bg-emerald-600 text-white' :
      label === 'Minor' ? 'bg-sky-600 text-white' :
      'bg-gray-500 text-white'
    return <Badge variant="outline" className={cls}>{label}</Badge>
  }

  const renderStatus = (s: number) => {
    const text = incidentService.getStatusText(s)
    const cls =
      s === 0 ? 'bg-amber-500 text-white' :          // Chờ duyệt
      s === 1 ? 'bg-blue-600 text-white' :           // Đã tạo lệnh sửa
      s === 2 ? 'bg-red-600 text-white' :            // Đã từ chối
      s === 3 ? 'bg-emerald-600 text-white' :        // Đã đóng
      'bg-violet-600 text-white'                     // Chờ thực hiện
    return <Badge variant="outline" className={cls}>{text}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý báo cáo sự cố</h1>
          <p className="text-muted-foreground">Quản lý, theo dõi và xử lý các sự cố liên quan đến thiết bị</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          )}
          {canCreateReport() && (
            <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Báo cáo sự cố
            </Button>
          )}
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tổng số sự cố</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">Tất cả báo cáo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.open}</div>
            <p className="text-xs text-muted-foreground">Đang chờ xử lý</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.inProgress}</div>
            <p className="text-xs text-muted-foreground">Đang được giải quyết</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Thời gian xử lý TB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.avgResolutionTime !== null 
                ? `${statistics.avgResolutionTime.toFixed(1)} ngày`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics.avgResolutionTime !== null 
                ? 'Trung bình thời gian xử lý'
                : 'Chưa có dữ liệu'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách sự cố</CardTitle>
              <CardDescription>Toàn bộ sự cố được báo cáo trong hệ thống</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo thiết bị, người báo cáo hoặc loại sự cố..."
                  className="pl-8 w-[260px]"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã tạo lệnh sửa</SelectItem>
                  <SelectItem value="rejected">Đã từ chối</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                  <SelectItem value="inprogress">Chờ thực hiện</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã sự cố</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Người báo cáo</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Mức độ ưu tiên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian báo cáo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.id.slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.device?.deviceCode || '—'}</div>
                      <div className="text-xs text-muted-foreground">{r.device?.deviceName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{r.reportedByUser?.fullName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{r.reportedByUser?.email}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{r.description || '—'}</TableCell>
                    <TableCell>{renderPriority(r.reportType)}</TableCell>
                    <TableCell>{renderStatus(r.status)}</TableCell>
                    <TableCell>{formatDateTimeForTable(r.reportDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(r)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {isAdmin && r.status === 0 && (
                          <>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-emerald-600 hover:text-emerald-700"
                                    onClick={() => approve(r.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Duyệt báo cáo</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleRejectClick(r.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Từ chối báo cáo</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {loading ? "Đang tải dữ liệu..." : "Không có báo cáo nào"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination controls */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {currentPage * pageSize + 1} -{" "}
                {Math.min((currentPage + 1) * pageSize, totalCount)}{" "}
                trong tổng số {totalCount} sự cố
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={currentPage === 0 || loading}
                >
                  Trước
                </Button>
                <span className="text-sm">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) =>
                      p >= totalPages - 1 ? p : p + 1
                    )
                  }
                  disabled={currentPage >= totalPages - 1 || loading}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <IncidentDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false)
          setSelectedReport(null)
        }}
        report={selectedReport}
      />

      {/* Reject Dialog */}
      <IncidentRejectDialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false)
          setRejectingReportId("")
        }}
        onConfirm={handleRejectConfirm}
        reportId={rejectingReportId}
      />

      {/* Create Incident Dialog */}
      <CreateIncidentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        reportType="Incidents"
        disableReportTypeSelection={true}
      />
    </div>
  )
}
