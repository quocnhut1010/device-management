import { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import DevicesIcon from '@mui/icons-material/Devices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DashboardMetricCard from './DashboardMetricCard';
import { getEmployeeStats, getEmployeeCharts } from '../../services/dashboardService';

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];

const EmployeeDashboard = () => {
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
        getEmployeeStats(),
        getEmployeeCharts(),
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (error: any) {
      console.error('Error loading employee dashboard:', error);
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
        Dashboard của tôi
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Thiết bị của tôi"
            value={stats?.myDevices || 0}
            icon={<DevicesIcon />}
            color="#6200ee"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Đang hoạt động"
            value={stats?.devicesActive || 0}
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
            title="Sự cố của tôi"
            value={stats?.myIncidentsOpen || 0}
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
                Trạng thái thiết bị
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
                Tổng quan
              </Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Tổng thiết bị được giao: <strong>{stats?.myDevices || 0}</strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Đang hoạt động: <strong>{stats?.devicesActive || 0}</strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Đang sửa chữa: <strong>{stats?.devicesRepairing || 0}</strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Sự cố đang mở: <strong>{stats?.myIncidentsOpen || 0}</strong>
                </Typography>
                {stats?.myIncidentsPending !== undefined && (
                  <Typography variant="body1" gutterBottom>
                    Sự cố chờ xử lý: <strong>{stats.myIncidentsPending}</strong>
                  </Typography>
                )}
                {stats?.myDevices > 0 && (
                  <Typography variant="body1" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
                    Tỷ lệ hoạt động:{' '}
                    <strong>
                      {Math.round((stats.devicesActive / stats.myDevices) * 100)}%
                    </strong>
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional info card */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin hữu ích
              </Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" gutterBottom>
                  • Bạn có thể xem chi tiết thiết bị của mình tại trang <strong>Thiết bị</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  • Để báo cáo sự cố, vui lòng truy cập trang <strong>Sự cố</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  • Kiểm tra lịch sử sửa chữa tại trang <strong>Sửa chữa</strong>
                </Typography>
                {stats?.myIncidentsOpen > 0 && (
                  <Typography variant="body2" gutterBottom sx={{ color: 'warning.main', mt: 1 }}>
                    ⚠️ Bạn có {stats.myIncidentsOpen} sự cố đang chờ xử lý
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;

