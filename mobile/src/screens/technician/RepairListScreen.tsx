import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Repair, RootStackParamList, getRepairStatusColor, getRepairStatusText, RepairStatus } from '../../types';
import repairService from '../../services/repair';
import RejectRepairModal from '../../components/technician/RejectRepairModal';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../theme/colors';

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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (repairs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons name="tools" size={64} color={Colors.textTertiary} />
        </View>
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
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  repairCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: Colors.surface,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  deviceCode: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    fontWeight: '500',
  },
  repairInfo: {
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    borderRadius: 12,
  },
  rejectButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  repairDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});

export default RepairListScreen;

