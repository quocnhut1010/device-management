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
  Chip,
  Card,
  CardContent,
  Grid,
  FormControlLabel,
  Switch,
  Avatar,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  DeviceHub as DeviceIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import {
  SuggestedDeviceDto,
  CreateReplacementDto
} from '../../types/replacement';
import {
  getSuggestedReplacementDevices,
  getAllAvailableDevices,
  createReplacement,
  filterSuggestedDevices,
  sortDevicesByPriority
} from '../../services/replacementService';
import { DeviceDto } from '../../types/device';
import  useNotification  from '../../hooks/useNotification';

interface SelectReplacementDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  oldDevice: DeviceDto | null;
  incidentReportId?: string;
}

export default function SelectReplacementDeviceDialog({
  open,
  onClose,
  onSuccess,
  oldDevice,
  incidentReportId
}: SelectReplacementDeviceDialogProps) {
  const [availableDevices, setAvailableDevices] = useState<SuggestedDeviceDto[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<SuggestedDeviceDto[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSameModelOnly, setShowSameModelOnly] = useState<boolean>(true);
  
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState<string>('');

  const  showNotification  = useNotification();

  useEffect(() => {
    if (open && oldDevice) {
      loadAvailableDevices();
      resetForm();
    }
  }, [open, oldDevice]);

  useEffect(() => {
    // Filter and sort devices when search term or filter changes
    const filtered = filterSuggestedDevices(availableDevices, searchTerm, showSameModelOnly);
    const sorted = sortDevicesByPriority(filtered);
    setFilteredDevices(sorted);
  }, [availableDevices, searchTerm, showSameModelOnly]);

  const resetForm = () => {
    setSelectedDeviceId('');
    setReason('');
    setSearchTerm('');
    setShowSameModelOnly(true);
    setError('');
  };

  const loadAvailableDevices = async () => {
    if (!oldDevice) return;

    try {
      setLoadingDevices(true);
      setError('');

      // First try to get suggested devices (same model)
      const suggestedDevices = await getSuggestedReplacementDevices(oldDevice.id);
      
      if (suggestedDevices.length === 0) {
        // If no same model devices, get all available devices
        const allDevices = await getAllAvailableDevices();
        setAvailableDevices(allDevices);
        setShowSameModelOnly(false); // Auto disable same model filter
      } else {
        // Get both suggested and all devices for comparison
        const allDevices = await getAllAvailableDevices();
        setAvailableDevices(allDevices);
      }
    } catch (error: any) {
      console.error('Error loading available devices:', error);
      setError('Không thể tải danh sách thiết bị có sẵn');
      showNotification('Không thể tải danh sách thiết bị có sẵn', 'error');
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldDevice || !selectedDeviceId) return;

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do thay thế');
      return;
    }

    try {
      setLoadingCreate(true);
      setError('');

      const createData: CreateReplacementDto = {
        oldDeviceId: oldDevice.id,
        newDeviceId: selectedDeviceId,
        reason: reason.trim(),
        incidentReportId
      };

      await createReplacement(createData);
      setError('');
      showNotification('Thay thế thiết bị thành công!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating replacement:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thay thế thiết bị';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoadingCreate(false);
    }
  };

  const getSelectedDevice = (): SuggestedDeviceDto | undefined => {
    return filteredDevices.find(device => device.id === selectedDeviceId);
  };

  const formatPrice = (price?: number): string => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));
  };
  

  if (!oldDevice) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <SwapIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Chọn thiết bị thay thế
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Thiết bị cần thay thế: <strong>{oldDevice.deviceCode}</strong> - {oldDevice.deviceName}
            </Typography>
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

          {loadingDevices ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Đang tải danh sách thiết bị...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Search and Filters */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm theo mã, tên thiết bị, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showSameModelOnly}
                        onChange={(e) => setShowSameModelOnly(e.target.checked)}
                      />
                    }
                    label="Chỉ hiển thị thiết bị cùng model"
                  />
                  <Typography variant="body2" color="textSecondary">
                    {filteredDevices.length} thiết bị có sẵn
                  </Typography>
                </Box>
              </Box>

              {/* Device List */}
              {filteredDevices.length === 0 ? (
                <Box textAlign="center" p={4}>
                  <DeviceIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Không tìm thấy thiết bị phù hợp
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Thử tắt bộ lọc "cùng model" hoặc thay đổi từ khóa tìm kiếm
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredDevices.map((device) => (
                    <Grid item xs={12} md={6} key={device.id}>
                      <Card
                        variant={selectedDeviceId === device.id ? 'outlined' : 'elevation'}
                        sx={{
                          cursor: 'pointer',
                          border: selectedDeviceId === device.id ? 2 : 1,
                          borderColor: selectedDeviceId === device.id ? 'primary.main' : 'divider',
                          '&:hover': {
                            elevation: 3
                          }
                        }}
                        onClick={() => setSelectedDeviceId(device.id)}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar
                              src={device.deviceImageUrl}
                              sx={{ width: 48, height: 48 }}
                            >
                              <DeviceIcon />
                            </Avatar>
                            <Box flex={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {device.deviceCode}
                                </Typography>
                                {device.isSameModel && (
                                  <Chip 
                                    label="Cùng model" 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" color="textSecondary">
                                {device.deviceName}
                              </Typography>
                            </Box>
                            <Chip
                              label={device.status}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Box>

                          <Box>
                            <Typography variant="body2">
                              <strong>Model:</strong> {device.modelName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Loại:</strong> {device.typeName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Giá mua:</strong> {formatPrice(device.purchasePrice)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Ngày mua:</strong> {formatDate(device.purchaseDate)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Reason Input */}
              <TextField
                fullWidth
                label="Lý do thay thế *"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do cần thay thế thiết bị này..."
                margin="normal"
                required
                sx={{ mt: 3 }}
              />

              {/* Selected Device Summary */}
              {getSelectedDevice() && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: 1, borderColor: 'primary.200' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Thiết bị được chọn để thay thế:
                  </Typography>
                  <Typography variant="body2">
                    <strong>{getSelectedDevice()!.deviceCode}</strong> - {getSelectedDevice()!.deviceName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {getSelectedDevice()!.modelName} • {getSelectedDevice()!.typeName}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loadingCreate}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loadingDevices || loadingCreate || !selectedDeviceId || !reason.trim()}
            startIcon={loadingCreate && <CircularProgress size={20} />}
          >
            {loadingCreate ? 'Đang xử lý...' : 'Thay thế thiết bị'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}