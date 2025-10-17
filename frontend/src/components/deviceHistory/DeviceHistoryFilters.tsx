import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DeviceHistoryFilter, ACTION_TYPE_LABELS } from '../../types/deviceHistory';
import DeviceHistoryService from '../../services/deviceHistoryService';

interface DeviceHistoryFiltersProps {
  filters: DeviceHistoryFilter;
  onFiltersChange: (filters: DeviceHistoryFilter) => void;
  onApply: () => void;
  onClear: () => void;
}

const DeviceHistoryFilters: React.FC<DeviceHistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onClear
}) => {
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableActionTypes, setAvailableActionTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    setLoading(true);
    try {
      const [actions, actionTypes] = await Promise.all([
        DeviceHistoryService.getAvailableActions(),
        DeviceHistoryService.getAvailableActionTypes()
      ]);
      setAvailableActions(actions);
      setAvailableActionTypes(actionTypes);
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof DeviceHistoryFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const handleDateChange = (field: 'fromDate' | 'toDate', value: string) => {
    const date = value ? new Date(value).toISOString() : undefined;
    handleFilterChange(field, date);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.action) count++;
    if (filters.actionType) count++;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.deviceId) count++;
    if (filters.userId) count++;
    return count;
  };

  const formatDateForInput = (isoString?: string) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().slice(0, 16);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <Accordion expanded={expanded} onChange={(_, isExpanded) => setExpanded(isExpanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterIcon />
            <Typography variant="h6">
              Bộ lọc lịch sử thiết bị
            </Typography>
            {getActiveFiltersCount() > 0 && (
              <Chip 
                label={`${getActiveFiltersCount()} bộ lọc`} 
                size="small" 
                color="primary" 
              />
            )}
          </Stack>
        </AccordionSummary>
        
        <AccordionDetails>
          <CardContent>
            <Grid container spacing={3}>
              {/* Action Filter */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Hành động</InputLabel>
                  <Select
                    value={filters.action || ''}
                    onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
                    label="Hành động"
                  >
                    <MenuItem value="">
                      <em>Tất cả</em>
                    </MenuItem>
                    {availableActions.map((action) => (
                      <MenuItem key={action} value={action}>
                        {action}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Action Type Filter */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại hành động</InputLabel>
                  <Select
                    value={filters.actionType || ''}
                    onChange={(e) => handleFilterChange('actionType', e.target.value || undefined)}
                    label="Loại hành động"
                  >
                    <MenuItem value="">
                      <em>Tất cả</em>
                    </MenuItem>
                    {availableActionTypes.map((actionType) => (
                      <MenuItem key={actionType} value={actionType}>
                        {ACTION_TYPE_LABELS[actionType as keyof typeof ACTION_TYPE_LABELS] || actionType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* From Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Từ ngày"
                  value={formatDateForInput(filters.fromDate)}
                  onChange={(e) => handleDateChange('fromDate', e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>

              {/* To Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Đến ngày"
                  value={formatDateForInput(filters.toDate)}
                  onChange={(e) => handleDateChange('toDate', e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>

              {/* Page Size */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Số bản ghi/trang</InputLabel>
                  <Select
                    value={filters.pageSize || 20}
                    onChange={(e) => handleFilterChange('pageSize', Number(e.target.value))}
                    label="Số bản ghi/trang"
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort By */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sắp xếp theo</InputLabel>
                  <Select
                    value={filters.sortBy || 'ActionDate'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    label="Sắp xếp theo"
                  >
                    <MenuItem value="ActionDate">Ngày thực hiện</MenuItem>
                    <MenuItem value="Action">Hành động</MenuItem>
                    <MenuItem value="ActionType">Loại hành động</MenuItem>
                    <MenuItem value="DeviceName">Tên thiết bị</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort Order */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Thứ tự sắp xếp</InputLabel>
                  <Select
                    value={filters.sortOrder || 'desc'}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                    label="Thứ tự sắp xếp"
                  >
                    <MenuItem value="desc">Giảm dần</MenuItem>
                    <MenuItem value="asc">Tăng dần</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={onClear}
              >
                Xóa bộ lọc
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={onApply}
              >
                Áp dụng
              </Button>
            </Stack>
          </CardContent>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default DeviceHistoryFilters;