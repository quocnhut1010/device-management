import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as UserIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { aiChatService, ChatMessage, AIChatService } from '../../services/aiChatService';
import APIKeySettings from './APIKeySettings';

interface AIChatDialogProps {
  open: boolean;
  onClose: () => void;
}

const AIChatDialog: React.FC<AIChatDialogProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if we have API key on mount
  useEffect(() => {
    if (open) {
      const storedKey = AIChatService.getStoredApiKey();
      if (!storedKey) {
        setShowSettings(true);
      }
    }
  }, [open]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiChatService.sendMessage([...messages, userMessage]);
      
      if (response.error) {
        setError(response.error);
      } else {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleCloseDialog = () => {
    setMessages([]);
    setError(null);
    setShowSettings(false);
    onClose();
  };

  const handleSettingsClose = (apiKeySaved: boolean) => {
    setShowSettings(false);
    if (apiKeySaved) {
      // Initialize with new API key
      const storedKey = AIChatService.getStoredApiKey();
      if (storedKey) {
        aiChatService.setApiKey(storedKey);
      }
    }
  };

  // Welcome messages for first time
  const welcomeMessages = [
    "👋 Xin chào! Tôi là trợ lý AI chuyên về quản lý thiết bị IT.",
    "🔧 Tôi có thể giúp bạn:",
    "• Tư vấn thiết bị máy tính, laptop, máy in",
    "• Hướng dẫn sử dụng hệ thống quản lý thiết bị", 
    "• Giải đáp thắc mắc kỹ thuật",
    "• Hỗ trợ quy trình báo cáo sự cố và bảo trì",
    "",
    "💬 Hãy hỏi tôi bất cứ điều gì bạn muốn biết!"
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <AIIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Trợ lý AI - Quản lý thiết bị</Typography>
                <Typography variant="caption" color="text.secondary">
                  Powered by Google Gemini
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Làm mới cuộc trò chuyện">
                <IconButton onClick={handleClearChat} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cài đặt API Key">
                <IconButton onClick={() => setShowSettings(true)} size="small">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'grey.50', 
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                  mb: 2 
                }}
              >
                <Stack spacing={1}>
                  {welcomeMessages.map((msg, index) => (
                    <Typography 
                      key={index} 
                      variant={msg === '' ? 'body2' : index === 0 ? 'subtitle1' : 'body2'}
                      sx={{ 
                        fontWeight: index === 0 ? 600 : 'normal',
                        color: index === 0 ? 'primary.main' : 'text.primary',
                        lineHeight: msg === '' ? 0.5 : 1.6
                      }}
                    >
                      {msg}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            )}

            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    maxWidth: '80%',
                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32,
                      mx: 1
                    }}
                  >
                    {message.role === 'user' ? <UserIcon /> : <AIIcon />}
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                      color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {message.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        opacity: 0.7,
                        textAlign: message.role === 'user' ? 'right' : 'left'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mx: 1 }}>
                    <AIIcon />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Đang suy nghĩ...</Typography>
                    </Stack>
                  </Paper>
                </Box>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <div ref={messagesEndRef} />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Nhập tin nhắn của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SendIcon />
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <APIKeySettings
        open={showSettings}
        onClose={handleSettingsClose}
      />
    </>
  );
};

export default AIChatDialog;