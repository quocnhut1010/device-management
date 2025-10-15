import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { IncidentReport } from '../services/incidentService';
import { getUserFromToken } from '../services/auth';
import CreateIncidentForm from '../components/incident/CreateIncidentForm';
import IncidentReportList from '../components/incident/IncidentReportList';
import IncidentReportDetails from '../components/incident/IncidentReportDetails';

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

export default function IncidentReportPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const currentUser = getUserFromToken();
  const isEmployee = currentUser?.position === 'Nhân viên';
  const isManager = currentUser?.position === 'Trưởng phòng';
  const isAdmin = currentUser?.role === 'Admin';
  const isTechnician = currentUser?.position === 'Kỹ thuật viên';
  
  // Trưởng phòng và Nhân viên đều có thể tạo báo cáo sự cố
  const canCreateReport = isEmployee || isManager;

  const handleCreateSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewDetails = (report: IncidentReport) => {
    setSelectedReport(report);
    setDetailsOpen(true);
  };

  const canViewAllReports = isAdmin || isTechnician;

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Quản lý báo cáo sự cố
          </Typography>
          
          {/* Nhân viên và Trưởng phòng có thể tạo báo cáo */}
          {canCreateReport && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateFormOpen(true)}
            >
              Tạo báo cáo sự cố
            </Button>
          )}
        </Box>

        <Paper sx={{ width: '100%' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              {/* Tab báo cáo của mình - tất cả user đều có */}
              <Tab label="Báo cáo của tôi" />
              
              {/* Tab tất cả báo cáo - chỉ admin và kỹ thuật viên */}
              {canViewAllReports && (
                <Tab label="Tất cả báo cáo" />
              )}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={activeTab} index={0}>
            <IncidentReportList
              showMyReports={true}
              onViewDetails={handleViewDetails}
              refreshTrigger={refreshTrigger}
            />
          </TabPanel>

          {canViewAllReports && (
            <TabPanel value={activeTab} index={1}>
              <IncidentReportList
                showMyReports={false}
                onViewDetails={handleViewDetails}
                refreshTrigger={refreshTrigger}
              />
            </TabPanel>
          )}
        </Paper>
      </Box>

      {/* Create Form Dialog */}
      <CreateIncidentForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Details Dialog */}
      <IncidentReportDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        report={selectedReport}
        onReplacementSuccess={handleCreateSuccess}
      />
    </Container>
  );
}
