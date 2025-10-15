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
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import { DeviceDto } from '../../types/device';
import { getAllDevices } from '../../services/deviceService';
import SelectReplacementDeviceDialog from './SelectReplacementDeviceDialog';
import { useNotification } from '../../hooks/useNotification';

interface ReplacementTestDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ReplacementTestDialog({
  open,
  onClose
}: ReplacementTestDialogProps) {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null);
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open) {
      loadDevices();
    }
  }, [open]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await getAllDevices();
      // Filter to only show devices that can be replaced
      const replaceableDevices = data.filter(d => 
        d.status === 'Đang sử dụng' || d.status === 'Đã hỏng' || d.status === 'Đang sửa chữa'

      );
      setDevices(replaceableDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
      showNotification('Không thể tải danh sách thiết bị', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSelect = (device: DeviceDto) => {
    setSelectedDevice(device);
    setReplacementDialogOpen(true);
  };

  const handleReplacementSuccess = () => {
    showNotification('Test thay thế thiết bị thành công!', 'success');
    setReplacementDialogOpen(false);
    setSelectedDevice(null);
    loadDevices(); // Refresh list
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Test Thay thế thiết bị
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Chọn một thiết bị từ danh sách bên dưới để test tính năng thay thế
          </Alert>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : devices.length === 0 ? (
            <Typography variant="body2" color="textSecondary" textAlign="center" p={3}>
              Không có thiết bị nào có thể thay thế (InUse, Damaged, Maintenance)
            </Typography>
          ) : (
            <List>
              {devices.slice(0, 10).map((device) => (
                <ListItem key={device.id} disablePadding>
                  <ListItemButton onClick={() => handleDeviceSelect(device)}>
                    <ListItemText
                      primary={`${device.deviceCode} - ${device.deviceName}`}
                      secondary={`Status: ${device.status} | Model: ${device.modelName || 'N/A'}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <SelectReplacementDeviceDialog
        open={replacementDialogOpen}
        onClose={() => {
          setReplacementDialogOpen(false);
          setSelectedDevice(null);
        }}
        onSuccess={handleReplacementSuccess}
        oldDevice={selectedDevice}
      />
    </>
  );
}