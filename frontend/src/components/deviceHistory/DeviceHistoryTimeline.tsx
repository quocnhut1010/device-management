import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  Divider,
  Collapse
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
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { 
  DeviceHistoryTimelineData, 
  DeviceHistoryData, 
  ActionType, 
  ACTION_TYPE_COLORS, 
  ACTION_TYPE_LABELS 
} from '../../types/deviceHistory';
import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';

interface DeviceHistoryTimelineProps {
  timelineData: DeviceHistoryTimelineData[];
  showDeviceInfo?: boolean;
  onEventClick?: (event: DeviceHistoryData) => void;
}

const getActionIcon = (actionType: string) => {
  switch (actionType as ActionType) {
    case 'CREATE': return <CreateIcon fontSize="small" />;
    case 'UPDATE': return <UpdateIcon fontSize="small" />;
    case 'DELETE': return <DeleteIcon fontSize="small" />;
    case 'RESTORE': return <RestoreIcon fontSize="small" />;
    case 'ASSIGNMENT': return <AssignmentIcon fontSize="small" />;
    case 'REVOCATION': return <RevocationIcon fontSize="small" />;
    case 'MAINTENANCE': return <MaintenanceIcon fontSize="small" />;
    case 'REPAIR': return <RepairIcon fontSize="small" />;
    case 'REPLACEMENT': return <ReplacementIcon fontSize="small" />;
    case 'LIQUIDATION': return <LiquidationIcon fontSize="small" />;
    case 'SYSTEM': return <SystemIcon fontSize="small" />;
    default: return <InfoIcon fontSize="small" />;
  }
};

const getActionColor = (actionType: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const color = ACTION_TYPE_COLORS[actionType as ActionType] || 'default';
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

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  if (isToday(date)) {
    return 'Hôm nay';
  } else if (isYesterday(date)) {
    return 'Hôm qua';
  } else {
    return format(date, 'dd/MM/yyyy', { locale: vi });
  }
};

const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'HH:mm', { locale: vi });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface TimelineDayItemProps {
  dayData: DeviceHistoryTimelineData;
  showDeviceInfo?: boolean;
  onEventClick?: (event: DeviceHistoryData) => void;
}

const TimelineDayItem: React.FC<TimelineDayItemProps> = ({ 
  dayData, 
  showDeviceInfo, 
  onEventClick 
}) => {
  const [expanded, setExpanded] = useState(dayData.eventCount <= 3);

  const visibleEvents = expanded ? dayData.events : dayData.events.slice(0, 3);
  const hasMore = dayData.events.length > 3;

  return (
    <TimelineItem>
      <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
        <Typography variant="h6" component="div">
          {formatDateLabel(dayData.date)}
        </Typography>
        <Chip 
          label={`${dayData.eventCount} sự kiện`} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      </TimelineOppositeContent>
      
      <TimelineSeparator>
        <TimelineDot color="primary" variant="outlined">
          <InfoIcon fontSize="small" />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      
      <TimelineContent>
        <Card elevation={1} sx={{ mb: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              {visibleEvents.map((event, index) => (
                <Box key={event.id}>
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center"
                    sx={{ 
                      cursor: onEventClick ? 'pointer' : 'default',
                      '&:hover': onEventClick ? {
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                        p: 1,
                        m: -1
                      } : {}
                    }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <Avatar
                      sx={{
                        bgcolor: `${getActionColor(event.actionType)}.main`,
                        color: 'white',
                        width: 32,
                        height: 32
                      }}
                    >
                      {getActionIcon(event.actionType)}
                    </Avatar>
                    
                    <Box flex={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" component="div">
                            {event.action}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                            <Chip
                              label={ACTION_TYPE_LABELS[event.actionType as ActionType] || event.actionType}
                              size="small"
                              color={getActionColor(event.actionType)}
                              variant="outlined"
                            />
                            {showDeviceInfo && (
                              <Chip
                                label={event.deviceName}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                          {event.description && (
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              {event.description}
                            </Typography>
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(event.actionDate)}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem' }}>
                          {getInitials(event.actionByName)}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {event.actionByName}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  {index < visibleEvents.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
              
              {hasMore && (
                <Stack 
                  direction="row" 
                  justifyContent="center" 
                  sx={{ 
                    cursor: 'pointer',
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1
                    }
                  }}
                  onClick={() => setExpanded(!expanded)}
                >
                  <Chip
                    label={expanded ? 'Thu gọn' : `Xem thêm ${dayData.events.length - 3} sự kiện`}
                    icon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    variant="outlined"
                    clickable
                  />
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </TimelineContent>
    </TimelineItem>
  );
};

const DeviceHistoryTimeline: React.FC<DeviceHistoryTimelineProps> = ({
  timelineData,
  showDeviceInfo = false,
  onEventClick
}) => {
  if (timelineData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Không có dữ liệu lịch sử
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Chưa có hoạt động nào được ghi lại trong khoảng thời gian này.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Timeline position="right">
      {timelineData.map((dayData) => (
        <TimelineDayItem
          key={dayData.date}
          dayData={dayData}
          showDeviceInfo={showDeviceInfo}
          onEventClick={onEventClick}
        />
      ))}
    </Timeline>
  );
};

export default DeviceHistoryTimeline;