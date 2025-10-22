import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Stack,
  Link,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AIChatService } from '../../services/aiChatService';

interface APIKeySettingsProps {
  open: boolean;
  onClose: (apiKeySaved: boolean) => void;
}

const APIKeySettings: React.FC<APIKeySettingsProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Load existing API key if available
      const storedKey = AIChatService.getStoredApiKey();
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, [open]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test the API key by making a simple request
      const testService = new AIChatService(apiKey.trim());
      const testResponse = await testService.sendMessage([
        {
          role: 'user',
          content: 'Hello, this is a test message',
          timestamp: new Date(),
        }
      ]);

      if (testResponse.error) {
        setError(testResponse.error);
        setIsLoading(false);
        return;
      }

      // Save the API key if test successful
      AIChatService.saveApiKey(apiKey.trim());
      onClose(true);
    } catch (error) {
      console.error('Error testing API key:', error);
      setError('Không thể kết nối với Google AI. Vui lòng kiểm tra API key.');
      setIsLoading(false);
    }
  };

  const handleUseDefault = () => {
    // Clear stored key to use default
    AIChatService.clearStoredApiKey();
    onClose(false);
  };

  const handleClose = () => {
    setApiKey('');
    setError(null);
    onClose(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <KeyIcon color="primary" />
            <Typography variant="h6">Cài đặt Google API Key</Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Stack spacing={3}>
          <Alert severity="info">
            <Typography variant="body2">
              Để sử dụng tính năng chat với AI, bạn cần có Google API Key. 
              Bạn có thể sử dụng API key mặc định hoặc nhập API key của riêng bạn.
            </Typography>
          </Alert>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Google API Key (Tùy chọn)
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập Google API Key của bạn (AIza...)"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                      size="small"
                    >
                      {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Để lấy API key miễn phí, truy cập{' '}
              <Link
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google AI Studio
              </Link>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Alert severity="success">
            <Typography variant="body2" fontWeight={500}>
              💡 Mẹo:
            </Typography>
            <Typography variant="body2">
              • Nếu bạn không có API key riêng, hệ thống sẽ sử dụng key mặc định
              <br />
              • API key được lưu trữ an toàn trên thiết bị của bạn
              <br />
              • Bạn có thể thay đổi API key bất cứ lúc nào
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Button
            variant="outlined"
            onClick={handleUseDefault}
            disabled={isLoading}
            sx={{ flex: 1 }}
          >
            Sử dụng mặc định
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            sx={{ flex: 1 }}
          >
            {isLoading ? 'Đang kiểm tra...' : 'Lưu & Sử dụng'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default APIKeySettings;