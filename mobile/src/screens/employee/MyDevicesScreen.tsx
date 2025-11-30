import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../../services/api';
import { DeviceListItem, DeviceQrScanResult, RootStackParamList } from '../../types';

type MyDevicesNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyDevicesScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
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

  const handleDevicePress = async (device: DeviceListItem) => {
    if (selectedDeviceId) return;

    try {
      setSelectedDeviceId(device.id);
      const encodedCode = encodeURIComponent(device.deviceCode);
      const response = await apiClient.get<DeviceQrScanResult>(`/Device/by-code/${encodedCode}`);

      if (response.status === 200 && response.data) {
        navigation.navigate('DeviceDetail', { device: response.data });
      }
    } catch (error: any) {
      console.error('Error loading device detail:', error);
      const status = error?.response?.status;
      const message =
        status === 404
          ? 'Không tìm thấy thiết bị. Vui lòng thử lại sau.'
          : 'Không thể tải thông tin thiết bị. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    } finally {
      setSelectedDeviceId(null);
    }
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
          <Card style={styles.deviceCard} onPress={() => handleDevicePress(item)}>
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
              {selectedDeviceId === item.id && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator animating size="small" color="#fff" />
                  <Text style={styles.loadingText}>Đang mở...</Text>
                </View>
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
    overflow: 'hidden',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  loadingText: {
    marginTop: 6,
    color: '#fff',
    fontWeight: '600',
  },
});

export default MyDevicesScreen;

