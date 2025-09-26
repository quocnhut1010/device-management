import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Check as ApproveIcon,
  Close as RejectIcon
} from '@mui/icons-material';
import { 
  IncidentReport, 
  incidentService, 
  getStatusText, 
  getStatusColor, 
  IncidentStatus,
  RejectIncidentDto 
} from '../../services/incidentService';
import { getUserFromToken } from '../../services/auth';
// import { format } from 'date-fns';
// import { vi } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import { vi } from 'date-fns/locale';

interface IncidentReportListProps {
  showMyReports?: boolean;
  onViewDetails: (report: IncidentReport) => void;
  refreshTrigger?: number;
}

export default function IncidentReportList({ 
  showMyReports = false, 
  onViewDetails, 
  refreshTrigger 
}: IncidentReportListProps) {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const currentUser = getUserFromToken();
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    loadReports();
  }, [showMyReports, refreshTrigger]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: IncidentReport[];
      if (showMyReports) {
        data = await incidentService.getMyReports();
      } else {
        data = await incidentService.getAllReports();
      }
      
      setReports(data);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách báo cáo:', error);
      setError('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      await incidentService.approveReport(reportId);
      await loadReports(); // Refresh danh sách
    } catch (error: any) {
      console.error('Lỗi khi duyệt báo cáo:', error);
      setError(error.response?.data?.message || 'Không thể duyệt báo cáo');
    }
  };

  const handleReject = (reportId: string) => {
    setSelectedReportId(reportId);
    setRejectDialogOpen(true);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    try {
      setRejecting(true);
      const data: RejectIncidentDto = { reason: rejectReason };
      await incidentService.rejectReport(selectedReportId, data);
      
      setRejectDialogOpen(false);
      setSelectedReportId('');
      setRejectReason('');
      await loadReports(); // Refresh danh sách
    } catch (error: any) {
      console.error('Lỗi khi từ chối báo cáo:', error);
      setError(error.response?.data?.message || 'Không thể từ chối báo cáo');
    } finally {
      setRejecting(false);
    }
  };

 const formatDate = (dateString?: string) => {
   if (!dateString) return 'N/A';
   try {
     // Ép luôn coi input là UTC
     const utcDate = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
     return formatInTimeZone(
       utcDate,
       'Asia/Ho_Chi_Minh',
       'dd/MM/yyyy HH:mm',
       { locale: vi }
     );
   } catch {
     return dateString;
   }
 };

  const canApprove = (report: IncidentReport): boolean => {
    return isAdmin && report.status === IncidentStatus.ChoDuyet;
  };

  const canReject = (report: IncidentReport): boolean => {
    return isAdmin && report.status === IncidentStatus.ChoDuyet;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reports.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {showMyReports ? 'Bạn chưa có báo cáo nào' : 'Không có báo cáo nào'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thiết bị</TableCell>
                <TableCell>Loại sự cố</TableCell>
                <TableCell>Mô tả</TableCell>
                {!showMyReports && <TableCell>Người báo cáo</TableCell>}
                <TableCell>Ngày báo cáo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {report.device?.deviceCode}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {report.device?.deviceName}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>{report.reportType}</TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {report.description}
                    </Typography>
                  </TableCell>
                  
                  {!showMyReports && (
                    <TableCell>
                      <Typography variant="body2">
                        {report.reportedByUser?.fullName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {report.reportedByUser?.email}
                      </Typography>
                    </TableCell>
                  )}
                  
                  <TableCell>
                    {formatDate(report.reportDate)}
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={getStatusText(report.status)}
                      color={getStatusColor(report.status) as any}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box display="flex" gap={1}>
                      {/* Xem chi tiết */}
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          size="small" 
                          onClick={() => onViewDetails(report)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Admin actions */}
                      {canApprove(report) && (
                        <Tooltip title="Duyệt và tạo lệnh sửa chữa">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleApprove(report.id)}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canReject(report) && (
                        <Tooltip title="Từ chối báo cáo">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleReject(report.id)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => !rejecting && setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối báo cáo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lý do từ chối"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối báo cáo này..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRejectDialogOpen(false)}
            disabled={rejecting}
          >
            Hủy
          </Button>
          <Button 
            onClick={confirmReject}
            color="error"
            disabled={!rejectReason.trim() || rejecting}
            startIcon={rejecting ? <CircularProgress size={20} /> : null}
          >
            {rejecting ? 'Đang từ chối...' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}