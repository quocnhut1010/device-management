import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Pagination,
  Tooltip
} from '@mui/material';
import {
  History as HistoryIcon,
  Timeline as TimelineIcon,
  Assessment as StatsIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { useParams, useSearchParams } from 'react-router-dom';
import DeviceHistoryService from '../services/deviceHistoryService';
import {
  DeviceHistoryData,
  DeviceHistoryFilter,
  DeviceHistoryTimelineData
} from '../types/deviceHistory';
import DeviceHistoryItem from '../components/deviceHistory/DeviceHistoryItem';
import DeviceHistoryTimeline from '../components/deviceHistory/DeviceHistoryTimeline';
import DeviceHistoryStatsComponent from '../components/deviceHistory/DeviceHistoryStats';
import { DeviceHistoryStats } from '../types/deviceHistory';
import DeviceHistoryFilters from '../components/deviceHistory/DeviceHistoryFilters';
import AnimatedPage from '../components/AnimatedPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const DeviceHistoryPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [histories, setHistories] = useState<DeviceHistoryData[]>([]);
  const [timelineData, setTimelineData] = useState<DeviceHistoryTimelineData[]>([]);
  const [stats, setStats] = useState<DeviceHistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<DeviceHistoryData | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState<DeviceHistoryFilter>({
    deviceId: deviceId,
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || '20'),
    sortBy: searchParams.get('sortBy') || 'ActionDate',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  });

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: DeviceHistoryFilter = {
      deviceId: deviceId,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: searchParams.get('sortBy') || 'ActionDate',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      action: searchParams.get('action') || undefined,
      actionType: searchParams.get('actionType') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined
    };
    setFilters(urlFilters);
  }, [deviceId, searchParams]);

  // Update URL when filters change
  const updateUrlParams = useCallback((newFilters: DeviceHistoryFilter) => {
    const params = new URLSearchParams();
    
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());
    if (newFilters.pageSize && newFilters.pageSize !== 20) params.set('pageSize', newFilters.pageSize.toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'ActionDate') params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder && newFilters.sortOrder !== 'desc') params.set('sortOrder', newFilters.sortOrder);
    if (newFilters.action) params.set('action', newFilters.action);
    if (newFilters.actionType) params.set('actionType', newFilters.actionType);
    if (newFilters.fromDate) params.set('fromDate', newFilters.fromDate);
    if (newFilters.toDate) params.set('toDate', newFilters.toDate);

    setSearchParams(params);
  }, [setSearchParams]);

  // Load data based on current tab and filters
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      switch (currentTab) {
        case 0: // List view
          const historyData = deviceId
            ? await DeviceHistoryService.getDeviceHistory(deviceId, filters)
            : await DeviceHistoryService.getAllHistory(filters);
          setHistories(historyData);
          
          // Calculate total pages (this should ideally come from the API)
          const totalItems = historyData.length;
          setTotalPages(Math.ceil(totalItems / (filters.pageSize || 20)));
          break;

        case 1: // Timeline view
          const timeline = await DeviceHistoryService.getHistoryTimeline(filters);
          setTimelineData(timeline);
          break;

        case 2: // Stats view
          const statsData = await DeviceHistoryService.getHistoryStats(
            deviceId,
            undefined,
            filters.fromDate
          );
          setStats(statsData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [currentTab, filters, deviceId]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: DeviceHistoryFilter) => {
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  // Handle filter apply
  const handleApplyFilters = () => {
    loadData();
  };

  // Handle filter clear
  const handleClearFilters = () => {
    const clearedFilters: DeviceHistoryFilter = {
      deviceId: deviceId,
      page: 1,
      pageSize: 20,
      sortBy: 'ActionDate',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    updateUrlParams(clearedFilters);
  };

  // Handle pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  // Handle view details
  const handleViewDetails = (history: DeviceHistoryData) => {
    setSelectedHistory(history);
    setShowDetailsDialog(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadData();
  };

  return (
    <AnimatedPage>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {deviceId ? 'Lịch sử thiết bị' : 'Lịch sử hệ thống'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {deviceId 
                  ? 'Xem lịch sử hoạt động của thiết bị cụ thể'
                  : 'Xem tổng quan lịch sử hoạt động của tất cả thiết bị trong hệ thống'
                }
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => {
                  // TODO: Implement export functionality
                  console.log('Export data');
                }}
              >
                Xuất dữ liệu
              </Button>
            </Stack>
          </Stack>

          {/* Filters */}
          <DeviceHistoryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                icon={<HistoryIcon />}
                iconPosition="start"
                label="Danh sách"
              />
              <Tab
                icon={<TimelineIcon />}
                iconPosition="start"
                label="Dòng thời gian"
              />
              <Tab
                icon={<StatsIcon />}
                iconPosition="start"
                label="Thống kê"
              />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={currentTab} index={0}>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : histories.length > 0 ? (
                <>
                  {histories.map((history) => (
                    <DeviceHistoryItem
                      key={history.id}
                      history={history}
                      showDeviceInfo={!deviceId}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={4}>
                      <Pagination
                        count={totalPages}
                        page={filters.page || 1}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box textAlign="center" py={6}>
                  <Typography variant="h6" color="text.secondary">
                    Không có dữ liệu lịch sử
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Thử điều chỉnh bộ lọc để xem thêm kết quả.
                  </Typography>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <DeviceHistoryTimeline
                  timelineData={timelineData}
                  showDeviceInfo={!deviceId}
                  onEventClick={handleViewDetails}
                />
              )}
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              {stats ? (
                <DeviceHistoryStatsComponent stats={stats} loading={loading} />
              ) : (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Box>
      </Container>

      {/* Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Chi tiết hoạt động</Typography>
            <IconButton onClick={() => setShowDetailsDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedHistory && (
            <DeviceHistoryItem
              history={selectedHistory}
              showDeviceInfo={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
};

export default DeviceHistoryPage;