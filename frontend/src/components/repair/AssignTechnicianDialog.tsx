import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Repair,
  TechnicianUser,
  AssignTechnicianDto,
  repairService,
  getRepairStatusText,
  getRepairStatusColor
} from '../../services/repairService';

interface AssignTechnicianDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repair: Repair | null;
}

export default function AssignTechnicianDialog({
  open,
  onClose,
  onSuccess,
  repair
}: AssignTechnicianDialogProps) {
  const [technicians, setTechnicians] = useState<TechnicianUser[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadTechnicians();
      setSelectedTechnicianId('');
      setNote('');
      setError('');
    }
  }, [open]);

  const loadTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      const data = await repairService.getAvailableTechnicians();
      setTechnicians(data);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách kỹ thuật viên:', error);
      setError('Không thể tải danh sách kỹ thuật viên');
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repair) return;

    if (!selectedTechnicianId) {
      setError('Vui lòng chọn kỹ thuật viên');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const assignData: AssignTechnicianDto = {
        technicianId: selectedTechnicianId,
        note: note.trim() || undefined
      };

      await repairService.assignTechnician(repair.id, assignData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Lỗi khi phân công kỹ thuật viên:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi phân công kỹ thuật viên');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTechnician = () => {
    return technicians.find(tech => tech.id === selectedTechnicianId);
  };

  if (!repair) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" gutterBottom>
            Phân công kỹ thuật viên sửa chữa
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

          {loadingTechnicians ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Chọn kỹ thuật viên */}
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Chọn kỹ thuật viên</InputLabel>
                <Select
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                  label="Chọn kỹ thuật viên"
                >
                  {technicians.map((tech) => (
                    <MenuItem key={tech.id} value={tech.id}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {tech.fullName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {tech.email} • {tech.departmentName}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Hiển thị thông tin kỹ thuật viên đã chọn */}
              {getSelectedTechnician() && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Kỹ thuật viên được chọn:
                  </Typography>
                  <Typography variant="body2">
                    <strong>{getSelectedTechnician()!.fullName}</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {getSelectedTechnician()!.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {getSelectedTechnician()!.departmentName}
                  </Typography>
                </Box>
              )}

              {/* Ghi chú */}
              <TextField
                fullWidth
                label="Ghi chú (tùy chọn)"
                multiline
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm về yêu cầu sửa chữa hoặc hướng dẫn cho kỹ thuật viên..."
                margin="normal"
              />

              {/* Hiển thị thông tin lệnh sửa chữa */}
              {repair.description && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Mô tả sự cố:
                  </Typography>
                  <Typography variant="body2">
                    {repair.description}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingTechnicians || !selectedTechnicianId}
          >
            {loading ? <CircularProgress size={20} /> : 'Phân công'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}