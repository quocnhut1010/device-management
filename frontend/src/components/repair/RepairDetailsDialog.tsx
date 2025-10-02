import React, { useEffect } from 'react';
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
  Avatar
} from '@mui/material';
import { Repair, getRepairStatusText, getRepairStatusColor } from '../../services/repairService';
import { formatDateVN } from '../../utils/dateUtils';

interface RepairDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  repair: Repair | null;
}

export default function RepairDetailsDialog({ open, onClose, repair }: RepairDetailsDialogProps) {
  if (!repair) return null;

  const {
    startDate,
    endDate,
    repairCompany,
    cost,
    laborHours,
    description,
    incidentReport,
    status,
    repairImages = [],
  } = repair;

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString('vi-VN') : '---';
  

  const formatCurrency = (amount?: number) =>
    typeof amount === 'number'
      ? amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      : '---';
  useEffect(() => {
  console.log('🖼️ repair:', repair);
}, [repair]);


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết lệnh sửa chữa</DialogTitle>
      <DialogContent dividers>
        {/* Thông tin thiết bị */}
        <Typography variant="h6">Thiết bị</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
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

        <Divider sx={{ my: 2 }} />

        {/* Trạng thái và kỹ thuật viên */}
        <Typography variant="h6">Thông tin sửa chữa</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Trạng thái:</strong>{' '}
              <Chip
                label={getRepairStatusText(status)}
                color={getRepairStatusColor(status) as any}
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
              <strong>Chi phí:</strong> {formatCurrency(cost)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Giờ công:</strong> {laborHours || '---'} giờ
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2">
              <strong>Đơn vị sửa chữa:</strong> {repairCompany || '---'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              <strong>Mô tả:</strong> {description || '---'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Thông tin báo cáo sự cố */}
        {incidentReport && (
          <>
            <Typography variant="h6">Báo cáo sự cố liên quan</Typography>
            <Typography variant="body2">
              <strong>Loại:</strong> {incidentReport.reportType}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              <strong>Mô tả:</strong> {incidentReport.description}
            </Typography>

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Ảnh sau sửa chữa */}
        {repair.repairImages && repair.repairImages.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>Ảnh sau sửa chữa</Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
              {repair.repairImages.map((img, idx) => (
                <Box
                  key={img.id || idx}
                  border="1px solid #ccc"
                  borderRadius={1}
                  overflow="hidden"
                >
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${img.imageUrl}`}
                    alt={`repair-img-${idx}`}
                    width={120}
                    height={120}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
