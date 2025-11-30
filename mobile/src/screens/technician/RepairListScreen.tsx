import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Repair, RootStackParamList, getRepairStatusColor, getRepairStatusText, RepairStatus } from '../../types';
import repairService from '../../services/repair';
import RejectRepairModal from '../../components/technician/RejectRepairModal';
import { useAuth } from '../../contexts/AuthContext';

type RepairListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RepairListScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<RepairListNavigationProp>();
  const { user } = useAuth();
  const currentUserId = user?.nameid;

  const loadRepairs = useCallback(async () => {
    try {
      setLoading(true);
      const repairList = await repairService.getMyRepairs();
      setRepairs(repairList);
    } catch (error) {
      console.error('Error loading repairs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepairs();
  }, [loadRepairs]);

  useFocusEffect(
    useCallback(() => {
      loadRepairs();
    }, [loadRepairs])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRepairs();
    setRefreshing(false);
  };

  const handleRepairPress = (repair: Repair) => {
    navigation.navigate('RepairDetail', { repair });
  };

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);

  const handleAcceptRepair = async (repairId: string) => {
    try {
      setActionLoadingId(repairId);
      await repairService.acceptRepair(repairId);
      await loadRepairs();
    } catch (error) {
      console.error('Error accepting repair:', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const canRejectOrNotNeeded = (repair: Repair) => {
    if (repair.status !== RepairStatus.ChoThucHien && repair.status !== RepairStatus.DangSua) {
      return false;
    }
    if (!currentUserId) return false;
    if (!repair.technicianId) {
      return true;
    }
    return repair.technicianId === currentUserId;
  };

  const handleOpenRejectModal = (repair: Repair) => {
    setSelectedRepair(repair);
    setRejectModalVisible(true);
  };

  const handleRejectSuccess = async () => {
    await loadRepairs();
  };

  if (loading && repairs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (repairs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Bạn chưa có lệnh sửa chữa nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={repairs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.repairCard}
            onPress={() => handleRepairPress(item)}
          >
            <Card.Content>
              <Text style={styles.deviceName}>
                {item.deviceName || 'Thiết bị không xác định'}
              </Text>
              <Text style={styles.deviceCode}>Mã: {item.deviceCode || 'N/A'}</Text>
              <View style={styles.repairInfo}>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description || 'Không có mô tả'}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getRepairStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getRepairStatusText(item.status)}
                  </Text>
                </View>
              </View>
              {item.startDate && (
                <Text style={styles.repairDate}>
                  Ngày bắt đầu: {formatDate(item.startDate)}
                </Text>
              )}
              {item.endDate && (
                <Text style={styles.repairDate}>
                  Ngày hoàn tất: {formatDate(item.endDate)}
                </Text>
              )}
              {item.status === RepairStatus.ChoThucHien && (
                <Button
                  mode="contained"
                  style={styles.actionButton}
                  onPress={() => handleAcceptRepair(item.id)}
                  loading={actionLoadingId === item.id}
                >
                  Tiếp nhận
                </Button>
              )}
              {canRejectOrNotNeeded(item) && (
                <Button
                  mode="outlined"
                  style={styles.rejectButton}
                  onPress={() => handleOpenRejectModal(item)}
                >
                  Từ chối / Không cần sửa
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />
      <RejectRepairModal
        visible={rejectModalVisible}
        repair={selectedRepair}
        onDismiss={() => setRejectModalVisible(false)}
        onSuccess={handleRejectSuccess}
      />
    </View>
  );
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch {
    return dateString;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  listContent: {
    padding: 10,
  },
  repairCard: {
    marginBottom: 10,
    elevation: 2,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  deviceCode: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  repairInfo: {
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  rejectButton: {
    marginTop: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  repairDate: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
});

export default RepairListScreen;

