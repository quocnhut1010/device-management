import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { EligibleDeviceDto, CreateLiquidationDto, BatchLiquidationDto } from '../../types/liquidation';
import liquidationService from '../../services/liquidationService';

interface LiquidationDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDevices: EligibleDeviceDto[];
  onSuccess: () => void;
}

const LiquidationDialog: React.FC<LiquidationDialogProps> = ({
  open,
  onClose,
  selectedDevices,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [liquidationDate, setLiquidationDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setLiquidationDate(new Date());
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do thanh lý');
      return;
    }

    if (selectedDevices.length === 0) {
      toast.error('Vui lòng chọn thiết bị cần thanh lý');
      return;
    }

    setLoading(true);

    try {
      const formattedDate = format(liquidationDate, 'yyyy-MM-dd');

      if (selectedDevices.length === 1) {
        // Thanh lý một thiết bị
        const liquidationData: CreateLiquidationDto = {
          deviceId: selectedDevices[0].id,
          reason: reason.trim(),
          liquidationDate: formattedDate
        };

        await liquidationService.liquidateDevice(liquidationData);
        toast.success('Thanh lý thiết bị thành công!');
      } else {
        // Thanh lý nhiều thiết bị
        const batchData: BatchLiquidationDto = {
          deviceIds: selectedDevices.map(device => device.id),
          reason: reason.trim(),
          liquidationDate: formattedDate
        };

        await liquidationService.liquidateBatch(batchData);
        toast.success(`Thanh lý ${selectedDevices.length} thiết bị thành công!`);
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error liquidating devices:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thanh lý thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = selectedDevices.reduce((sum, device) => sum + (device.purchasePrice || 0), 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Thanh lý thiết bị ({selectedDevices.length} thiết bị)
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Thông tin chung */}
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Lưu ý:</strong> Sau khi thanh lý, thiết bị sẽ không thể sử dụng được nữa. 
                  Thao tác này không thể hoàn tác.
                </Typography>
              </Alert>
            </Grid>

            {/* Danh sách thiết bị */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Danh sách thiết bị cần thanh lý
              </Typography>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã thiết bị</TableCell>
                      <TableCell>Tên thiết bị</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Phòng ban</TableCell>
                      <TableCell>Người dùng</TableCell>
                      <TableCell align="right">Giá trị (VND)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>{device.deviceCode}</TableCell>
                        <TableCell>{device.deviceName}</TableCell>
                        <TableCell>{device.status}</TableCell>
                        <TableCell>{device.currentDepartmentName || '-'}</TableCell>
                        <TableCell>{device.currentUserFullName || '-'}</TableCell>
                        <TableCell align="right">
                          {device.purchasePrice?.toLocaleString('vi-VN') || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Tổng giá trị: {totalValue.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Form nhập thông tin */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Ngày thanh lý"
                value={liquidationDate}
                onChange={(newValue) => newValue && setLiquidationDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={new Date()}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Lý do thanh lý"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                multiline
                rows={4}
                fullWidth
                required
                placeholder="Nhập lý do cần thanh lý thiết bị (ví dụ: hết hạn khấu hao, hỏng không thể sửa chữa, mất thiết bị...)"
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="warning"
            disabled={loading || !reason.trim()}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận thanh lý'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default LiquidationDialog;