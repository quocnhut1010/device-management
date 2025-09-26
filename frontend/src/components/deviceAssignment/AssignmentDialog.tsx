import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import DepartmentDropdown from '../dropdowns/DepartmentDropdown';
import UserDropdown from '../dropdowns/UserDropdown';
import { CreateDeviceAssignmentDto, DeviceAssignmentDto } from '../../types/deviceAssignment';

interface Props {
  open: boolean;
  onClose: () => void;
  device: DeviceAssignmentDto | null; // Change to DeviceAssignmentDto
  onSubmit: (data: CreateDeviceAssignmentDto) => void;
}

const AssignmentDialog: React.FC<Props> = ({ open, onClose, device, onSubmit }) => {
  const [departmentId, setDepartmentId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setDepartmentId('');
      setUserId('');
      setNote('');
    }
  }, [open]);

  // Reset userId khi departmentId thay đổi
  useEffect(() => {
    setUserId(''); // Xóa lựa chọn user khi đổi phòng ban
  }, [departmentId]);

  const handleSubmit = () => {
    if (!device || !userId || !departmentId) return;

    const payload: CreateDeviceAssignmentDto = {
      DeviceId: device.deviceId || device.id, // Handle both deviceId and id
      AssignedToDepartmentId: departmentId,
      AssignedToUserId: userId,
      Note: note,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cấp phát thiết bị</DialogTitle>
      <DialogContent>
        {device && (
          <Typography mb={2}>
            <strong>Thiết bị:</strong> {device.deviceName} 
            {/* DeviceAssignmentDto không có deviceCode, chỉ hiển deviceName */}
          </Typography>
        )}

        <Stack spacing={2}>
          <DepartmentDropdown
            value={departmentId}
            onChange={setDepartmentId}
          />

          <UserDropdown
            departmentId={departmentId}
            value={userId}
            onChange={setUserId}
          />

          <TextField
            label="Ghi chú (nếu có)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Xác nhận</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentDialog;
