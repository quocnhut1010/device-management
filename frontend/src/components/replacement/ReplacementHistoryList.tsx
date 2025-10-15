import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Alert,
  CircularProgress,
  Avatar,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Visibility as ViewIcon,
  SwapHoriz as SwapIcon,
  Search as SearchIcon,
  DeviceHub as DeviceIcon
} from '@mui/icons-material';
import { ReplacementDto, ReplacementFilters } from '../../types/replacement';
import {
  getReplacementHistory,
  formatReplacementDate,
  getReplacementStatusText
} from '../../services/replacementService';
import ReplacementDetailsDialog from './ReplacementDetailsDialog';

interface ReplacementHistoryListProps {
  refreshTrigger?: number;
  deviceId?: string; // To filter by specific device
}

export default function ReplacementHistoryList({ 
  refreshTrigger,
  deviceId 
}: ReplacementHistoryListProps) {
  const [replacements, setReplacements] = useState<ReplacementDto[]>([]);
  const [filteredReplacements, setFilteredReplacements] = useState<ReplacementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedReplacement, setSelectedReplacement] = useState<ReplacementDto | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadReplacementHistory();
  }, [refreshTrigger, deviceId]);

  useEffect(() => {
    // Filter replacements based on search term
    if (!searchTerm.trim()) {
      setFilteredReplacements(replacements);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = replacements.filter(replacement =>
        replacement.oldDeviceCode?.toLowerCase().includes(term) ||
        replacement.oldDeviceName?.toLowerCase().includes(term) ||
        replacement.newDeviceCode?.toLowerCase().includes(term) ||
        replacement.newDeviceName?.toLowerCase().includes(term) ||
        replacement.userFullName?.toLowerCase().includes(term) ||
        replacement.reason?.toLowerCase().includes(term)
      );
      setFilteredReplacements(filtered);
    }
  }, [replacements, searchTerm]);

  const loadReplacementHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: ReplacementFilters = {};
      if (deviceId) {
        filters.deviceId = deviceId;
      }

      const data = await getReplacementHistory(filters);
      setReplacements(data);
    } catch (error: any) {
      console.error('Error loading replacement history:', error);
      setError('Không thể tải lịch sử thay thế thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (replacement: ReplacementDto) => {
    setSelectedReplacement(replacement);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedReplacement(null);
  };

  const formatPrice = (price?: number): string => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Đang tải lịch sử thay thế...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Search */}
      {!deviceId && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã thiết bị, tên thiết bị, người dùng, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          {filteredReplacements.length} kết quả
          {searchTerm && ` cho "${searchTerm}"`}
          {deviceId && " cho thiết bị này"}
        </Typography>
      </Box>

      {filteredReplacements.length === 0 ? (
        <Box textAlign="center" p={4}>
          <SwapIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có lịch sử thay thế'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Các lệnh thay thế thiết bị sẽ hiển thị tại đây'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thiết bị cũ</TableCell>
                <TableCell>Thiết bị mới</TableCell>
                <TableCell>Người dùng</TableCell>
                <TableCell>Ngày thay thế</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReplacements.map((replacement) => (
                <TableRow key={replacement.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <DeviceIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {replacement.oldDeviceCode}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {replacement.oldDeviceName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <DeviceIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {replacement.newDeviceCode}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {replacement.newDeviceName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {replacement.userFullName ? (
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {replacement.userFullName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {replacement.userEmail}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Không có
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatReplacementDate(replacement.replacementDate)}
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
                      title={replacement.reason}
                    >
                      {replacement.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getReplacementStatusText(replacement)}
                      color={replacement.replacementDate ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(replacement)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <ReplacementDetailsDialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        replacement={selectedReplacement}
      />
    </Box>
  );
}