import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Button, IconButton, Fab, Tooltip } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SummaryCard from '../components/dashboard/SummaryCard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import TechnicianDashboard from '../components/dashboard/TechnicianDashboard';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import { getUserFromToken } from '../services/auth';
import { AIChatDialog } from '../components/ai';
import { getAllDevices, getMyDevices, getManagedDevices } from '../services/deviceService';
import { getAllDepartmentsData } from '../services/departmentService';
import { getAllUsersData } from '../services/userService';
import { getAllAssignments } from '../services/assignmentService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [deviceCount, setDeviceCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [activeDeviceCount, setActiveDeviceCount] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [position, setPosition] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setHasToken(false);
      setLoading(false);
      return;
    }
    setHasToken(true);
    
    const user = getUserFromToken();
    if (user) {
      setEmail(user.email);
      setRole(user.role);
      setPosition(user.position || null);
    }

    const fetchDashboardData = async () => {
      console.log('=== Bắt đầu fetch dashboard data ===');
      
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Không có token, không thể gọi API');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log('1. Gọi API thiết bị theo role/position...');
        let devices: any[] = [];
        
        // Gọi API phù hợp theo role và position
        const user = getUserFromToken();
        if (user?.role === 'Admin') {
          console.log('Admin - Gọi getAllDevices');
          devices = await getAllDevices();
        } else if (user?.position === 'Trưởng phòng') {
          console.log('Trưởng phòng - Gọi getManagedDevices');
          devices = await getManagedDevices();
        } else {
          console.log('Nhân viên - Gọi getMyDevices');
          devices = await getMyDevices();
        }
        console.log('1. devices response:', devices);

        // Chỉ Admin mới có thể xem tất cả departments và users
        let departments: any[] = [];
        let users: any[] = [];
        
        if (user?.role === 'Admin') {
          console.log('2. Admin - Gọi API getAllDepartmentsData...');
          departments = await getAllDepartmentsData(false);
          console.log('2. getAllDepartmentsData response:', departments);

          console.log('3. Admin - Gọi API getAllUsersData...');
          users = await getAllUsersData(false);
          console.log('3. getAllUsersData response:', users);
        } else {
          console.log('2-3. User/Trưởng phòng - Bỏ qua departments và users statistics');
        }

        console.log('4. Gọi API getAllAssignments... (bỏ qua vì chưa có backend)');
        // const assignments = await getAllAssignments();
        const assignments = []; // Mock empty array
        console.log('4. getAllAssignments response:', assignments);

        // Tổng thiết bị
        console.log('Dashboard - Tổng thiết bị:', devices.length);
        setDeviceCount(devices.length);

        // Thiết bị đang sử dụng
        console.log('Tất cả thiết bị:', devices);
        const devicesInUse = devices.filter(
          (device: any) => {
            console.log(`Device ${device.deviceCode} status:`, device.status);
            return device.status === 'Đang sử dụng' ||
                   device.status === 'InUse' ||
                   device.status === 'In Use';
          }
        );
        console.log('Dashboard - Thiết bị đang sử dụng:', devicesInUse.length, devicesInUse);
        setActiveDeviceCount(devicesInUse.length);

        // Tổng phòng ban
        console.log('Dashboard - Tổng phòng ban:', departments.length);
        setDepartmentCount(departments.length);

        // Tổng người dùng
        console.log('Dashboard - Tổng người dùng:', users.length);
        setUserCount(users.length);

      } catch (error: any) {
        console.error('=== Lỗi khi load dashboard ===');
        console.error('Chi tiết lỗi:', error);
        
        // Xử lý lỗi 401 (Unauthorized)
        if (error?.response?.status === 401) {
          console.error('Token hết hạn hoặc không hợp lệ, chuyển hướng về trang login');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        
        // Set giá trị mặc định khi có lỗi
        setDeviceCount(0);
        setActiveDeviceCount(0);
        setDepartmentCount(0);
        setUserCount(0);
      } finally {
        console.log('=== Kết thúc fetch dashboard data ===');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Render appropriate dashboard based on role and position
  const renderDashboard = () => {
    if (!hasToken) {
      return (
        <Box sx={{ textAlign: 'center', my: 5 }}>
          <Typography variant="h6" color="error">
            Bạn cần đăng nhập để xem dữ liệu dashboard
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
            Token trong localStorage: {localStorage.getItem('token') ? 'Có' : 'Không có'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/login'}
            sx={{ mt: 2 }}
          >
            Đăng nhập
          </Button>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      );
    }

    // Route to appropriate dashboard
    if (role === 'Admin') {
      return <AdminDashboard />;
    }
    
    if (position === 'Trưởng phòng') {
      return <ManagerDashboard />;
    }
    
    if (position === 'Kỹ thuật viên') {
      return <TechnicianDashboard />;
    }
    
    // Default: Employee dashboard
    return <EmployeeDashboard />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Hi, Welcome back 👋
        </Typography>
        <IconButton 
          onClick={() => window.location.reload()} 
          disabled={loading}
          sx={{ ml: 2 }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Render appropriate dashboard */}
      {renderDashboard()}

      {/* AI Chat FAB */}
      {hasToken && (
        <Tooltip title="Chat với AI" placement="left">
          <Fab
            color="primary"
            aria-label="chat with ai"
            onClick={() => setShowAIChat(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <SmartToyIcon />
          </Fab>
        </Tooltip>
      )}

      {/* AI Chat Dialog */}
      <AIChatDialog
        open={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
    </Box>
  );
};

export default Dashboard;
