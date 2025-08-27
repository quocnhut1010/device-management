import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SummaryCard from '../components/dashboard/SummaryCard';
import { getUserFromToken } from '../services/auth';
import { getAllDevices } from '../services/deviceService';
import { getAllDepartments } from '../services/departmentService';
import { getAllUsers } from '../services/userService';
import { getAllAssignments } from '../services/assignmentService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [deviceCount, setDeviceCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [activeAssignmentCount, setActiveAssignmentCount] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setEmail(user.email);
      setRole(user.role);
    }

    setLoading(true);
    Promise.all([
      getAllDevices(),
      getAllDepartments(),
      getAllUsers(),
      getAllAssignments()
    ])
      .then(([devices, departments, users, assignments]) => {
        setDeviceCount(devices?.length || 0);
        setDepartmentCount(departments?.length || 0);
        setUserCount(users?.length || 0);

        // Thiết bị đang sử dụng là các assignment đang active
        const activeAssignments = assignments?.filter(
          (a: any) =>
            a.status === 'Active' || a.status === 'Đang sử dụng' // hoặc điều kiện tùy backend
        );
        setActiveAssignmentCount(activeAssignments?.length || 0);
      })
      .catch((err) => {
        console.error('Lỗi khi load dashboard:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Bảng điều khiển
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            <SummaryCard
              title="Tổng thiết bị"
              count={deviceCount}
              icon={<DevicesIcon />}
              color="primary"
            />
            <SummaryCard
              title="Phòng ban"
              count={departmentCount}
              icon={<ApartmentIcon />}
              color="info"
            />
            <SummaryCard
              title="Người dùng"
              count={userCount}
              icon={<PeopleIcon />}
              color="success"
            />
            <SummaryCard
              title="Thiết bị đang sử dụng"
              count={activeAssignmentCount}
              icon={<AssignmentIcon />}
              color="warning"
            />
          </Box>

          {/* User Info */}
          <Box mt={4}>
            <Typography variant="h6">Thông tin tài khoản</Typography>
            <Typography>Email: {email}</Typography>
            <Typography>
              Vai trò: {role === 'Admin' ? 'Quản trị viên (Admin)' : 'Người dùng (User)'}
            </Typography>
          </Box>
          
        </>
      )}
    </Box>
  );
};

export default Dashboard;
