import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Repair, repairService } from '../services/repairService';
import { getUserFromToken } from '../services/auth';
import RepairList from '../components/repair/RepairList';
import CompleteRepairForm from '../components/repair/CompleteRepairForm';
import { RejectRepairDialog, NotNeededDialog } from '../components/repair/RepairActionDialogs';
import RepairDetailsDialog from '../components/repair/RepairDetailsDialog';

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

export default function RepairManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Dialogs state
  const [completeFormOpen, setCompleteFormOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [notNeededDialogOpen, setNotNeededDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRepairId, setSelectedRepairId] = useState<string>('');
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const currentUser = getUserFromToken();
  const isAdmin = currentUser?.role === 'Admin';
  const isTechnician = currentUser?.position === 'Kỹ thuật viên';

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewDetails = (repair: Repair) => {
    setSelectedRepair(repair);
    setViewDetailsOpen(true);
  };

  const handleAcceptRepair = async (repairId: string) => {
    try {
      await repairService.acceptRepair(repairId);
      showSnackbar('Đã chấp nhận lệnh sửa chữa', 'success');
      handleRefresh();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Không thể chấp nhận lệnh sửa chữa', 'error');
    }
  };

  const handleCompleteRepair = (repair: Repair) => {
    setSelectedRepair(repair);
    setCompleteFormOpen(true);
  };

  const handleConfirmCompletion = (repairId: string) => {
    setSelectedRepairId(repairId);
    setConfirmDialogOpen(true);
  };

  const confirmCompletionAction = async () => {
    try {
      await repairService.confirmCompletion(selectedRepairId);
      showSnackbar('Đã xác nhận hoàn tất sửa chữa', 'success');
      setConfirmDialogOpen(false);
      handleRefresh();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Không thể xác nhận hoàn tất', 'error');
    }
  };

  const handleRejectRepair = (repairId: string) => {
    setSelectedRepairId(repairId);
    setRejectDialogOpen(true);
  };

  const handleMarkNotNeeded = (repairId: string) => {
    setSelectedRepairId(repairId);
    setNotNeededDialogOpen(true);
  };

  const canViewAllRepairs = isAdmin;

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Quản lý sửa chữa thiết bị
          </Typography>
          <Typography variant="body1" color="textSecondary" mt={1}>
            {isTechnician && 'Quản lý các lệnh sửa chữa được giao cho bạn'}
            {isAdmin && 'Xem tổng quan tất cả các lệnh sửa chữa trong hệ thống'}
          </Typography>
        </Box>

        <Paper sx={{ width: '100%' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              {/* Tab lệnh sửa của mình - cho kỹ thuật viên */}
              {isTechnician && (
                <Tab label="Lệnh sửa của tôi" />
              )}
              
              {/* Tab tất cả lệnh sửa - cho admin */}
              {canViewAllRepairs && (
                <Tab label={isTechnician ? "Tất cả lệnh sửa" : "Tất cả lệnh sửa"} />
              )}
            </Tabs>
          </Box>

          {/* Tab Content */}
          {isTechnician && (
            <TabPanel value={activeTab} index={0}>
              <RepairList
                showMyRepairs={true}
                onViewDetails={handleViewDetails}
                onAcceptRepair={handleAcceptRepair}
                onCompleteRepair={handleCompleteRepair}
                onConfirmCompletion={handleConfirmCompletion}
                onRejectRepair={handleRejectRepair}
                onMarkNotNeeded={handleMarkNotNeeded}
                refreshTrigger={refreshTrigger}
              />
            </TabPanel>
          )}

          {canViewAllRepairs && (
            <TabPanel value={activeTab} index={isTechnician ? 1 : 0}>
              <RepairList
                showMyRepairs={false}
                onViewDetails={handleViewDetails}
                onAcceptRepair={handleAcceptRepair}
                onCompleteRepair={handleCompleteRepair}
                onConfirmCompletion={handleConfirmCompletion}
                onRejectRepair={handleRejectRepair}
                onMarkNotNeeded={handleMarkNotNeeded}
                refreshTrigger={refreshTrigger}
              />
            </TabPanel>
          )}
        </Paper>
      </Box>

      {/* Complete Repair Form */}
      <CompleteRepairForm
        open={completeFormOpen}
        onClose={() => setCompleteFormOpen(false)}
        onSuccess={() => {
          showSnackbar('Đã gửi yêu cầu hoàn thành sửa chữa', 'success');
          handleRefresh();
        }}
        repair={selectedRepair}
      />

      {/* Reject Repair Dialog */}
      <RejectRepairDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onSuccess={() => {
          showSnackbar('Đã từ chối lệnh sửa chữa', 'success');
          handleRefresh();
        }}
        repairId={selectedRepairId}
      />

      {/* Not Needed Dialog */}
      <NotNeededDialog
        open={notNeededDialogOpen}
        onClose={() => setNotNeededDialogOpen(false)}
        onSuccess={() => {
          showSnackbar('Đã đánh dấu không cần sửa chữa', 'success');
          handleRefresh();
        }}
        repairId={selectedRepairId}
      />

      {/* Confirm Completion Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Xác nhận hoàn tất sửa chữa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xác nhận rằng việc sửa chữa đã hoàn tất? 
            Thiết bị sẽ được đánh dấu là sẵn sàng sử dụng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={confirmCompletionAction} 
            variant="contained" 
            color="success"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
      <RepairDetailsDialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        repair={selectedRepair}
      />


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}