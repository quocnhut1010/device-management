import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import apiClient from '../../services/api';
import { DeviceListItem } from '../../types';

const DashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    inUse: 0,
    repairing: 0,
    pendingLiquidation: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/Device/paged', {
        params: { page: 1, pageSize: 100 },
      });
      
      if (response.data?.devices) {
        const deviceList = response.data.devices;
        setDevices(deviceList);
        
        // Calculate stats
        const statsData = {
          total: deviceList.length,
          inUse: deviceList.filter((d: any) => d.status === 'Đang sử dụng').length,
          repairing: deviceList.filter((d: any) => d.status === 'Đang sửa').length,
          pendingLiquidation: deviceList.filter((d: any) => d.status === 'Chờ thanh lý').length,
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Thống kê thiết bị</Text>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Tổng số thiết bị</Text>
          </Card.Content>
        </Card>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content>
              <Text style={[styles.statNumber, { color: '#4caf50' }]}>
                {stats.inUse}
              </Text>
              <Text style={styles.statLabel}>Đang sử dụng</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content>
              <Text style={[styles.statNumber, { color: '#ff9800' }]}>
                {stats.repairing}
              </Text>
              <Text style={styles.statLabel}>Đang sửa</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={[styles.statNumber, { color: '#f44336' }]}>
              {stats.pendingLiquidation}
            </Text>
            <Text style={styles.statLabel}>Chờ thanh lý</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.devicesContainer}>
        <Text style={styles.sectionTitle}>Danh sách thiết bị</Text>
        
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.deviceCard}>
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
                {item.currentUserName && (
                  <Text style={styles.deviceUser}>
                    Người dùng: {item.currentUserName}
                  </Text>
                )}
              </Card.Content>
            </Card>
          )}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
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
  statsContainer: {
    padding: 10,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  statCard: {
    marginBottom: 10,
    elevation: 2,
  },
  statCardHalf: {
    width: '48%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 5,
  },
  devicesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
    paddingHorizontal: 5,
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
  deviceUser: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
});

export default DashboardScreen;

