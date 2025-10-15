import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Box,
  Divider,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  WarningAmberRounded,
  ErrorOutlineRounded,
  CheckCircleOutlineRounded,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import { Repair, getRepairStatusText, getRepairStatusColor } from '../../services/repairService';
import { formatDateVN } from '../../utils/dateUtils';
import DeviceReplacementDialog from '../replacement/DeviceReplacementDialog';
import { getUserFromToken } from '../../services/auth';
import { repairService } from '../../services/repairService';

interface RepairDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  repair: Repair | null;
  onReplacementSuccess?: () => void;
}

export default function RepairDetailsDialog({
  open,
  onClose,
  repair,
  onReplacementSuccess,
}: RepairDetailsDialogProps) {
  if (!repair) return null;

  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const currentUser = getUserFromToken();
  const isAdmin = currentUser?.role === 'Admin';
  const isTechnician = currentUser?.position === 'Kỹ thuật viên';

  const canReplaceDevice =
    (isAdmin || isTechnician) &&
    repair.status === 4 &&
    (repair.deviceStatus ?? '') !== 'Đã thay thế';

  const handleReplacementSuccess = () => {
    setReplacementDialogOpen(false);
    onReplacementSuccess?.();
  };

  // 📊 Gọi API phân tích tình trạng thiết bị
  useEffect(() => {
    if (open && repair?.deviceId) {
      setLoadingAnalysis(true);
      repairService
        .analyzeDeviceRepairHistory(repair.deviceId)
        .then((data) => setAnalysis(data))
        .catch((err) => console.error('Lỗi phân tích thiết bị:', err))
        .finally(() => setLoadingAnalysis(false));
    }
  }, [open, repair?.deviceId]);

  const formatCurrency = (amount?: number) =>
    typeof amount === 'number'
      ? amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      : '---';

  // 🧠 Xác định cấp độ cảnh báo để chọn màu & icon
  const getAlertLevel = () => {
    if (!analysis || !analysis.warnings) return 'safe';
    const severe = analysis.warnings.some((w: string) =>
      w.toLowerCase().includes('vượt quá') || w.toLowerCase().includes('gần đây')
    );
    const mild = analysis.warnings.length > 0;
    if (severe) return 'severe';
    if (mild) return 'warning';
    return 'safe';
  };

  const level = getAlertLevel();

  const alertConfig = {
    severe: {
      color: '#E53935',
      icon: <ErrorOutlineRounded sx={{ color: '#E53935' }} />,
      title: '⚠️ Cảnh báo nghiêm trọng',
      severity: 'error' as const,
    },
    warning: {
      color: '#FFA726',
      icon: <WarningAmberRounded sx={{ color: '#FFA726' }} />,
      title: '⚠️ Cảnh báo thiết bị',
      severity: 'warning' as const,
    },
    safe: {
      color: '#43A047',
      icon: <CheckCircleOutlineRounded sx={{ color: '#43A047' }} />,
      title: '✅ Thiết bị hoạt động ổn định',
      severity: 'success' as const,
    },
  }[level];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        Chi tiết lệnh sửa chữa
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#fafafa' }}>
        {/* ========== PHÂN TÍCH THIẾT BỊ ========== */}
        {loadingAnalysis ? (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="textSecondary">
              Đang phân tích lịch sử sửa chữa...
            </Typography>
          </Box>
        ) : analysis ? (
          <Card
            variant="outlined"
            sx={{
              borderColor: alertConfig.color,
              borderWidth: 2,
              mb: 2,
              boxShadow: 1,
              bgcolor: '#fff',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                {alertConfig.icon}
                <Typography
                  variant="h6"
                  sx={{ color: alertConfig.color, fontWeight: 600 }}
                >
                  {alertConfig.title}
                </Typography>
              </Box>

              {analysis.warnings && analysis.warnings.length > 0 ? (
                <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20 }}>
                  {analysis.warnings.map((warn: string, idx: number) => (
                    <li key={idx}>
                      <Typography variant="body2">{warn}</Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Không phát hiện vấn đề bất thường trong lịch sử sửa chữa.
                </Typography>
              )}

              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                <strong>Gợi ý:</strong> {analysis.suggestion || 'Không có gợi ý cụ thể.'}
              </Typography>
            </CardContent>
          </Card>
        ) : null}

        {/* ========== THÔNG TIN THIẾT BỊ ========== */}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Thông tin thiết bị
        </Typography>
        <Card variant="outlined" sx={{ mb: 2, mt: 1 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Mã thiết bị:</strong> {repair.deviceCode || '---'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Tên thiết bị:</strong> {repair.deviceName || '---'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ========== THÔNG TIN SỬA CHỮA ========== */}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Thông tin sửa chữa
        </Typography>
        <Card variant="outlined" sx={{ mb: 2, mt: 1 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Trạng thái:</strong>{' '}
                  <Chip
                    label={getRepairStatusText(repair.status)}
                    color={getRepairStatusColor(repair.status) as any}
                    size="small"
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Kỹ thuật viên:</strong> {repair.technicianName || '---'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Bắt đầu:</strong> {formatDateVN(repair.startDate, true)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Kết thúc:</strong> {formatDateVN(repair.endDate, true)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Chi phí:</strong> {formatCurrency(repair.cost)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Giờ công:</strong> {repair.laborHours || '---'} giờ
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Đơn vị sửa chữa:</strong> {repair.repairCompany || '---'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  <strong>Mô tả:</strong> {repair.description || '---'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  <strong>Lí do từ chối:</strong> {repair.rejectedReason || '---'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ========== ẢNH SAU SỬA CHỮA ========== */}
        {repair.repairImages && repair.repairImages.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
              Ảnh sau sửa chữa
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
              {repair.repairImages.map((img, idx) => (
                <Box
                  key={img.id || idx}
                  border="1px solid #ccc"
                  borderRadius={2}
                  overflow="hidden"
                  sx={{
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                >
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${img.imageUrl}`}
                    alt={`repair-img-${idx}`}
                    width={120}
                    height={120}
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        {isAdmin && (
          <Tooltip title={!canReplaceDevice ? 'Thiết bị đã được thay thế hoặc không hợp lệ' : ''}>
            <span>
              <Button
                variant="contained"
                startIcon={<SwapIcon />}
                onClick={() => setReplacementDialogOpen(true)}
                color="primary"
                disabled={!canReplaceDevice}
              >
                Thay thế thiết bị
              </Button>
            </span>
          </Tooltip>
        )}
      </DialogActions>

      {/* Dialog thay thế */}
      {repair.deviceId && (
        <DeviceReplacementDialog
          open={replacementDialogOpen}
          onClose={() => setReplacementDialogOpen(false)}
          onSuccess={handleReplacementSuccess}
          deviceId={repair.deviceId}
          deviceCode={repair.deviceCode || 'N/A'}
          deviceName={repair.deviceName || 'N/A'}
          title="Thay thế thiết bị từ sửa chữa bị từ chối"
        />
      )}
    </Dialog>
  );
}
