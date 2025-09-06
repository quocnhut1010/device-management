import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SummaryCard from '../components/dashboard/SummaryCard';
import { getUserFromToken } from '../services/auth';
import { getAllDevices } from '../services/deviceService';
import { getAllDepartments, getAllDepartmentsData } from '../services/departmentService';
import { getAllUsersData } from '../services/userService';
import { getAllAssignments } from '../services/assignmentService';
const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [deviceCount, setDeviceCount] = useState(0);
    const [departmentCount, setDepartmentCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [activeAssignmentCount, setActiveAssignmentCount] = useState(0);
    const [role, setRole] = useState(null);
    const [email, setEmail] = useState('');
    useEffect(() => {
        const user = getUserFromToken();
        if (user) {
            setEmail(user.email);
            setRole(user.role);
        }
        const fetchData = async () => {
            try {
                const res = await getAllDepartments(); // ✅ Đúng: dùng từ departmentService
                console.log('Dashboard - Tổng phòng ban:', res.data.length);
                setDepartmentCount(res.data.length);
            }
            catch (error) {
                console.error('Lỗi khi load dashboard:', error); // lỗi đang ở đây
            }
        };
        const fetchUserCount = async () => {
            try {
                const users = await getAllUsersData(true); // users là UserDto[]
                console.log('Dashboard - Tổng user:', users.length);
                setUserCount(users.length);
            }
            catch (error) {
                console.error('Lỗi khi load tổng user:', error);
            }
        };
        fetchData();
        fetchUserCount();
        setLoading(true);
        Promise.all([
            getAllDevices(),
            getAllDepartmentsData(true), // 👈 lấy cả phòng ban đã xoá
            getAllUsersData(true),
            getAllAssignments(),
        ])
            .then(([devices, departments, users, assignments]) => {
            setDeviceCount(devices.length);
            setDepartmentCount(departments.length);
            setUserCount(users.length);
            const activeAssignments = assignments.filter((a) => a.status === 'Active' || a.status === 'Đang sử dụng');
            setActiveAssignmentCount(activeAssignments.length);
        })
            .catch((err) => {
            console.error('Lỗi khi load dashboard:', err);
        })
            .finally(() => setLoading(false));
    }, []);
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", fontWeight: "bold", gutterBottom: true, children: "B\u1EA3ng \u0111i\u1EC1u khi\u1EC3n" }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', my: 5 }, children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: {
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 3,
                            mb: 4,
                        }, children: [_jsx(SummaryCard, { title: "T\u1ED5ng thi\u1EBFt b\u1ECB", count: deviceCount, icon: _jsx(DevicesIcon, {}), color: "primary" }), _jsx(SummaryCard, { title: "Ph\u00F2ng ban", count: departmentCount, icon: _jsx(ApartmentIcon, {}), color: "info" }), _jsx(SummaryCard, { title: "Ng\u01B0\u1EDDi d\u00F9ng", count: userCount, icon: _jsx(PeopleIcon, {}), color: "success" }), _jsx(SummaryCard, { title: "Thi\u1EBFt b\u1ECB \u0111ang s\u1EED d\u1EE5ng", count: activeAssignmentCount, icon: _jsx(AssignmentIcon, {}), color: "warning" })] }), _jsxs(Box, { mt: 4, children: [_jsx(Typography, { variant: "h6", children: "Th\u00F4ng tin t\u00E0i kho\u1EA3n" }), _jsxs(Typography, { children: ["Email: ", email] }), _jsxs(Typography, { children: ["Vai tr\u00F2: ", role === 'Admin' ? 'Quản trị viên (Admin)' : 'Người dùng (User)'] })] })] }))] }));
};
export default Dashboard;
