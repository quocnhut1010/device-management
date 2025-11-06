import { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import DevicesIcon from '@mui/icons-material/Devices';
import BuildIcon from '@mui/icons-material/Build';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardMetricCard from './DashboardMetricCard';
import { getManagerStats, getManagerCharts } from '../../services/dashboardService';
import { getUserFromToken } from '../../services/auth';

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

const ManagerDashboard = () => {
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
      
      // Get departmentId from token
      const user = getUserFromToken();
      if (!user || !user.nameid) {
        setError('Không thể lấy thông tin người dùng');
        return;
      }

      // For now, we'll need to get the user's department from their profile
      // This is a simplified version - in production, you might want to fetch user details
      // to get the departmentId, or include it in the JWT token
      const departmentId = user.nameid; // Placeholder - adjust based on your user structure

      const [statsData, chartsData] = await Promise.all([
        getManagerStats(departmentId),
        getManagerCharts(departmentId),
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (error: any) {
      console.error('Error loading manager dashboard:', error);
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
        Dashboard Trưởng phòng
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Thiết bị phòng ban"
            value={stats?.departmentDevices || 0}
            icon={<DevicesIcon />}
            color="#6200ee"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Đang sử dụng"
            value={stats?.devicesInUse || 0}
            icon={<CheckCircleIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Đang sửa"
            value={stats?.devicesRepairing || 0}
            icon={<BuildIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Sự cố mở"
            value={stats?.openIncidents || 0}
            icon={<ReportProblemIcon />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thiết bị theo trạng thái
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={charts?.devicesByStatus || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {(charts?.devicesByStatus || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thống kê phòng ban
              </Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Tổng thiết bị: <strong>{stats?.departmentDevices || 0}</strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Tỷ lệ sử dụng:{' '}
                  <strong>
                    {stats?.departmentDevices > 0
                      ? `${Math.round((stats.devicesInUse / stats.departmentDevices) * 100)}%`
                      : '0%'}
                  </strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Đang sửa chữa: <strong>{stats?.devicesRepairing || 0}</strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Sự cố đang mở: <strong>{stats?.openIncidents || 0}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;

