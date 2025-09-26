// src/components/dialogs/DeviceQRCodeDialog.tsx
import { Dialog, DialogTitle, DialogContent, Box, Typography } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';

interface Props {
  open: boolean;
  onClose: () => void;
  barcode: string;
}

const DeviceQRCodeDialog = ({ open, onClose, barcode }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Mã QR thiết bị</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={2}>
          <QRCodeCanvas value={barcode} size={180} />
          <Typography variant="body1" fontWeight="bold">
            {barcode}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceQRCodeDialog;
