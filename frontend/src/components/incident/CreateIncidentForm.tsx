import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { CreateIncidentReportDto, incidentService } from '../../services/incidentService';
import { getAllDevices, getMyDevices, getManagedDevices } from '../../services/deviceService';
import { getUserFromToken } from '../../services/auth';



interface Device {
  id: string;
  deviceCode: string;
  deviceName: string;
}

interface CreateIncidentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const reportTypes = [
  'Hỏng hóc phần cứng',
  'Lỗi phần mềm',
  'Mất mát thiết bị',
  'Hư hỏng vật lý',
  'Lỗi kết nối mạng',
  'Khác'
];

export default function CreateIncidentForm({ open, onClose, onSuccess }: CreateIncidentFormProps) {
  const [formData, setFormData] = useState<CreateIncidentReportDto>({
    deviceId: '',
    reportType: '',
    description: '',
    imageUrl: ''
  });
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Load danh sách thiết bị khi mở form
  useEffect(() => {
    if (open) {
      loadDevices();
      // Reset form
      setFormData({
        deviceId: '',
        reportType: '',
        description: '',
        imageUrl: ''
      });
      setSelectedFile(null);
      setImagePreview('');
      setError('');
    }
  }, [open]);

  const loadDevices = async () => {
    try {
      setLoadingDevices(true);
      const user = getUserFromToken();
      if (!user) {
        setError('Không thể xác thực người dùng');
        return;
      }

      let response;
      if (user.role === 'Admin') {
        response = await getAllDevices();
      } else if (user.position === 'Trưởng phòng') {
        response = await getManagedDevices();
      } else {
        response = await getMyDevices();
      }

      setDevices(response);
    } catch (error) {
      setError('Không thể tải danh sách thiết bị');
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deviceId || !formData.reportType || !formData.description.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Nếu có ảnh, upload ảnh trước
      if (selectedFile) {
        const imageUrl = await incidentService.uploadIncidentImage(selectedFile);
        formData.imageUrl = imageUrl;
      }

      await incidentService.createReport(formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Có lỗi xảy ra khi tạo báo cáo';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      deviceId: event.target.value
    }));
  };

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      reportType: event.target.value
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Tạo báo cáo sự cố mới</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Chọn thiết bị */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Thiết bị</InputLabel>
                <Select
                  value={formData.deviceId}
                  label="Thiết bị"
                  onChange={handleDeviceChange}
                  disabled={loadingDevices}
                >
                  {loadingDevices ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Đang tải...
                    </MenuItem>
                  ) : devices.length > 0 ? (
                    devices.map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.deviceCode} - {device.deviceName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      Không có thiết bị nào được phân công
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Loại sự cố */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Loại sự cố</InputLabel>
                <Select
                  value={formData.reportType}
                  label="Loại sự cố"
                  onChange={handleReportTypeChange}
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Mô tả chi tiết */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả chi tiết"
                multiline
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Mô tả chi tiết về sự cố, triệu chứng, thời gian xảy ra..."
              />
            </Grid>

            {/* Chọn ảnh */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                {selectedFile ? 'Đổi ảnh minh chứng' : 'Chọn ảnh minh chứng (tùy chọn)'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </Button>
            </Grid>

            {/* Xem trước ảnh */}
            {imagePreview && (
              <Grid item xs={12}>
                <img src={imagePreview} alt="preview" style={{ maxHeight: 200, borderRadius: 8 }} />
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
            {loading ? 'Đang tạo...' : 'Tạo báo cáo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
