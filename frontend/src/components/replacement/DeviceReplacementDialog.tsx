import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  TextField,
  Alert,
  FormControlLabel,
  Switch,
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  SwapHoriz as SwapIcon,
  DevicesOther as DeviceIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import { 
  getSuggestedReplacementDevices, 
  createReplacement,
  filterSuggestedDevices,
  sortDevicesByPriority
} from '../../services/replacementService';
import { SuggestedDeviceDto, CreateReplacementDto } from '../../types/replacement';
import { useNotification } from '../../hooks/useNotification';

interface DeviceReplacementDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  incidentReportId?: string; // Khi thay thế từ incident report
  title?: string;
}

export default function DeviceReplacementDialog({
  open,
  onClose,
  onSuccess,
  deviceId,
  deviceCode,
  deviceName,
  incidentReportId,
  title = "Thay thế thiết bị"
}: DeviceReplacementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestedDevices, setSuggestedDevices] = useState<SuggestedDeviceDto[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<SuggestedDeviceDto[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSameModelOnly, setShowSameModelOnly] = useState(true);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && deviceId) {
      loadSuggestedDevices();
    }
  }, [open, deviceId]);

  useEffect(() => {
    const filtered = filterSuggestedDevices(
      suggestedDevices,
      searchTerm,
      showSameModelOnly
    );
    const sorted = sortDevicesByPriority(filtered);
    setFilteredDevices(sorted);
  }, [suggestedDevices, searchTerm, showSameModelOnly]);

  const loadSuggestedDevices = async () => {
    try {
      setLoading(true);
      const devices = await getSuggestedReplacementDevices(deviceId);
      setSuggestedDevices(devices);
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || 'Không thể tải danh sách thiết bị thay thế',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDeviceId || !reason.trim()) {
      showNotification('Vui lòng chọn thiết bị và nhập lý do thay thế', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      
      const createReplacementDto: CreateReplacementDto = {
        oldDeviceId: deviceId,
        newDeviceId: selectedDeviceId,
        reason: reason.trim(),
        ...(incidentReportId && { incidentReportId })
      };

      await createReplacement(createReplacementDto);
      
      showNotification('Thay thế thiết bị thành công!', 'success');
      handleClose();
      onSuccess();
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || 'Không thể thực hiện thay thế thiết bị',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDeviceId('');
    setReason('');
    setSearchTerm('');
    setShowSameModelOnly(true);
    onClose();
  };

  const selectedDevice = filteredDevices.find(d => d.id === selectedDeviceId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SwapIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Thông tin thiết bị hiện tại */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Thiết bị hiện tại:</strong> {deviceCode} - {deviceName}
          </Typography>
        </Alert>

        {/* Lý do thay thế */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Lý do thay thế *"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do cần thay thế thiết bị..."
          sx={{ mb: 3 }}
        />

        {/* Bộ lọc */}
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            size="small"
            label="Tìm kiếm thiết bị"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Mã thiết bị, tên thiết bị..."
            sx={{ flexGrow: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showSameModelOnly}
                onChange={(e) => setShowSameModelOnly(e.target.checked)}
                color="primary"
              />
            }
            label="Chỉ cùng model"
          />
        </Box>

        {/* Danh sách thiết bị thay thế */}
        <Typography variant="h6" gutterBottom>
          Chọn thiết bị thay thế:
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredDevices.length === 0 ? (
          <Alert severity="warning">
            Không có thiết bị nào phù hợp để thay thế
          </Alert>
        ) : (
          <Box maxHeight={300} overflow="auto">
            <Grid container spacing={2}>
              {filteredDevices.map((device) => (
                <Grid item xs={12} key={device.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedDeviceId === device.id ? 2 : 1,
                      borderColor: selectedDeviceId === device.id ? 'primary.main' : 'divider',
                      '&:hover': {
                        borderColor: 'primary.light',
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => setSelectedDeviceId(device.id)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar>
                            <DeviceIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {device.deviceCode}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {device.deviceName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Model: {device.modelName} | Loại: {device.typeName}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          {device.isSameModel && (
                            <Chip 
                              label="Cùng model" 
                              color="success" 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          {selectedDeviceId === device.id && (
                            <CheckIcon color="primary" />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Xác nhận thay thế */}
        {selectedDevice && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Sẽ thay thế bằng:</strong> {selectedDevice.deviceCode} - {selectedDevice.deviceName}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedDeviceId || !reason.trim() || submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : <SwapIcon />}
        >
          {submitting ? 'Đang thay thế...' : 'Xác nhận thay thế'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}