import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { Repair, RepairRequestDto, repairService } from '../../services/repairService';

interface CompleteRepairFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repair: Repair | null;
}

export default function CompleteRepairForm({
  open,
  onClose,
  onSuccess,
  repair
}: CompleteRepairFormProps) {
  const [formData, setFormData] = useState<RepairRequestDto>({
    description: '',
    cost: 0,
    laborHours: 0,
    repairCompany: '',
    imageUrls: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (open && repair) {
      setFormData({
        description: repair.description || '',
        cost: repair.cost || 0,
        laborHours: repair.laborHours || 0,
        repairCompany: repair.repairCompany || '',
        imageUrls: []
      });
      setError('');
    }
  }, [open, repair]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repair) return;

    if (!formData.description?.trim()) {
      setError('Vui lòng nhập mô tả công việc đã thực hiện');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await repairService.completeRepair(repair.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Lỗi khi hoàn thành sửa chữa:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi hoàn thành sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (value: string) => {
    const urls = value.split('\n').filter(url => url.trim() !== '');
    setFormData(prev => ({
      ...prev,
      imageUrls: urls
    }));
  };

  if (!repair) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Hoàn thành sửa chữa</Typography>
          <Box>
            <Typography variant="body2" color="textSecondary">
              {repair.deviceCode}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {repair.deviceName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Mô tả công việc đã thực hiện */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả công việc đã thực hiện *"
                multiline
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Mô tả chi tiết các công việc đã thực hiện, linh kiện đã thay thế..."
              />
            </Grid>

            {/* Chi phí và giờ công */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Chi phí (VND)"
                type="number"
                value={formData.cost || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cost: parseFloat(e.target.value) || 0
                }))}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số giờ công"
                type="number"
                step="0.1"
                value={formData.laborHours || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  laborHours: parseFloat(e.target.value) || 0
                }))}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Công ty sửa chữa */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Công ty/Đơn vị sửa chữa"
                value={formData.repairCompany}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  repairCompany: e.target.value
                }))}
                placeholder="Tên công ty hoặc đơn vị thực hiện sửa chữa"
              />
            </Grid>

            {/* URL hình ảnh */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL hình ảnh sau sửa chữa (tùy chọn)"
                multiline
                rows={3}
                value={formData.imageUrls?.join('\n') || ''}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="Nhập từng URL trên một dòng&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                helperText="Mỗi URL một dòng. Hình ảnh minh chứng công việc đã hoàn thành."
              />
            </Grid>

            {/* Hiển thị thông tin báo cáo gốc */}
            {repair.incidentReport && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin báo cáo gốc
                  </Typography>
                  <Box display="flex" gap={2} mb={1}>
                    <Chip label={repair.incidentReport.reportType} size="small" />
                  </Box>
                  <Typography variant="body2">
                    {repair.incidentReport.description}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang gửi...' : 'Hoàn thành'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}