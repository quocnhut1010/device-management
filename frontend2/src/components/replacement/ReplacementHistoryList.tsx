import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ArrowRight, Eye } from 'lucide-react'
import type { ReplacementDto, ReplacementFilters } from '@/types'
import {
  getReplacementHistory,
  formatReplacementDate,
  getReplacementStatusText,
} from '@/services/replacementService'
import ReplacementDetailsDialog from './ReplacementDetailsDialog'

interface ReplacementHistoryListProps {
  refreshTrigger?: number
  deviceId?: string // To filter by specific device
}

export default function ReplacementHistoryList({
  refreshTrigger,
  deviceId,
}: ReplacementHistoryListProps) {
  const [replacements, setReplacements] = useState<ReplacementDto[]>([])
  const [filteredReplacements, setFilteredReplacements] = useState<
    ReplacementDto[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [selectedReplacement, setSelectedReplacement] =
    useState<ReplacementDto | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  useEffect(() => {
    loadReplacementHistory()
  }, [refreshTrigger, deviceId])

  useEffect(() => {
    // Filter replacements based on search term
    if (!searchTerm.trim()) {
      setFilteredReplacements(replacements)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = replacements.filter(
        (replacement) =>
          replacement.oldDeviceCode?.toLowerCase().includes(term) ||
          replacement.oldDeviceName?.toLowerCase().includes(term) ||
          replacement.newDeviceCode?.toLowerCase().includes(term) ||
          replacement.newDeviceName?.toLowerCase().includes(term) ||
          replacement.userFullName?.toLowerCase().includes(term) ||
          replacement.reason?.toLowerCase().includes(term)
      )
      setFilteredReplacements(filtered)
    }
  }, [replacements, searchTerm])

  const loadReplacementHistory = async () => {
    try {
      setLoading(true)
      setError('')

      const filters: ReplacementFilters = {}
      if (deviceId) {
        filters.deviceId = deviceId
      }

      const data = await getReplacementHistory(filters)
      setReplacements(data)
    } catch (error: any) {
      console.error('Error loading replacement history:', error)
      setError('Không thể tải lịch sử thay thế thiết bị')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (replacement: ReplacementDto) => {
    setSelectedReplacement(replacement)
    setDetailsDialogOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false)
    setSelectedReplacement(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Replacements</CardTitle>
          <CardDescription>Device replacement and liquidation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {!deviceId && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã thiết bị, tên thiết bị, người dùng, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Results Summary */}
      {!deviceId && (
        <div className="text-sm text-muted-foreground">
          {filteredReplacements.length} kết quả
          {searchTerm && ` cho "${searchTerm}"`}
        </div>
      )}

      {filteredReplacements.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Replacements</CardTitle>
            <CardDescription>Device replacement and liquidation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ArrowRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm
                  ? 'Không tìm thấy kết quả phù hợp'
                  : 'Chưa có lịch sử thay thế'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? 'Thử thay đổi từ khóa tìm kiếm'
                  : 'Các lệnh thay thế thiết bị sẽ hiển thị tại đây'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Replacements</CardTitle>
            <CardDescription>Device replacement and liquidation history</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Old Device</TableHead>
                  <TableHead></TableHead>
                  <TableHead>New Device</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReplacements.map((replacement) => (
                  <TableRow key={replacement.id}>
                    <TableCell className="font-medium">
                      {replacement.oldDeviceCode || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {replacement.newDeviceCode || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {replacement.userFullName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {replacement.replacementDate
                        ? new Date(replacement.replacementDate).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <p
                        className="text-sm max-w-[200px] truncate"
                        title={replacement.reason}
                      >
                        {replacement.reason || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          replacement.replacementDate
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          replacement.replacementDate
                            ? 'bg-green-500 hover:bg-green-600'
                            : ''
                        }
                      >
                        {getReplacementStatusText(replacement)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(replacement)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <ReplacementDetailsDialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        replacement={selectedReplacement}
      />
    </div>
  )
}

