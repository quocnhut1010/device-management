import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip
} from '@mui/material';
import {
  Repair,
  RejectOrNotNeededDto,
  repairService,
  getRepairStatusText,
  getRepairStatusColor,
  RepairStatus
} from '../../services/repairService';

interface RejectOrNotNeededDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repair: Repair | null;
}

export default function RejectOrNotNeededDialog({
  open,
  onClose,
  onSuccess,
  repair
}: RejectOrNotNeededDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<number>(RepairStatus.TuChoi);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      setSelectedStatus(RepairStatus.TuChoi);
      setReason('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repair) return;

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data: RejectOrNotNeededDto = {
        status: selectedStatus,
        reason: reason.trim()
      };

      await repairService.rejectOrMarkNotNeeded(repair.id, data);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Lỗi khi thực hiện thao tác:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi thực hiện thao tác');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDescription = (status: number) => {
    if (status === RepairStatus.TuChoi) {
      return {
        title: 'Từ chối sửa chữa',
        description: 'Không thể sửa chữa thiết bị (vượt kinh phí, không khả thi, quá số lần sửa chữa...)',
        deviceResult: 'Thiết bị sẽ giữ nguyên trạng thái hỏng',
        color: 'error' as const
      };
    } else {
      return {
        title: 'Không cần sửa chữa',
        description: 'Thiết bị không có vấn đề thật sự (báo cáo sai, dây lỏng, lỗi nhỏ...)',
        deviceResult: 'Thiết bị sẽ quay về trạng thái "Đang sử dụng"',
        color: 'warning' as const
      };
    }
  };

  if (!repair) return null;

  const statusInfo = getStatusDescription(selectedStatus);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" gutterBottom>
            Xử lý lệnh sửa chữa
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {repair.deviceCode}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {repair.deviceName}
              </Typography>
            </Box>
            <Chip
              label={getRepairStatusText(repair.status)}
              color={getRepairStatusColor(repair.status) as any}
              size="small"
            />
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Chọn loại xử lý */}
          <FormControl component="fieldset" margin="normal" fullWidth>
            <FormLabel component="legend">
              <Typography variant="subtitle1" fontWeight="bold">
                Chọn cách xử lý:
              </Typography>
            </FormLabel>
            <RadioGroup
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(parseInt(e.target.value))}
            >
              <FormControlLabel
                value={RepairStatus.TuChoi}
                control={<Radio color="error" />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Từ chối sửa chữa
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Không thể sửa vì vượt kinh phí, không khả thi, quá số lần sửa...
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value={RepairStatus.KhongCanSua}
                control={<Radio color="warning" />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Không cần sửa chữa
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Thiết bị bình thường, báo cáo sai, lỗi nhỏ đã khắc phục...
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Hiển thị thông tin kết quả */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color={statusInfo.color}>
              {statusInfo.title}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {statusInfo.description}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Kết quả: {statusInfo.deviceResult}
            </Typography>
          </Box>

          {/* Nhập lý do */}
          <TextField
            fullWidth
            label="Lý do chi tiết *"
            multiline
            rows={4}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              selectedStatus === RepairStatus.TuChoi
                ? "Mô tả lý do tại sao không thể sửa chữa (vượt kinh phí, thiết bị quá cũ, không có linh kiện...)"
                : "Mô tả lý do tại sao không cần sửa chữa (đã khắc phục, báo cáo sai, thiết bị hoạt động bình thường...)"
            }
            margin="normal"
          />

          {/* Hiển thị thông tin lệnh sửa chữa */}
          {repair.description && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Mô tả sự cố ban đầu:
              </Typography>
              <Typography variant="body2">
                {repair.description}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={statusInfo.color}
            disabled={loading || !reason.trim()}
          >
            {loading ? <CircularProgress size={20} /> : `${statusInfo.title}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}