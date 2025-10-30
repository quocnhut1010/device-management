import React, { useState } from 'react';
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
  FormControlLabel,
  Checkbox,
  TextField,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { ExportRequestDto } from '../../types/reportExport';
import { exportReport, downloadFile } from '../../services/reportExportService';
import useNotification from '../../hooks/useNotification';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  reportType?: 'Devices' | 'Repairs' | 'Incidents' | 'Liquidation';
  filters?: Record<string, string>;
  onSuccess?: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  reportType = 'Devices',
  filters = {},
  onSuccess,
}) => {
  const [selectedReportType, setSelectedReportType] = useState(reportType);
  const [format, setFormat] = useState<'Excel' | 'PDF'>('Excel');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [saveToHistory, setSaveToHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showSuccess, showError } = useNotification();

  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const request: ExportRequestDto = {
        reportType: selectedReportType,
        format,
        fromDate: fromDate?.toISOString(),
        toDate: toDate?.toISOString(),
        saveToHistory,
        filters,
      };

      const blob = await exportReport(request);
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const extension = format === 'Excel' ? 'xlsx' : 'pdf';
      const filename = `${selectedReportType}_Export_${timestamp}.${extension}`;
      
      downloadFile(blob, filename);
      showSuccess(`Đã xuất báo cáo ${selectedReportType} thành công!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi xuất báo cáo';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  const reportTypeOptions = [
    { value: 'Devices', label: 'Thiết bị' },
    { value: 'Repairs', label: 'Sửa chữa' },
    { value: 'Incidents', label: 'Báo cáo sự cố' },
    { value: 'Liquidation', label: 'Thanh lý' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Xuất báo cáo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>Loại báo cáo</InputLabel>
              <Select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value as any)}
                label="Loại báo cáo"
              >
                {reportTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Định dạng file
              </Typography>
              <ToggleButtonGroup
                value={format}
                exclusive
                onChange={(_, value) => value && setFormat(value)}
                fullWidth
              >
                <ToggleButton value="Excel">Excel (.xlsx)</ToggleButton>
                <ToggleButton value="PDF">PDF (.pdf)</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Từ ngày"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="Đến ngày"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={saveToHistory}
                  onChange={(e) => setSaveToHistory(e.target.checked)}
                />
              }
              label="Lưu vào lịch sử xuất báo cáo"
            />

            {Object.keys(filters).length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Bộ lọc hiện tại
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  {Object.entries(filters).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                      <strong>{key}:</strong> {value}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Đang xuất...' : 'Xuất báo cáo'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ExportDialog;
