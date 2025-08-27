// src/pages/DevicePage.tsx
import { Box, Typography } from '@mui/material';

const DevicePage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Danh sách thiết bị
      </Typography>

      {/* Placeholder hoặc bảng dữ liệu */}
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
          📦 Đây là nơi sẽ hiển thị danh sách thiết bị (table, filter, v.v.)
        </Typography>
      </Box>
    </Box>
  );
};

export default DevicePage;
