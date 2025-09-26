import React, { useState, useEffect } from 'react';
import {
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
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Visibility as ViewIcon,
  PlayArrow as AcceptIcon,
  Check as CompleteIcon,
  CheckCircle as ConfirmIcon,
  Close as RejectIcon,
  RemoveCircle as NotNeededIcon
} from '@mui/icons-material';
import {
  Repair,
  repairService,
  getRepairStatusText,
  getRepairStatusColor,
  RepairStatus
} from '../../services/repairService';
import { getUserFromToken } from '../../services/auth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RepairListProps {
  showMyRepairs?: boolean;
  onViewDetails: (repair: Repair) => void;
  onAcceptRepair: (repairId: string) => void;
  onCompleteRepair: (repair: Repair) => void;
  onConfirmCompletion: (repairId: string) => void;
  onRejectRepair: (repairId: string) => void;
  onMarkNotNeeded: (repairId: string) => void;
  refreshTrigger?: number;
}

export default function RepairList({
  showMyRepairs = false,
  onViewDetails,
  onAcceptRepair,
  onCompleteRepair,
  onConfirmCompletion,
  onRejectRepair,
  onMarkNotNeeded,
  refreshTrigger
}: RepairListProps) {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const currentUser = getUserFromToken();
  const isAdmin = currentUser?.role === 'Admin';
  const isTechnician = currentUser?.position === 'Kỹ thuật viên';

  useEffect(() => {
    loadRepairs();
  }, [showMyRepairs, refreshTrigger]);

  const loadRepairs = async () => {
    try {
      setLoading(true);
      setError('');

      let data: Repair[];
      if (showMyRepairs) {
        data = await repairService.getMyRepairs();
      } else {
        data = await repairService.getAllRepairs();
      }

      setRepairs(data);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách lệnh sửa chữa:', error);
      setError('Không thể tải danh sách lệnh sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Kiểm tra quyền thực hiện các hành động
  const canAccept = (repair: Repair): boolean => {
    return isTechnician && repair.status === RepairStatus.ChoThucHien;
  };

  const canComplete = (repair: Repair): boolean => {
    return isTechnician && 
           repair.status === RepairStatus.DangSua &&
           repair.assignedToTechnicianId === currentUser?.nameid;
  };

  const canConfirm = (repair: Repair): boolean => {
    return isAdmin && repair.status === RepairStatus.ChoDuyetHoanTat;
  };

  const canReject = (repair: Repair): boolean => {
    return isTechnician && 
           repair.status === RepairStatus.ChoThucHien &&
           (repair.assignedToTechnicianId === currentUser?.nameid || !repair.assignedToTechnicianId);
  };

  const canMarkNotNeeded = (repair: Repair): boolean => {
    return isTechnician && 
           repair.status === RepairStatus.DangSua &&
           repair.assignedToTechnicianId === currentUser?.nameid;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {repairs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {showMyRepairs ? 'Bạn chưa có lệnh sửa chữa nào' : 'Không có lệnh sửa chữa nào'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thiết bị</TableCell>
                <TableCell>Mô tả</TableCell>
                {!showMyRepairs && <TableCell>Kỹ thuật viên</TableCell>}
                <TableCell>Chi phí</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {repair.deviceCode}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {repair.deviceName}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {repair.description || repair.incidentReport?.description}
                    </Typography>
                  </TableCell>

                  {!showMyRepairs && (
                    <TableCell>
                      {repair.assignedToTechnician ? (
                        <Box>
                          <Typography variant="body2">
                            {repair.assignedToTechnician.fullName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {repair.assignedToTechnician.email}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          Chưa phân công
                        </Typography>
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    {formatCurrency(repair.cost)}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      Bắt đầu: {formatDate(repair.startDate)}
                    </Typography>
                    {repair.endDate && (
                      <Typography variant="body2">
                        Kết thúc: {formatDate(repair.endDate)}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getRepairStatusText(repair.status)}
                      color={getRepairStatusColor(repair.status) as any}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {/* Xem chi tiết */}
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => onViewDetails(repair)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Chấp nhận lệnh sửa */}
                      {canAccept(repair) && (
                        <Tooltip title="Chấp nhận lệnh sửa">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onAcceptRepair(repair.id)}
                          >
                            <AcceptIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Hoàn thành sửa chữa */}
                      {canComplete(repair) && (
                        <Tooltip title="Hoàn thành sửa chữa">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onCompleteRepair(repair)}
                          >
                            <CompleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Admin xác nhận hoàn tất */}
                      {canConfirm(repair) && (
                        <Tooltip title="Xác nhận hoàn tất">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onConfirmCompletion(repair.id)}
                          >
                            <ConfirmIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Từ chối lệnh sửa */}
                      {canReject(repair) && (
                        <Tooltip title="Từ chối lệnh sửa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onRejectRepair(repair.id)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Đánh dấu không cần sửa */}
                      {canMarkNotNeeded(repair) && (
                        <Tooltip title="Không cần sửa">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => onMarkNotNeeded(repair.id)}
                          >
                            <NotNeededIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}