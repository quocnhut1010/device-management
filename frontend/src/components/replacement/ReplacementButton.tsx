import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Tooltip,
  MenuItem
} from '@mui/material';
import {
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { DeviceDto } from '../../types/device';
import { getUserFromToken } from '../../services/auth';
import SelectReplacementDeviceDialog from './SelectReplacementDeviceDialog';
import { useNotification } from '../../hooks/useNotification';

interface ReplacementButtonProps {
  device: DeviceDto;
  variant?: 'button' | 'iconButton' | 'menuItem';
  onSuccess?: () => void;
  incidentReportId?: string; // If replacement is from incident report
  disabled?: boolean;
}

export default function ReplacementButton({
  device,
  variant = 'button',
  onSuccess,
  incidentReportId,
  disabled = false
}: ReplacementButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showNotification } = useNotification();
  const currentUser = getUserFromToken();
  const isAdmin = currentUser?.role === 'Admin';

  // Only admin can create replacements
  if (!isAdmin) {
    return null;
  }

  const handleClick = () => {
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    showNotification('Thay thế thiết bị thành công!', 'success');
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  // Check if device can be replaced
  const canReplace = device.status === 'Đang sử dụng' || device.status === 'Đã hỏng' || device.status === 'Đang sửa chữa';

  if (!canReplace) {
    const reason = device.status === 'Chưa cấp phát' 
      ? 'Thiết bị chưa được cấp phát'
      : device.status === 'Đã thay thế'
      ? 'Thiết bị đã được thay thế'
      : 'Trạng thái thiết bị không phù hợp';

    if (variant === 'menuItem') {
      return (
        <MenuItem disabled>
          <SwapIcon sx={{ mr: 1 }} />
          Thay thế thiết bị
        </MenuItem>
      );
    }

    return (
      <Tooltip title={reason} arrow>
        <span>
          {variant === 'iconButton' ? (
            <IconButton disabled size="small">
              <SwapIcon />
            </IconButton>
          ) : (
            <Button
              disabled
              variant="outlined"
              startIcon={<SwapIcon />}
              size="small"
            >
              Thay thế
            </Button>
          )}
        </span>
      </Tooltip>
    );
  }

  const content = () => {
    switch (variant) {
      case 'iconButton':
        return (
          <Tooltip title="Thay thế thiết bị" arrow>
            <IconButton
              onClick={handleClick}
              disabled={disabled}
              size="small"
              color="warning"
            >
              <SwapIcon />
            </IconButton>
          </Tooltip>
        );

      case 'menuItem':
        return (
          <MenuItem onClick={handleClick} disabled={disabled}>
            <SwapIcon sx={{ mr: 1 }} />
            Thay thế thiết bị
          </MenuItem>
        );

      default:
        return (
          <Button
            variant="outlined"
            startIcon={<SwapIcon />}
            onClick={handleClick}
            disabled={disabled}
            size="small"
            color="warning"
          >
            Thay thế
          </Button>
        );
    }
  };

  return (
    <>
      {content()}
      
      <SelectReplacementDeviceDialog
        open={dialogOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        oldDevice={device}
        incidentReportId={incidentReportId}
      />
    </>
  );
}