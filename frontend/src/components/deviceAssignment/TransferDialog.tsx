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
import { DeviceAssignmentDto, TransferDeviceAssignmentDto } from '../../types/deviceAssignment';

interface Props {
  open: boolean;
  onClose: () => void;
  assignment: DeviceAssignmentDto | null;
  onSubmit: (data: TransferDeviceAssignmentDto) => void;
}

const TransferDialog: React.FC<Props> = ({ open, onClose, assignment, onSubmit }) => {
  const [departmentId, setDepartmentId] = useState('');
  const [userId, setUserId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open && assignment) {
      setDepartmentId('');
      setUserId('');
      setNote('');
    }
  }, [open, assignment]);

  // Reset userId khi departmentId thay đổi
  useEffect(() => {
    setUserId(''); // Xóa lựa chọn user khi đổi phòng ban
  }, [departmentId]);

  const handleSubmit = () => {
    if (!assignment || !userId || !departmentId) return;

    if (userId === assignment.assignedToUserId) {
      alert('Không thể chuyển giao cho chính người đang sử dụng thiết bị!');
      return;
    }

    const payload: TransferDeviceAssignmentDto = {
      oldAssignmentId: assignment.id,
      newDepartmentId: departmentId,
      newUserId: userId,
      note,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chuyển giao thiết bị</DialogTitle>
      <DialogContent>
        {assignment && (
          <>
            <Typography mb={1}><strong>Thiết bị:</strong> {assignment.deviceName}</Typography>
            <Typography mb={2}>
              <strong>Người dùng hiện tại:</strong> {assignment.assignedToUserName}
            </Typography>
          </>
        )}
        <Stack spacing={2}>
          <DepartmentDropdown
            value={departmentId}
            onChange={setDepartmentId}
            label="Chọn phòng ban mới"
            fullWidth
            required
          />

          <UserDropdown
            departmentId={departmentId}
            value={userId}
            onChange={setUserId}
            label="Chọn người dùng mới"
            fullWidth
            required
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

export default TransferDialog;
