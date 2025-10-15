import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Alert
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LiquidationDto } from '../../types/liquidation';
import liquidationService from '../../services/liquidationService';
import { toast } from 'react-toastify';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface LiquidationDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  liquidationId: string | null;
}

const LiquidationDetailsDialog: React.FC<LiquidationDetailsDialogProps> = ({
  open,
  onClose,
  liquidationId
}) => {
  const [loading, setLoading] = useState(false);
  const [liquidation, setLiquidation] = useState<LiquidationDto | null>(null);

  useEffect(() => {
    if (open && liquidationId) {
      fetchDetails();
    }
  }, [open, liquidationId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await liquidationService.getLiquidationById(liquidationId!);
      setLiquidation(data);
    } catch (error: any) {
      console.error('Error loading liquidation details:', error);
      toast.error('Không thể tải chi tiết thanh lý');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '--';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString.toString();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoOutlinedIcon color="primary" />
        Chi tiết Thanh lý Thiết bị
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : liquidation ? (
          <Box sx={{ p: 1 }}>
            {/* Header Info */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã thiết bị
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {liquidation.deviceCode || '--'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tên thiết bị
                  </Typography>
                  <Typography variant="body1">{liquidation.deviceName || '--'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Người phê duyệt
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {liquidation.approvedByName || '--'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày thanh lý
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(liquidation.liquidationDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Reason + Status */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Lý do Thanh lý
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {liquidation.reason || 'Không có lý do cụ thể'}
              </Typography>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutlineIcon color="success" />
                <Chip
                  label="Đã thanh lý"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Paper>

            {/* Audit Info */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Thông tin ghi nhận
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    ID bản ghi
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {liquidation.id}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian ghi nhận
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(liquidation.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : (
          <Alert severity="warning" icon={<WarningAmberIcon />}>
            Không tìm thấy dữ liệu thanh lý.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LiquidationDetailsDialog;
