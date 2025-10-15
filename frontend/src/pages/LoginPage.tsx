// src/pages/LoginPage.tsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Stack,
  useTheme,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

import CustomInput from '../components/ui/CustomInput';
import CustomButton from '../components/ui/CustomButton';
import { login as authLogin } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await authLogin(email, password);
      contextLogin(token);
      navigate('/dashboard');
    } catch {
      setError('Đăng nhập thất bại. Kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          borderRadius: 4,
        }}
      >
        <Stack spacing={2} alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight="bold">
            Đăng nhập
          </Typography>
        </Stack>

        <Box component="form" noValidate autoComplete="off">
          <CustomInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />

          <CustomInput
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Ghi nhớ đăng nhập"
            sx={{ mt: 1 }}
          />

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}

          <CustomButton
            text={loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
            onClick={handleLogin}
            sx={{ mt: 3 }}
            disabled={loading}
            endIcon={loading && <CircularProgress color="inherit" size={20} />}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
