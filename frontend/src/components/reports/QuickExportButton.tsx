import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { ExportRequestDto } from '../../types/reportExport';
import { exportReport, downloadFile } from '../../services/reportExportService';
import useNotification from '../../hooks/useNotification';

interface QuickExportButtonProps {
  reportType: 'Devices' | 'Repairs' | 'Incidents' | 'Liquidation';
  filters?: Record<string, string>;
  variant?: 'button' | 'iconButton';
  onSuccess?: () => void;
}

const QuickExportButton: React.FC<QuickExportButtonProps> = ({
  reportType,
  filters = {},
  variant = 'button',
  onSuccess,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (format: 'Excel' | 'PDF') => {
    try {
      setIsLoading(true);
      handleClose();

      const request: ExportRequestDto = {
        reportType,
        format,
        filters,
        saveToHistory: false, // Quick export doesn't save to history
      };

      const blob = await exportReport(request);
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const extension = format === 'Excel' ? 'xlsx' : 'pdf';
      const filename = `${reportType}_Export_${timestamp}.${extension}`;
      
      downloadFile(blob, filename);
      showSuccess(`Đã xuất báo cáo ${reportType} (${format}) thành công!`);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi xuất báo cáo';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Devices: 'Thiết bị',
      Repairs: 'Sửa chữa',
      Incidents: 'Báo cáo sự cố',
      Liquidation: 'Thanh lý',
    };
    return labels[type] || type;
  };

  if (variant === 'iconButton') {
    return (
      <>
        <IconButton
          onClick={handleClick}
          disabled={isLoading}
          color="primary"
          title={`Xuất báo cáo ${getReportTypeLabel(reportType)}`}
        >
          {isLoading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem onClick={() => handleExport('Excel')}>
            <ListItemIcon>
              <ExcelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xuất Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('PDF')}>
            <ListItemIcon>
              <PdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xuất PDF</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={isLoading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? 'Đang xuất...' : `Xuất ${getReportTypeLabel(reportType)}`}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleExport('Excel')}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xuất Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('PDF')}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xuất PDF</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default QuickExportButton;
