import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { repairService, RejectRepairDto, NotNeededRepairDto } from '../../services/repairService';

interface RejectRepairDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repairId: string;
}

export function RejectRepairDialog({ open, onClose, onSuccess, repairId }: RejectRepairDialogProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const data: RejectRepairDto = { reason };
      await repairService.rejectRepair(repairId, data);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Lỗi khi từ chối lệnh sửa:', error);
      setError(error.response?.data?.message || 'Không thể từ chối lệnh sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Từ chối lệnh sửa chữa</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Lý do từ chối *"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do tại sao không thể thực hiện lệnh sửa chữa này..."
          sx={{ mt: 1 }}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          color="error"
          disabled={!reason.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Đang từ chối...' : 'Từ chối'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface NotNeededDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repairId: string;
}

export function NotNeededDialog({ open, onClose, onSuccess, repairId }: NotNeededDialogProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (open) {
      setNote('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!note.trim()) {
      setError('Vui lòng nhập ghi chú');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const data: NotNeededRepairDto = { note };
      await repairService.markAsNotNeeded(repairId, data);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Lỗi khi đánh dấu không cần sửa:', error);
      setError(error.response?.data?.message || 'Không thể đánh dấu không cần sửa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Đánh dấu không cần sửa chữa</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Ghi chú *"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Mô tả lý do tại sao thiết bị không cần sửa chữa hoặc đã được khắc phục..."
          sx={{ mt: 1 }}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!note.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Đang cập nhật...' : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}