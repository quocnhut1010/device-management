import { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import DevicesIcon from '@mui/icons-material/Devices';
import BuildIcon from '@mui/icons-material/Build';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DashboardMetricCard from './DashboardMetricCard';
import { getAdminStats, getAdminCharts, getAdminTables } from '../../services/dashboardService';

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [tables, setTables] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, chartsData, tablesData] = await Promise.all([
        getAdminStats(),
        getAdminCharts(),
        getAdminTables(),
      ]);
      setStats(statsData);
      setCharts(chartsData);
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
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

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Admin
      </Typography>

      {/* Key Metrics - Row 1: 4 main metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Tổng thiết bị"
            value={stats?.totalDevices || 0}
            icon={<DevicesIcon />}
            color="#6200ee"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Đang sử dụng"
            value={stats?.devicesInUse || 0}
            icon={<DevicesIcon />}
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

      {/* Key Metrics - Row 2: 2 secondary metrics */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={6}>
          <DashboardMetricCard
            title="Lệnh sửa đang xử lý"
            value={stats?.activeRepairs || 0}
            icon={<BuildIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <DashboardMetricCard
            title="Thay thế tuần này"
            value={stats?.replacementsThisWeek || 0}
            icon={<SwapHorizIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thiết bị theo phòng ban
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={charts?.devicesByDepartment || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="departmentName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deviceCount" fill="#6200ee" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

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
      </Grid>
    </Box>
  );
};

export default AdminDashboard;

