// src/components/device/DeviceDetailDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import DownloadIcon from '@mui/icons-material/Download';
import { useRef } from 'react';
import { DeviceDto } from '../../types/device';

interface Props {
  open: boolean;
  device: DeviceDto | null;
  onClose: () => void;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

const DeviceDetailDialog = ({ open, device, onClose }: Props) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_${device?.deviceCode || 'device'}.png`;
    link.click();
  };

  if (!device) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chi tiết thiết bị</DialogTitle>
      <DialogContent dividers>
        <Box display="grid" gap={1}>
          <Typography><b>Mã:</b> {device.deviceCode}</Typography>
          <Typography><b>Tên:</b> {device.deviceName}</Typography>

          {device.deviceImageUrl && (
            <img
              src={`${baseUrl}${device.deviceImageUrl}`}
              alt="device"
              style={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'contain',
                marginTop: 8,
                borderRadius: 4,
              }}
            />
          )}

          {device.barcode && (
            <Box mt={2} textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Mã QR</Typography>
              <Box ref={qrRef} display="inline-block" bgcolor="#fff" p={1} borderRadius={2} border="1px solid #ccc">
                <QRCodeCanvas
                  value={JSON.stringify({
                    id: device.id,
                    deviceCode: device.deviceCode,
                    deviceName: device.deviceName,
                    barcode: device.barcode,
                    status: device.status,
                  })}
                  size={180}
                  level="H"
                  includeMargin
                />
              </Box>
              <Box mt={1}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadQR}
                  size="small"
                >
                  Tải mã QR
                </Button>
              </Box>
            </Box>
          )}

          <Typography><b>Mẫu thiết bị:</b> {device.modelName}</Typography>
          <Typography><b>Nhà cung cấp:</b> {device.supplierName}</Typography>
          <Typography><b>Phòng ban:</b> {device.departmentName}</Typography>
          <Typography><b>Người phụ trách:</b> {device.currentUserName}</Typography>
          <Typography><b>Trạng thái:</b> {device.status}</Typography>
          <Typography><b>Ngày mua:</b> {device.purchaseDate?.split('T')[0]}</Typography>
          <Typography><b>Hết hạn BH:</b> {device.warrantyExpiry?.split('T')[0]}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceDetailDialog;
