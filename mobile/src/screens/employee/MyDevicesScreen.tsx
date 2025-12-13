import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../../services/api';
import { DeviceListItem, DeviceQrScanResult, RootStackParamList } from '../../types';
import Colors from '../../theme/colors';

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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (devices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons name="devices" size={64} color={Colors.textTertiary} />
        </View>
        <Text style={styles.emptyText}>Bạn chưa có thiết bị nào được cấp phát</Text>
        <Text style={styles.emptySubtext}>Thiết bị được cấp phát sẽ hiển thị ở đây</Text>
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
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.deviceIconContainer}>
                  <MaterialCommunityIcons 
                    name="devices" 
                    size={28} 
                    color={Colors.primary} 
                  />
                </View>
                <View style={styles.deviceTitleContainer}>
                  <Text style={styles.deviceName}>{item.deviceName}</Text>
                  <Text style={styles.deviceCode}>Mã: {item.deviceCode}</Text>
                </View>
              </View>
              
              <View style={styles.deviceInfo}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons 
                    name="package-variant" 
                    size={16} 
                    color={Colors.textSecondary} 
                  />
                  <Text style={styles.deviceModel}>
                    {item.modelName || 'Chưa có model'}
                  </Text>
                </View>
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
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons 
                    name="office-building" 
                    size={16} 
                    color={Colors.textSecondary} 
                  />
                  <Text style={styles.deviceDept}>
                    {item.departmentName}
                  </Text>
                </View>
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
  return Colors.status[status as keyof typeof Colors.status] || Colors.textSecondary;
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  deviceCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceTitleContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  deviceCode: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  deviceModel: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceDept: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default MyDevicesScreen;

