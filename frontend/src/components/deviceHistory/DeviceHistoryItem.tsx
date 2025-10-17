import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Box,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Assignment as AssignmentIcon,
  RemoveCircle as RevocationIcon,
  Build as MaintenanceIcon,
  ConstructionOutlined as RepairIcon,
  SwapHoriz as ReplacementIcon,
  DeleteForever as LiquidationIcon,
  Settings as SystemIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DeviceHistoryData, ActionType, ACTION_TYPE_COLORS, ACTION_TYPE_LABELS } from '../../types/deviceHistory';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DeviceHistoryItemProps {
  history: DeviceHistoryData;
  showDeviceInfo?: boolean;
  onViewDetails?: (history: DeviceHistoryData) => void;
}

const getActionIcon = (actionType: string) => {
  switch (actionType as ActionType) {
    case 'CREATE':
      return <CreateIcon />;
    case 'UPDATE':
      return <UpdateIcon />;
    case 'DELETE':
      return <DeleteIcon />;
    case 'RESTORE':
      return <RestoreIcon />;
    case 'ASSIGNMENT':
      return <AssignmentIcon />;
    case 'REVOCATION':
      return <RevocationIcon />;
    case 'MAINTENANCE':
      return <MaintenanceIcon />;
    case 'REPAIR':
      return <RepairIcon />;
    case 'REPLACEMENT':
      return <ReplacementIcon />;
    case 'LIQUIDATION':
      return <LiquidationIcon />;
    case 'SYSTEM':
      return <SystemIcon />;
    default:
      return <InfoIcon />;
  }
};

const getActionColor = (actionType: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const color = ACTION_TYPE_COLORS[actionType as ActionType] || 'default';
  // Map colors to MUI chip color props
  switch (color) {
    case 'success': return 'success';
    case 'info': return 'info';
    case 'error': return 'error';
    case 'warning': return 'warning';
    case 'primary': return 'primary';
    case 'secondary': return 'secondary';
    default: return 'default';
  }
};

const DeviceHistoryItem: React.FC<DeviceHistoryItemProps> = ({
  history,
  showDeviceInfo = false,
  onViewDetails
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      elevation={1} 
      sx={{ 
        mb: 2,
        '&:hover': {
          elevation: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* Action Icon */}
          <Avatar
            sx={{
              bgcolor: `${getActionColor(history.actionType)}.main`,
              color: 'white',
              width: 48,
              height: 48
            }}
          >
            {getActionIcon(history.actionType)}
          </Avatar>

          {/* Content */}
          <Box flex={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {history.action}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Chip
                    label={ACTION_TYPE_LABELS[history.actionType as ActionType] || history.actionType}
                    color={getActionColor(history.actionType)}
                    size="small"
                  />
                  {showDeviceInfo && (
                    <Chip
                      label={history.deviceName}
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                  )}
                </Stack>
              </Box>
              
              {/* Actions */}
              <Stack direction="row" spacing={1}>
                {onViewDetails && (
                  <Tooltip title="Xem chi tiết">
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(history)}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>

            {/* Description */}
            {history.description && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                {history.description}
              </Typography>
            )}

            {/* Footer with user and date info */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {getInitials(history.actionByName)}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {history.actionByName}
                </Typography>
              </Stack>
              
              <Typography variant="body2" color="text.secondary">
                {formatDate(history.actionDate)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DeviceHistoryItem;