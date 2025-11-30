import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Modal,
  Portal,
  RadioButton,
  Text,
  TextInput,
} from 'react-native-paper';
import repairService, { RejectOrNotNeededDto } from '../../services/repair';
import { Repair, RepairStatus } from '../../types';

interface RejectRepairModalProps {
  visible: boolean;
  repair: Repair | null;
  onDismiss: () => void;
  onSuccess: () => void;
}

const RejectRepairModal: React.FC<RejectRepairModalProps> = ({
  visible,
  repair,
  onDismiss,
  onSuccess,
}) => {
  const [decision, setDecision] = useState<RejectOrNotNeededDto['status']>(RepairStatus.TuChoi);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setDecision(RepairStatus.TuChoi);
      setReason('');
      setError('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!repair) return;
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do cụ thể');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload: RejectOrNotNeededDto = {
        status: decision,
        reason: reason.trim(),
      };
      await repairService.rejectOrMarkNotNeeded(repair.id, payload);
      onSuccess();
      onDismiss();
    } catch (submitError) {
      console.error('Error rejecting repair:', submitError);
      setError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        {!repair ? (
          <Text>Không có thông tin lệnh sửa chữa.</Text>
        ) : (
          <>
            <Text style={styles.title}>Xử lý lệnh sửa chữa</Text>
            <View style={styles.section}>
              <Text style={styles.label}>Thiết bị</Text>
              <Text style={styles.value}>{repair.deviceName || 'Không xác định'}</Text>
              <Text style={styles.label}>Mã thiết bị</Text>
              <Text style={styles.value}>{repair.deviceCode || '—'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Chọn phương án</Text>
              <RadioButton.Group
                value={decision.toString()}
                onValueChange={(value) => setDecision(Number(value) as RejectOrNotNeededDto['status'])}
              >
                <View style={styles.radioRow}>
                  <RadioButton value={RepairStatus.TuChoi.toString()} />
                  <Text>Từ chối lệnh sửa chữa</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value={RepairStatus.KhongCanSua.toString()} />
                  <Text>Đánh dấu không cần sửa</Text>
                </View>
              </RadioButton.Group>
            </View>

            <TextInput
              label="Lý do chi tiết"
              value={reason}
              onChangeText={setReason}
              multiline
              mode="outlined"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit
              style={styles.input}
            />

            {!!error && <HelperText type="error">{error}</HelperText>}

            <View style={styles.actions}>
              <Button onPress={onDismiss} disabled={loading}>
                Hủy
              </Button>
              <Button mode='contained' onPress={handleSubmit} loading={loading}>
                Xác nhận
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontSize: 14,
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  input: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});

export default RejectRepairModal;


