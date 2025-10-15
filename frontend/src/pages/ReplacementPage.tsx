import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { DeviceDto } from '../types/device';
import { getUserFromToken } from '../services/auth';
import ReplacementHistoryList from '../components/replacement/ReplacementHistoryList';
import ReplacementTestDialog from '../components/replacement/ReplacementTestDialog';
import  useNotification  from '../hooks/useNotification';
import AnimatedPage from '../components/AnimatedPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ReplacementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Dialog states
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const currentUser = getUserFromToken();
  const isAdmin = currentUser?.role === 'Admin';
  const  showNotification  = useNotification();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateReplacement = () => {
    // For now, we'll need device selection. In a full implementation,
    // this might come from device list page or search
    setCreateReplacementDialogOpen(true);
  };

  const handleReplacementSuccess = () => {
    handleRefresh();
    showNotification('Thay thế thiết bị thành công!', 'success');
  };

  const openDeviceSelector = () => {
    setTestDialogOpen(true);
  };

  return (
    <AnimatedPage>
      <Container maxWidth="xl">
        <Box py={3}>
          {/* Header */}
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Quản lý thay thế thiết bị
              </Typography>
              <Typography variant="body1" color="textSecondary" mt={1}>
                {isAdmin 
                  ? 'Quản lý toàn bộ quy trình thay thế thiết bị trong hệ thống'
                  : 'Xem lịch sử thay thế thiết bị của bạn'
                }
              </Typography>
            </Box>

            {/* Create Replacement Button - Admin Only */}
            {/* {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openDeviceSelector}
                sx={{ minWidth: 200 }}
              >
                Thay thế thiết bị
              </Button>
            )} */}
          </Box>

          <Paper sx={{ width: '100%' }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab 
                  label="Lịch sử thay thế" 
                  icon={<SwapIcon />} 
                  iconPosition="start"
                />
                {isAdmin && (
                  <Tab 
                    label="Thống kê thay thế" 
                    disabled 
                    sx={{ opacity: 0.5 }}
                  />
                )}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <TabPanel value={activeTab} index={0}>
              <ReplacementHistoryList refreshTrigger={refreshTrigger} />
            </TabPanel>

            {/* Future: Statistics Tab */}
            {isAdmin && (
              <TabPanel value={activeTab} index={1}>
                <Box p={4} textAlign="center">
                  <SwapIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Thống kê thay thế
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tính năng này sẽ được phát triển trong tương lai
                  </Typography>
                </Box>
              </TabPanel>
            )}
          </Paper>

          {/* Quick Actions Info for Non-Admin Users */}
          {!isAdmin && (
            <Box mt={3}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Lưu ý:</strong> Chỉ có quản trị viên mới có thể thực hiện thay thế thiết bị. 
                  Nếu bạn cần thay thế thiết bị, vui lòng liên hệ với bộ phận IT hoặc tạo báo cáo sự cố 
                  để được hỗ trợ.
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Integration Notes */}
          <Box mt={3}>
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Chú ý tích hợp:</strong> Trong phiên bản hoàn chỉnh, nút "Thay thế thiết bị" 
                sẽ được tích hợp trực tiếp vào:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <li>Trang danh sách thiết bị - để thay thế từ danh sách</li>
                <li>Chi tiết báo cáo sự cố - để thay thế từ sự cố</li>
                <li>Chi tiết thiết bị - để thay thế trực tiếp</li>
              </Box>
            </Alert>
          </Box>
        </Box>

        {/* Test Replacement Dialog */}
        <ReplacementTestDialog
          open={testDialogOpen}
          onClose={() => setTestDialogOpen(false)}
        />
      </Container>
    </AnimatedPage>
  );
}

function setCreateReplacementDialogOpen(arg0: boolean) {
  throw new Error('Function not implemented.');
}
