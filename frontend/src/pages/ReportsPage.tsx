import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Build as BuildIcon,
  ReportProblem as ReportProblemIcon,
  DeleteSweep as DeleteSweepIcon,
  FileDownload as FileDownloadIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ReportExportDto } from '../types/reportExport';
import { getExportHistory } from '../services/reportExportService';
import ExportDialog from '../components/reports/ExportDialog';
import useNotification from '../hooks/useNotification';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'Devices' | 'Repairs' | 'Incidents' | 'Liquidation'>('Devices');
  const [exportHistory, setExportHistory] = useState<ReportExportDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const { showError } = useNotification();

  useEffect(() => {
    if (currentTab === 1) {
      loadExportHistory();
    }
  }, [currentTab]);

  const loadExportHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setHistoryError(null);
      const history = await getExportHistory();
      setExportHistory(history);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi tải lịch sử xuất báo cáo';
      setHistoryError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleExportClick = (reportType: 'Devices' | 'Repairs' | 'Incidents' | 'Liquidation') => {
    setSelectedReportType(reportType);
    setExportDialogOpen(true);
  };

  const handleExportSuccess = () => {
    if (currentTab === 1) {
      loadExportHistory();
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'Devices':
        return <DevicesIcon sx={{ fontSize: 40 }} />;
      case 'Repairs':
        return <BuildIcon sx={{ fontSize: 40 }} />;
      case 'Incidents':
        return <ReportProblemIcon sx={{ fontSize: 40 }} />;
      case 'Liquidation':
        return <DeleteSweepIcon sx={{ fontSize: 40 }} />;
      default:
        return <FileDownloadIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Devices: 'Thiết bị',
      Repairs: 'Sửa chữa',
      Incidents: 'Báo cáo sự cố',
      Liquidation: 'Thanh lý',
    };
    return labels[type] || type;
  };

  const getReportTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      Devices: 'Xuất danh sách tất cả thiết bị với thông tin chi tiết',
      Repairs: 'Xuất lịch sử sửa chữa và trạng thái thiết bị',
      Incidents: 'Xuất báo cáo sự cố và xử lý',
      Liquidation: 'Xuất danh sách thiết bị đã thanh lý',
    };
    return descriptions[type] || '';
  };

  const getFormatIcon = (format: string) => {
    return format === 'Excel' ? <ExcelIcon /> : <PdfIcon />;
  };

  const getFormatColor = (format: string) => {
    return format === 'Excel' ? 'success' : 'error';
  };

  const reportTypes: ('Devices' | 'Repairs' | 'Incidents' | 'Liquidation')[] = [
    'Devices',
    'Repairs',
    'Incidents',
    'Liquidation',
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="reports tabs">
          <Tab label="Xuất báo cáo" />
          <Tab label="Lịch sử xuất" />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <Typography variant="h4" gutterBottom>
          Xuất báo cáo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Chọn loại báo cáo bạn muốn xuất. Bạn có thể xuất dưới định dạng Excel hoặc PDF.
        </Typography>

        <Grid container spacing={3}>
          {reportTypes.map((reportType) => (
            <Grid item xs={12} sm={6} md={3} key={reportType}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {getReportTypeIcon(reportType)}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {getReportTypeLabel(reportType)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getReportTypeDescription(reportType)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleExportClick(reportType)}
                    startIcon={<FileDownloadIcon />}
                    fullWidth
                  >
                    Xuất báo cáo
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Lịch sử xuất báo cáo
          </Typography>
          <Tooltip title="Làm mới">
            <IconButton onClick={loadExportHistory} disabled={isLoadingHistory}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {historyError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {historyError}
          </Alert>
        )}

        {isLoadingHistory ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Loại báo cáo</TableCell>
                  <TableCell>Định dạng</TableCell>
                  <TableCell>Ngày xuất</TableCell>
                  <TableCell>Người xuất</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exportHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Chưa có lịch sử xuất báo cáo nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  exportHistory.map((exportItem) => (
                    <TableRow key={exportItem.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getReportTypeIcon(exportItem.reportType)}
                          <Typography variant="body2">
                            {getReportTypeLabel(exportItem.reportType)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getFormatIcon(exportItem.reportType)}
                          label={exportItem.reportType}
                          color={getFormatColor(exportItem.reportType) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(exportItem.exportDate).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>{exportItem.exportedByName}</TableCell>
                      <TableCell>
                        {exportItem.fileUrl ? (
                          <Button
                            size="small"
                            startIcon={<FileDownloadIcon />}
                            onClick={() => window.open(exportItem.fileUrl, '_blank')}
                          >
                            Tải lại
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Không có file
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        reportType={selectedReportType}
        onSuccess={handleExportSuccess}
      />
    </Box>
  );
};

export default ReportsPage;
