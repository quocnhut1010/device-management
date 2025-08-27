// src/pages/UserPage.tsx
import { Box, Typography } from '@mui/material';

const UserPage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý người dùng
      </Typography>

      {/* Placeholder hoặc bảng người dùng */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          border: '1px dashed #ccc',
          borderRadius: 2,
          bgcolor: 'grey.50',
          height: 300,
        }}
      >
        <Typography color="text.secondary">
          👤 Đây là nơi hiển thị danh sách người dùng (table, role, CRUD...)
        </Typography>
      </Box>
    </Box>
  );
};

export default UserPage;
