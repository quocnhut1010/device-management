import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Stack,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
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
import { 
  DeviceHistoryStats as StatsData, 
  ActionType, 
  ACTION_TYPE_COLORS, 
  ACTION_TYPE_LABELS 
} from '../../types/deviceHistory';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DeviceHistoryStatsProps {
  stats: StatsData;
  loading?: boolean;
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

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}> = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card elevation={2}>
    <CardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value.toLocaleString()}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, color: 'white' }}>
          {icon}
        </Avatar>
      </Stack>
    </CardContent>
  </Card>
);

const DeviceHistoryStats: React.FC<DeviceHistoryStatsProps> = ({ stats, loading = false }) => {
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

  const getMaxCount = (data: Record<string, number>) => {
    return Math.max(...Object.values(data), 1);
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Box sx={{ height: 120 }}>
                  <LinearProgress />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* Summary Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng sự kiện"
            value={stats.totalEvents}
            icon={<AssessmentIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sự kiện gần đây"
            value={stats.recentEvents}
            icon={<TrendingUpIcon />}
            color="success"
            subtitle="7 ngày qua"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Loại hoạt động"
            value={Object.keys(stats.eventsByType).length}
            icon={<TimelineIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hoạt động gần nhất"
            value={stats.recentActivities.length}
            icon={<HistoryIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Events by Type */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê theo loại hoạt động
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(stats.eventsByType).length > 0 ? (
                  Object.entries(stats.eventsByType)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => {
                      const percentage = (count / getMaxCount(stats.eventsByType)) * 100;
                      return (
                        <Box key={type} sx={{ mb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Avatar
                                sx={{
                                  bgcolor: `${getActionColor(type)}.main`,
                                  color: 'white',
                                  width: 24,
                                  height: 24
                                }}
                              >
                                {getActionIcon(type)}
                              </Avatar>
                              <Typography variant="body2">
                                {ACTION_TYPE_LABELS[type as ActionType] || type}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight="bold">
                              {count}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            color={getActionColor(type)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      );
                    })
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Không có dữ liệu
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Events by Action */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê theo hành động
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(stats.eventsByAction).length > 0 ? (
                  Object.entries(stats.eventsByAction)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10) // Show top 10
                    .map(([action, count]) => {
                      const percentage = (count / getMaxCount(stats.eventsByAction)) * 100;
                      return (
                        <Box key={action} sx={{ mb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                              {action}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {count}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      );
                    })
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Không có dữ liệu
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hoạt động gần đây
              </Typography>
              {stats.recentActivities.length > 0 ? (
                <List>
                  {stats.recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: `${getActionColor(activity.actionType)}.main`,
                              color: 'white'
                            }}
                          >
                            {getActionIcon(activity.actionType)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle2">
                                {activity.action}
                              </Typography>
                              <Chip
                                label={activity.deviceName}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={ACTION_TYPE_LABELS[activity.actionType as ActionType] || activity.actionType}
                                size="small"
                                color={getActionColor(activity.actionType)}
                              />
                            </Stack>
                          }
                          secondary={
                            <Box>
                              {activity.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {activity.description}
                                </Typography>
                              )}
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem' }}>
                                    {getInitials(activity.actionByName)}
                                  </Avatar>
                                  <Typography variant="body2" color="text.secondary">
                                    {activity.actionByName}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(activity.actionDate)}
                                </Typography>
                              </Stack>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < stats.recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">
                    Không có hoạt động gần đây
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceHistoryStats;