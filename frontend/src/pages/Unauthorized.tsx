// src/pages/Unauthorized.tsx
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

const Unauthorized = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

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

      {loggedIn ? (
        <>
          <Typography variant="body1" mb={3}>
            Bạn không có quyền truy cập trang này.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)} // quay lại trang trước
          >
            Quay lại
          </Button>
        </>
      ) : (
        <>
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
        </>
      )}
    </Box>
  );
};

export default Unauthorized;
