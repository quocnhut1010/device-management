import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  History as HistoryIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { EligibleDeviceDto, LiquidationDto } from '../types/liquidation';
import liquidationService from '../services/liquidationService';
import LiquidationDialog from '../components/liquidation/LiquidationDialog';
import { getUserFromToken } from '../services/auth';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import LiquidationDetailsDialog from '../components/liquidation/LiquidationDetailsDialog';

const LiquidationPage: React.FC = () => {
  const user = getUserFromToken();
  const [eligibleDevices, setEligibleDevices] = useState<EligibleDeviceDto[]>([]);
  const [liquidationHistory, setLiquidationHistory] = useState<LiquidationDto[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [liquidationDialogOpen, setLiquidationDialogOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLiquidationId, setSelectedLiquidationId] = useState<string | null>(null);


  // Kiểm tra quyền Admin
  if (user?.role !== 'Admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể thực hiện thanh lý thiết bị.
        </Alert>
      </Box>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [devicesResponse, historyResponse] = await Promise.all([
        liquidationService.getEligibleDevices(),
        liquidationService.getLiquidationHistory()
      ]);

      setEligibleDevices(devicesResponse);
      setLiquidationHistory(historyResponse);
      
      console.log('Eligible devices:', devicesResponse);
      console.log('Liquidation history:', historyResponse);
    } catch (error: any) {
      console.error('Error loading liquidation data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedDevices(eligibleDevices.map(device => device.id));
    } else {
      setSelectedDevices([]);
    }
  };

  const handleLiquidateSelected = () => {
    if (selectedDevices.length === 0) {
      toast.warning('Vui lòng chọn thiết bị cần thanh lý');
      return;
    }
    setLiquidationDialogOpen(true);
  };

  const handleLiquidationSuccess = () => {
    setSelectedDevices([]);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ thanh lý':
        return 'warning';
      case 'Đã hỏng':
        return 'error';
      case 'Mất':
        return 'error';
      default:
        return 'default';
    }
  };
    const handleOpenDetails = (liquidationId: string) => {
    setSelectedLiquidationId(liquidationId);
    setDetailsDialogOpen(true);
  };


  const getSelectedDevices = () => {
    return eligibleDevices.filter(device => selectedDevices.includes(device.id));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý thanh lý thiết bị
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Thiết bị đủ điều kiện
              </Typography>
              <Typography variant="h4" component="div">
                {eligibleDevices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Đã chọn
              </Typography>
              <Typography variant="h4" component="div">
                {selectedDevices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Đã thanh lý
              </Typography>
              <Typography variant="h4" component="div">
                {liquidationHistory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="warning"
          startIcon={<DeleteIcon />}
          onClick={handleLiquidateSelected}
          disabled={selectedDevices.length === 0}
        >
          Thanh lý ({selectedDevices.length})
        </Button>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
        </Button>
      </Box>

      {!showHistory ? (
        // Danh sách thiết bị đủ điều kiện thanh lý
        <>
          {eligibleDevices.length === 0 ? (
            <Alert severity="info">
              Hiện tại không có thiết bị nào đủ điều kiện thanh lý.
            </Alert>
          ) : (
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedDevices.length > 0 &&
                            selectedDevices.length < eligibleDevices.length
                          }
                          checked={
                            eligibleDevices.length > 0 &&
                            selectedDevices.length === eligibleDevices.length
                          }
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Mã thiết bị</TableCell>
                      <TableCell>Tên thiết bị</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Lý do đủ điều kiện</TableCell>
                      <TableCell>Phòng ban</TableCell>
                      <TableCell>Người dùng</TableCell>
                      <TableCell align="right">Giá trị (VND)</TableCell>
                      <TableCell>Ngày mua</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eligibleDevices.map((device) => (
                      <TableRow
                        key={device.id}
                        hover
                        selected={selectedDevices.includes(device.id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedDevices.includes(device.id)}
                            onChange={() => handleSelectDevice(device.id)}
                          />
                        </TableCell>
                        <TableCell>{device.deviceCode}</TableCell>
                        <TableCell>{device.deviceName}</TableCell>
                        <TableCell>
                          <Chip
                            label={device.status}
                            color={getStatusColor(device.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={device.eligibilityReason}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {device.eligibilityReason}
                              </Typography>
                              <InfoIcon fontSize="small" color="action" />
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{device.currentDepartmentName || '-'}</TableCell>
                        <TableCell>{device.currentUserFullName || '-'}</TableCell>
                        <TableCell align="right">
                          {device.purchasePrice?.toLocaleString('vi-VN') || '-'}
                        </TableCell>
                        <TableCell>
                          {device.purchaseDate ? 
                            format(parseISO(device.purchaseDate), 'dd/MM/yyyy', { locale: vi }) : 
                            '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      ) : (
        // Lịch sử thanh lý
        <>
          <Typography variant="h6" gutterBottom>
            Lịch sử thanh lý
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {liquidationHistory.length === 0 ? (
            <Alert severity="info">
              Chưa có lịch sử thanh lý thiết bị nào.
            </Alert>
          ) : (
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã thiết bị</TableCell>
                      <TableCell>Tên thiết bị</TableCell>
                      <TableCell>Lý do thanh lý</TableCell>
                      <TableCell>Ngày thanh lý</TableCell>
                      <TableCell>Người phê duyệt</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liquidationHistory.map((liquidation) => (
                      <TableRow key={liquidation.id}
                        hover
                        onClick={() => handleOpenDetails(liquidation.id)}
                        sx={{ cursor: 'pointer' }}>
                        <TableCell>{liquidation.deviceCode}</TableCell>
                        <TableCell>{liquidation.deviceName}</TableCell>
                        <TableCell>{liquidation.reason}</TableCell>
                        <TableCell>
                          {format(parseISO(liquidation.liquidationDate), 'dd/MM/yyyy', { locale: vi })}
                        </TableCell>
                        <TableCell>{liquidation.approvedByName}</TableCell>
                        <TableCell>
                          {format(parseISO(liquidation.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {/* Dialog thanh lý */}
      <LiquidationDialog
        open={liquidationDialogOpen}
        onClose={() => setLiquidationDialogOpen(false)}
        selectedDevices={getSelectedDevices()}
        onSuccess={handleLiquidationSuccess}
      />
        <LiquidationDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        liquidationId={selectedLiquidationId}
      />
    </Box>
  );
};

export default LiquidationPage;