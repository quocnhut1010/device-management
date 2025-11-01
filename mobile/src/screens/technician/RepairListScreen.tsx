import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../../services/api';
import { Repair, RootStackParamList } from '../../types';

type RepairListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RepairListScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<RepairListNavigationProp>();

  useEffect(() => {
    loadRepairs();
  }, []);

  const loadRepairs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/Repair/mine');
      
      if (response.data) {
        setRepairs(response.data);
      }
    } catch (error) {
      console.error('Error loading repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRepairs();
    setRefreshing(false);
  };

  const handleRepairPress = (repair: Repair) => {
    navigation.navigate('RepairDetail', { repair });
  };

  const getRepairStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      '0': 'Chờ tiếp nhận',
      '1': 'Đang sửa',
      '2': 'Chờ duyệt hoàn tất',
      '3': 'Đã hoàn tất',
      '4': 'Từ chối',
      '5': 'Không cần sửa',
    };
    return statusMap[status] || 'Không xác định';
  };

  const getRepairStatusColor = (status: string) => {
    switch (status) {
      case '0':
        return '#ff9800';
      case '1':
        return '#2196f3';
      case '2':
        return '#9c27b0';
      case '3':
        return '#4caf50';
      case '4':
        return '#f44336';
      case '5':
        return '#757575';
      default:
        return '#757575';
    }
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
                    { backgroundColor: getRepairStatusColor(item.status.toString()) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getRepairStatusText(item.status.toString())}
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
            </Card.Content>
          </Card>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
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

