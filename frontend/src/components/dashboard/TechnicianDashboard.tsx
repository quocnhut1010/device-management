import { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardMetricCard from './DashboardMetricCard';
import { getTechnicianStats, getTechnicianCharts } from '../../services/dashboardService';

const TechnicianDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, chartsData] = await Promise.all([
        getTechnicianStats(),
        getTechnicianCharts(),
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (error: any) {
      console.error('Error loading technician dashboard:', error);
      setError(error?.response?.data?.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Kỹ thuật viên
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Chờ xử lý"
            value={stats?.repairsPending || 0}
            icon={<PendingActionsIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Đang xử lý"
            value={stats?.repairsInProgress || 0}
            icon={<BuildCircleIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Chờ phê duyệt"
            value={stats?.repairsAwaitingApproval || 0}
            icon={<HourglassTopIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Hoàn thành tuần này"
            value={stats?.repairsCompletedThisWeek || 0}
            icon={<CheckCircleIcon />}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thống kê công việc
              </Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Tổng công việc hiện tại:{' '}
                  <strong>
                    {(stats?.repairsPending || 0) +
                      (stats?.repairsInProgress || 0) +
                      (stats?.repairsAwaitingApproval || 0)}
                  </strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Đã hoàn thành tuần này: <strong>{stats?.repairsCompletedThisWeek || 0}</strong>
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                  Ưu tiên: Xử lý <strong>{stats?.repairsPending || 0}</strong> lệnh đang chờ
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tình trạng sửa chữa
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={[
                    { name: 'Chờ xử lý', count: stats?.repairsPending || 0, fill: '#ff9800' },
                    { name: 'Đang xử lý', count: stats?.repairsInProgress || 0, fill: '#2196f3' },
                    { name: 'Chờ duyệt', count: stats?.repairsAwaitingApproval || 0, fill: '#9c27b0' },
                    { name: 'Hoàn thành', count: stats?.repairsCompletedThisWeek || 0, fill: '#4caf50' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Repair Trend Chart if available */}
        {charts?.repairsTrend && charts.repairsTrend.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Xu hướng sửa chữa
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={charts.repairsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#2196f3" name="Số lượng" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TechnicianDashboard;

