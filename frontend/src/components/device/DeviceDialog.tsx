import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import DeviceModelDropdown from '../dropdowns/DeviceModelDropdown';
import SupplierDropdown from '../dropdowns/SupplierDropdown';
import { DeviceDto, CreateDeviceDto } from '../../types/device';
import dayjs from 'dayjs';

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeviceDto | (DeviceDto & { file?: File | null })) => void;
  initialData?: Partial<DeviceDto>;
}

const statusOptions = [
  { value: 'Chưa cấp phát', label: 'Chưa cấp phát' },
  { value: 'Đang sử dụng', label: 'Đang sử dụng' },
  { value: 'Đã hỏng', label: 'Đã hỏng' },
  { value: 'Đã thanh lý', label: 'Đã thanh lý' },
];

const DeviceDialog = ({ open, onClose, onSubmit, initialData }: Props) => {
  const [deviceName, setDeviceName] = useState('');
  const [deviceModelId, setDeviceModelId] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [serialNumber, setSerialNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [status, setStatus] = useState('Chưa cấp phát');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setDeviceName(initialData.deviceName || '');
      setDeviceModelId(initialData.modelId || null);
      setSupplierId(initialData.supplierId || null);
      setPurchasePrice(initialData.purchasePrice || 0);
      setSerialNumber(initialData.serialNumber || '');
      setBarcode(initialData.barcode || '');
      setStatus(initialData.status || 'Chưa cấp phát');
      setPurchaseDate(
        initialData.purchaseDate ? dayjs(initialData.purchaseDate).format('YYYY-MM-DD') : ''
      );
      setWarrantyExpiry(
        initialData.warrantyExpiry ? dayjs(initialData.warrantyExpiry).format('YYYY-MM-DD') : ''
      );

      // Nếu có ảnh cũ thì prepend baseUrl
      if (initialData.deviceImageUrl) {
        setPreviewUrl(`${baseUrl}${initialData.deviceImageUrl}`);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setDeviceName('');
      setDeviceModelId(null);
      setSupplierId(null);
      setPurchasePrice(0);
      setSerialNumber('');
      setBarcode('');
      setStatus('Chưa cấp phát');
      setPurchaseDate('');
      setWarrantyExpiry('');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Ảnh mới chọn dùng URL local
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const payload: CreateDeviceDto & { file?: File | null } = {
      deviceName,
      modelId: deviceModelId || undefined,
      supplierId: supplierId || undefined,
      purchasePrice: purchasePrice || undefined,
      serialNumber: serialNumber || undefined,
      barcode: barcode || undefined,
      status: status || undefined,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : undefined,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry).toISOString() : undefined,
      file: selectedFile,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            fullWidth
            label="Tên thiết bị"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />

          <DeviceModelDropdown
            value={deviceModelId || ''}
            onChange={setDeviceModelId}
            onlyActive
          />

          <SupplierDropdown value={supplierId || ''} onChange={setSupplierId} onlyActive />

          <TextField
            fullWidth
            label="Giá mua"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Number(e.target.value))}
          />

          <TextField
            fullWidth
            label="Số Serial"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />

          {/* <TextField
            fullWidth
            label="Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            helperText="Mã barcode của thiết bị (tự động sinh nếu để trống)"
          /> */}

          <TextField
            select
            fullWidth
            label="Trạng thái"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Ngày mua"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Ngày hết hạn bảo hành"
            type="date"
            value={warrantyExpiry}
            onChange={(e) => setWarrantyExpiry(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* Input ảnh */}
          <Box>
            <Button variant="outlined" component="label" fullWidth>
              Chọn ảnh
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {previewUrl && (
              <Box mt={1}>
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ maxWidth: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceDialog;
