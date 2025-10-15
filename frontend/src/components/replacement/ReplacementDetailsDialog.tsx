import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  DeviceHub as DeviceIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Description as ReasonIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { ReplacementDto } from '../../types/replacement';
import { formatReplacementDate, getReplacementStatusText } from '../../services/replacementService';
import { formatDateVN } from '../../utils/dateUtils';

interface ReplacementDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  replacement: ReplacementDto | null;
}

export default function ReplacementDetailsDialog({
  open,
  onClose,
  replacement
}: ReplacementDetailsDialogProps) {
  if (!replacement) return null;

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <SwapIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Chi tiết thay thế thiết bị
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ID: {replacement.id}
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Chip
            label={getReplacementStatusText(replacement)}
            color={replacement.replacementDate ? 'success' : 'default'}
            size="medium"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Device Replacement Flow */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
              <SwapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Quá trình thay thế
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
              {/* Old Device */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'error.light',
                    borderRadius: 1,
                    bgcolor: 'error.50',
                    textAlign: 'center'
                  }}
                >
                  <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: 'error.main' }}>
                    <DeviceIcon />
                  </Avatar>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Thiết bị cũ (được thay thế)
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {replacement.oldDeviceCode}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {replacement.oldDeviceName}
                  </Typography>
                </Box>
              </Grid>

              {/* Arrow */}
              <Grid item xs={12} md={2}>
                <Box textAlign="center">
                  <ArrowIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
              </Grid>

              {/* New Device */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'success.light',
                    borderRadius: 1,
                    bgcolor: 'success.50',
                    textAlign: 'center'
                  }}
                >
                  <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: 'success.main' }}>
                    <DeviceIcon />
                  </Avatar>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Thiết bị mới (thay thế)
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {replacement.newDeviceCode}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {replacement.newDeviceName}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* User Information */}
        {replacement.userFullName && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Người dùng được gán
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {replacement.userFullName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {replacement.userEmail}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Replacement Details */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
              Thông tin thay thế
            </Typography>

            <Grid container spacing={3}>
              {/* Date */}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TimeIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Ngày thay thế
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatDateVN(replacement.replacementDate, true)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Trạng thái
                    </Typography>
                    <Chip
                      label={getReplacementStatusText(replacement)}
                      color={replacement.replacementDate ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Reason */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2}>
                  <ReasonIcon color="primary" sx={{ mt: 0.5 }} />
                  <Box flex={1}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Lý do thay thế
                    </Typography>
                    <Typography variant="body1">
                      {replacement.reason || 'Không có lý do được ghi nhận'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            <strong>Lưu ý:</strong> Việc thay thế này đã được thực hiện tự động bao gồm:
          </Typography>
          <Typography variant="caption" color="textSecondary" component="div" sx={{ mt: 1 }}>
            • Cập nhật trạng thái thiết bị cũ thành "Đã thay thế"
            <br />
            • Gán thiết bị mới cho người dùng hiện tại
            <br />
            • Ghi lại lịch sử thay đổi cho cả hai thiết bị
            <br />
            • Tạo bản ghi cấp phát mới cho thiết bị thay thế
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}