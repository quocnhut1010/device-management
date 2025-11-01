import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../../services/api';
import { DeviceListItem, RootStackParamList } from '../../types';

type MyDevicesNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyDevicesScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<MyDevicesNavigationProp>();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/Device/my');
      
      if (response.data) {
        setDevices(response.data);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  const handleDevicePress = (device: DeviceListItem) => {
    // Navigate to device detail (will need to fetch full device data)
    // For now, just show a message
    // In a real app, you might want to navigate to a simplified detail view
  };

  if (loading && devices.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (devices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Bạn chưa có thiết bị nào được cấp phát</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.deviceCard}
            onPress={() => handleDevicePress(item)}
          >
            <Card.Content>
              <Text style={styles.deviceName}>{item.deviceName}</Text>
              <Text style={styles.deviceCode}>Mã: {item.deviceCode}</Text>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceModel}>
                  {item.modelName || 'Chưa có model'}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              {item.departmentName && (
                <Text style={styles.deviceDept}>
                  Phòng ban: {item.departmentName}
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Đang sử dụng':
      return '#4caf50';
    case 'Đang sửa':
      return '#ff9800';
    case 'Chờ thanh lý':
      return '#f44336';
    case 'Chưa cấp phát':
      return '#2196f3';
    default:
      return '#757575';
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
  deviceCard: {
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
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  deviceModel: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deviceDept: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
});

export default MyDevicesScreen;

