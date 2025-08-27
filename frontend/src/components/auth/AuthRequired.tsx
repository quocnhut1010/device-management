// src/components/auth/AuthRequired.tsx
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AuthRequired = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        ❌ Không thể truy cập
      </Typography>
      <Typography variant="body1" mb={3}>
        Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/login')}
      >
        Quay lại trang đăng nhập
      </Button>
    </Box>
  );
};

export default AuthRequired;
