import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import RepairList from '@/components/repair/RepairList'
import RepairDetailDialog from '@/components/repair/RepairDetailDialog'
import CompleteRepairDialog from '@/components/repair/CompleteRepairDialog'
import AssignTechnicianDialog from '@/components/repair/AssignTechnicianDialog'
import RejectOrNotNeededDialog from '@/components/repair/RejectOrNotNeededDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Download } from 'lucide-react'
import type { Repair } from '@/services/repairService'
import { repairService } from '@/services/repairService'
import ExportDialog from '@/components/reports/ExportDialog'

export default function RepairsPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  const roleLower = user?.role?.toLowerCase() || ''
  const positionLower = user?.position?.toLowerCase() || ''

  const isAdmin = roleLower === 'admin'
  const isTechnician = roleLower === 'user' && positionLower === 'kỹ thuật viên'

  const defaultTab = isTechnician ? 'mine' : 'all'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmRepairId, setConfirmRepairId] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const canViewAll = isAdmin

  const handleRefresh = () => setRefreshKey((prev) => prev + 1)

  const handleAcceptRepair = async (repairId: string) => {
    try {
      await repairService.acceptRepair(repairId)
      toast({ title: 'Đã chấp nhận lệnh sửa chữa' })
      handleRefresh()
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể chấp nhận lệnh sửa chữa'
      toast({ title: 'Lỗi', description: message, variant: 'destructive' })
    }
  }

  const handleConfirmCompletion = async () => {
    if (!confirmRepairId) return
    try {
      await repairService.confirmCompletion(confirmRepairId)
      toast({ title: 'Đã xác nhận hoàn tất sửa chữa' })
      setConfirmOpen(false)
      setConfirmRepairId(null)
      handleRefresh()
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể xác nhận hoàn tất lệnh sửa chữa'
      toast({ title: 'Lỗi', description: message, variant: 'destructive' })
    }
  }

  const handleReplacementRequest = (repair: Repair) => {
    toast({
      title: 'Thông báo',
      description: 'Chức năng thay thế thiết bị sẽ được triển khai trong phiên bản tiếp theo.',
    })
  }

  const tabs = useMemo(() => {
    const result: Array<{ value: string; label: string }> = []
    if (isTechnician) result.push({ value: 'mine', label: 'Lệnh sửa của tôi' })
    if (canViewAll) result.push({ value: 'all', label: 'Tất cả lệnh sửa' })
    return result
  }, [canViewAll, isTechnician])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý sửa chữa thiết bị</h1>
          <p className="text-muted-foreground">
            {isTechnician
              ? 'Quản lý các lệnh sửa chữa được giao cho bạn'
              : 'Theo dõi và điều phối tất cả lệnh sửa chữa trong hệ thống'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>
        )}
      </div>

      {tabs.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {isTechnician && (
            <TabsContent value="mine" className="space-y-4">
              <RepairList
                showMyRepairs
                refreshTrigger={refreshKey}
                onViewDetails={(repair) => {
                  setSelectedRepair(repair)
                  setDetailOpen(true)
                }}
                onAcceptRepair={handleAcceptRepair}
                onCompleteRepair={(repair) => {
                  setSelectedRepair(repair)
                  setCompleteOpen(true)
                }}
                onRejectOrNotNeeded={(repair) => {
                  setSelectedRepair(repair)
                  setRejectOpen(true)
                }}
              />
            </TabsContent>
          )}

          {canViewAll && (
            <TabsContent value="all" className="space-y-4">
              <RepairList
                showMyRepairs={false}
                refreshTrigger={refreshKey}
                onViewDetails={(repair) => {
                  setSelectedRepair(repair)
                  setDetailOpen(true)
                }}
                onAcceptRepair={handleAcceptRepair}
                onCompleteRepair={(repair) => {
                  setSelectedRepair(repair)
                  setCompleteOpen(true)
                }}
                onConfirmCompletion={(repairId) => {
                  setConfirmRepairId(repairId)
                  setConfirmOpen(true)
                }}
                onAssignTechnician={(repair) => {
                  setSelectedRepair(repair)
                  setAssignOpen(true)
                }}
                onRejectOrNotNeeded={(repair) => {
                  setSelectedRepair(repair)
                  setRejectOpen(true)
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      ) : (
        <div className="rounded-md border bg-muted/30 p-8 text-center text-muted-foreground">
          Bạn không có quyền truy cập danh sách sửa chữa.
        </div>
      )}

      <RepairDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        repair={selectedRepair}
        onRequestReplacement={handleReplacementRequest}
      />

      <CompleteRepairDialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onSuccess={handleRefresh}
        repair={selectedRepair}
      />

      <AssignTechnicianDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSuccess={handleRefresh}
        repair={selectedRepair}
      />

      <RejectOrNotNeededDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSuccess={handleRefresh}
        repair={selectedRepair}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hoàn tất sửa chữa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xác nhận rằng lệnh sửa chữa đã được hoàn tất? Hành động này sẽ đánh dấu
              thiết bị sẵn sàng sử dụng và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCompletion}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        reportType="Repairs"
        disableReportTypeSelection={true}
      />
    </div>
  )
}
