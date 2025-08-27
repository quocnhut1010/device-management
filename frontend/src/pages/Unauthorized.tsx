// src/pages/Unauthorized.tsx
import { Box, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: '#f9f9f9',
        px: 2,
      }}
    >
      <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      <Typography variant="h4" color="error" gutterBottom>
        Không thể truy cập
      </Typography>
      <Typography variant="body1" mb={3}>
        Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/login')}>
        QUAY LẠI TRANG ĐĂNG NHẬP
      </Button>
    </Box>
  );
};

export default Unauthorized;
