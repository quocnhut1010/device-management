// src/pages/DepartmentPage.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, Button, FormControlLabel, Switch } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DepartmentTable from '../components/department/DepartmentTable';
import DepartmentDialog from '../components/department/DepartmentDialog';
import { getAllDepartments, type DepartmentDto } from '../services/departmentService';


const DepartmentPage = () => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<DepartmentDto | null>(null);

const fetchDepartments = async () => {
  try {
   const res = await getAllDepartments();
  const filtered = showDeleted
    ? res.data
    : res.data.filter((d) => !d.isDeleted); 
  setDepartments(filtered); 
  } catch (error) {
    console.error('Lỗi lấy phòng ban:', error);
  }
};

const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [showDeleted]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Quản lý Phòng ban</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Thêm phòng ban
        </Button>
      </Box>
        <FormControlLabel
        control={
            <Switch
            checked={showDeleted}
            onChange={() => setShowDeleted((prev) => !prev)}
            />
        }
        label="Bao gồm phòng ban đã xoá"
        />
      <DepartmentTable
        data={departments}
        refresh={fetchDepartments}
        onEdit={(item) => {
          setSelected(item);
          setOpenDialog(true);
        }}
      />

      <DepartmentDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelected(null);
        }}
        selected={selected}
        refresh={fetchDepartments}
      />
    </Box>
  );
  
};


export default DepartmentPage;
