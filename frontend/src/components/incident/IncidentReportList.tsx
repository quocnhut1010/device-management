import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Tooltip, Box, Typography, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel,
  Snackbar, Alert as MuiAlert, Divider
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
  const [decision, setDecision] = useState<'Keep' | 'Liquidate'>('Keep');
  const [rejecting, setRejecting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const currentUser = getUserFromToken();
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    loadReports();
  }, [showMyReports, refreshTrigger]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = showMyReports
        ? await incidentService.getMyReports()
        : await incidentService.getAllReports();
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
      setSnackbar({
        open: true,
        message: '✅ Báo cáo đã được duyệt và tạo lệnh sửa chữa.',
        severity: 'success'
      });
      await loadReports();
    } catch (error: any) {
      console.error('Lỗi khi duyệt báo cáo:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Không thể duyệt báo cáo.',
        severity: 'error'
      });
    }
  };

  const handleReject = (reportId: string) => {
    setSelectedReportId(reportId);
    setRejectDialogOpen(true);
    setRejectReason('');
    setDecision('Keep');
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập lý do từ chối!',
        severity: 'error'
      });
      return;
    }
    try {
      setRejecting(true);
      const data: RejectIncidentDto = { reason: rejectReason, decision };
      await incidentService.rejectReport(selectedReportId, data);
      setRejectDialogOpen(false);
      setSelectedReportId('');
      setRejectReason('');
      setSnackbar({
        open: true,
        message:
          decision === 'Liquidate'
            ? 'Báo cáo đã bị từ chối. Thiết bị chuyển sang trạng thái "Chờ thanh lý".'
            : 'Báo cáo đã bị từ chối. Thiết bị giữ trạng thái "Đang sử dụng".',
        severity: 'success'
      });
      await loadReports();
    } catch (error: any) {
      console.error('Lỗi khi từ chối báo cáo:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Không thể từ chối báo cáo.',
        severity: 'error'
      });
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const utcDate = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
      return formatInTimeZone(utcDate, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const canApprove = (r: IncidentReport) => isAdmin && r.status === IncidentStatus.ChoDuyet;
  const canReject = (r: IncidentReport) => isAdmin && r.status === IncidentStatus.ChoDuyet;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {reports.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {showMyReports ? 'Bạn chưa có báo cáo nào' : 'Không có báo cáo nào'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
              {reports.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{r.device?.deviceCode}</Typography>
                    <Typography variant="caption" color="textSecondary">{r.device?.deviceName}</Typography>
                  </TableCell>
                  <TableCell>{r.reportType}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 220,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {r.description}
                    </Typography>
                  </TableCell>
                  {!showMyReports && (
                    <TableCell>
                      <Typography variant="body2">{r.reportedByUser?.fullName}</Typography>
                      <Typography variant="caption" color="textSecondary">{r.reportedByUser?.email}</Typography>
                    </TableCell>
                  )}
                  <TableCell>{formatDate(r.reportDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(r.status)}
                      color={getStatusColor(r.status) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" onClick={() => onViewDetails(r)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      {canApprove(r) && (
                        <Tooltip title="Duyệt và tạo lệnh sửa chữa">
                          <IconButton size="small" color="success" onClick={() => handleApprove(r.id)}>
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canReject(r) && (
                        <Tooltip title="Từ chối báo cáo">
                          <IconButton size="small" color="error" onClick={() => handleReject(r.id)}>
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
      <Dialog
        open={rejectDialogOpen}
        onClose={() => !rejecting && setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Từ chối báo cáo sự cố</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vui lòng nhập lý do từ chối và chọn hành động sau khi từ chối báo cáo này.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lý do từ chối"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            sx={{ mb: 3 }}
          />

          <Divider sx={{ mb: 2 }} />

          {/* Radio chọn hành động */}
          <FormControl component="fieldset" sx={{ mb: 1 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600 }}>Hành động sau khi từ chối</FormLabel>
            <RadioGroup
              value={decision}
              onChange={(e) => setDecision(e.target.value as 'Keep' | 'Liquidate')}
            >
              <FormControlLabel
                value="Keep"
                control={<Radio color="primary" />}
                label="Giữ nguyên thiết bị (Đang sử dụng)"
              />
              <FormControlLabel
                value="Liquidate"
                control={<Radio color="primary" />}
                label="Đưa vào danh sách chờ thanh lý"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={rejecting}>
            Hủy
          </Button>
          <Button
            onClick={confirmReject}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || rejecting}
            startIcon={rejecting ? <CircularProgress size={20} /> : <RejectIcon />}
          >
            {rejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          severity={snackbar.severity}
          elevation={8}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
