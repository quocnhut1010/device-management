import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Paper,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { DeviceAssignmentFilters } from '../../types/deviceAssignment';
import { DeviceModelDto } from '../../types/DeviceModelDto';
import { getActiveDeviceModels } from '../../services/deviceModelService';

interface Props {
  filters: DeviceAssignmentFilters;
  onFiltersChange: (filters: DeviceAssignmentFilters) => void;
  onSearch: () => void;
  onClear: () => void;
}

const DeviceAssignmentFiltersComponent: React.FC<Props> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
}) => {
  const [models, setModels] = useState<DeviceModelDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await getActiveDeviceModels();
      setModels(response.data);
    } catch (error) {
      console.error('Error loading device models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      deviceCode: event.target.value || undefined,
    });
  };

  const handleModelChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      modelName: value || undefined,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      status: event.target.value || undefined,
    });
  };

  const handleClear = () => {
    onFiltersChange({});
    onClear();
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Bộ lọc nâng cao
      </Typography>
      
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>🔍 Trạng thái</InputLabel>
            <Select
              value={filters.status || ''}
              label="🔍 Trạng thái"
              onChange={handleStatusChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Chưa cấp phát">Chưa cấp phát</MenuItem>
              <MenuItem value="Sẵn sàng">Sẵn sàng</MenuItem>
            </Select>
          </FormControl>

          {/* Model Filter */}
          <Autocomplete
            options={models}
            getOptionLabel={(option) => option.modelName}
            value={models.find(m => m.modelName === filters.modelName) || null}
            onChange={(_, value) => handleModelChange(value?.modelName || null)}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="🔍 Model"
                placeholder="Chọn model..."
                size="small"
              />
            )}
            sx={{ minWidth: 200 }}
          />

          {/* Device Code Filter */}
          <TextField
            label="🔍 Mã thiết bị"
            placeholder="Nhập mã thiết bị..."
            value={filters.deviceCode || ''}
            onChange={handleDeviceCodeChange}
            size="small"
            sx={{ minWidth: 200 }}
          />
        </Stack>


        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onSearch}
            color="primary"
          >
            Tìm kiếm
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            color="secondary"
          >
            Xóa bộ lọc
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DeviceAssignmentFiltersComponent;