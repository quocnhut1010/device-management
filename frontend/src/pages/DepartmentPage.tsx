// src/pages/DepartmentPage.tsx
import { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DepartmentTable from '../components/department/DepartmentTable';
import DepartmentDialog from '../components/department/DepartmentDialog';
import {
  getAllDepartments,
  getMyDepartment,   // ✅ thêm API my
} from '../services/departmentService';
import { DepartmentDto } from '../types/DepartmentDto';
import useUserRole from '../services/useUserRole'; // ✅ lấy role từ token

const DepartmentPage = () => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<DepartmentDto | null>(null);

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'deleted'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'hasDevice' | 'noDevice'>('all');

  const { user, role } = useUserRole(); // ✅ lấy role
  

  const fetchDepartments = async () => {
    try {
      let isDeletedParam: boolean | undefined;
      if (filterStatus === 'active') isDeletedParam = false;
      else if (filterStatus === 'deleted') isDeletedParam = true;

      let res;
      if (role === 'Admin') {
        res = await getAllDepartments(isDeletedParam);
      } else {
        res = await getMyDepartment();
      }
      setDepartments(res.data);
    } catch (error) {
      console.error('Lỗi lấy phòng ban:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [filterStatus, role]);


  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Quản lý Phòng ban</Typography>
        {role === 'Admin' && ( // ✅ chỉ Admin mới thêm
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Thêm phòng ban
          </Button>
        )}
      </Box>

      {/* Bộ lọc */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Trạng thái phòng ban</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái phòng ban"
            onChange={(e) =>
              setFilterStatus(e.target.value as 'all' | 'active' | 'deleted')
            }
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="active">Đang hoạt động</MenuItem>
            <MenuItem value="deleted">Đã xoá</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Thiết bị</InputLabel>
          <Select
            value={deviceFilter}
            label="Thiết bị"
            onChange={(e) =>
              setDeviceFilter(e.target.value as 'all' | 'hasDevice' | 'noDevice')
            }
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="hasDevice">Có thiết bị</MenuItem>
            <MenuItem value="noDevice">Chưa có thiết bị</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Tìm tên hoặc mã phòng ban..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          sx={{ width: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DepartmentTable
        data={departments.filter((d) => {
          const matchKeyword =
            d.departmentName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (d.departmentCode?.toLowerCase().includes(searchKeyword.toLowerCase()) || false);

          const matchDevice =
            deviceFilter === 'all'
              ? true
              : deviceFilter === 'hasDevice'
              ? d.deviceCount > 0
              : d.deviceCount === 0;

          return matchKeyword && matchDevice;
        })}
        refresh={fetchDepartments}
        onEdit={(item) => {
          setSelected(item);
          setOpenDialog(true);
        }}
        role={role || ''} // ✅ truyền role xuống bảng, xử lý null case
        position={user?.position || ''} // ✅ truyền position xuống bảng
      />

      {role === 'Admin' && (
        <DepartmentDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setSelected(null);
          }}
          selected={selected}
          refresh={fetchDepartments}
        />
      )}
    </Box>
  );

};

export default DepartmentPage;
