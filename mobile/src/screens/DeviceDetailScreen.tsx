import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { format } from 'date-fns';

type DeviceDetailRouteProp = RouteProp<RootStackParamList, 'DeviceDetail'>;

interface Props {
  route: DeviceDetailRouteProp;
}

const DeviceDetailScreen: React.FC<Props> = ({ route }) => {
  const { device } = route.params;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {device.deviceImageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: device.deviceImageUrl.startsWith('http') ? device.deviceImageUrl : `http://localhost:5264${device.deviceImageUrl}` }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Thông tin cơ bản</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mã thiết bị:</Text>
            <Text style={styles.value}>{device.deviceCode}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên thiết bị:</Text>
            <Text style={styles.value}>{device.deviceName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(device.status) }]}>
              <Text style={styles.statusText}>{device.status}</Text>
            </View>
          </View>

          {device.serialNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Số serial:</Text>
              <Text style={styles.value}>{device.serialNumber}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Thông tin Model</Text>
          <Divider style={styles.divider} />
          
          {device.modelName && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Model:</Text>
              <Text style={styles.value}>{device.modelName}</Text>
            </View>
          )}

          {device.deviceTypeName && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Loại thiết bị:</Text>
              <Text style={styles.value}>{device.deviceTypeName}</Text>
            </View>
          )}

          {device.manufacturer && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nhà sản xuất:</Text>
              <Text style={styles.value}>{device.manufacturer}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Người dùng & Phòng ban</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Người sử dụng:</Text>
            <Text style={styles.value}>{device.currentUserName || 'Chưa cấp phát'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phòng ban:</Text>
            <Text style={styles.value}>{device.departmentName || 'Chưa có'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Lịch sử bảo trì</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số lần sửa chữa:</Text>
            <Text style={styles.value}>{device.repairCount}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Sửa chữa gần nhất:</Text>
            <Text style={styles.value}>{formatDate(device.lastRepairDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Số sự cố:</Text>
            <Text style={styles.value}>{device.incidentCount}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Thông tin khác</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày mua:</Text>
            <Text style={styles.value}>{formatDate(device.purchaseDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Hết bảo hành:</Text>
            <Text style={styles.value}>{formatDate(device.warrantyExpiry)}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const getStatusColor = (status?: string) => {
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
  imageContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  divider: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    flex: 2,
    textAlign: 'right',
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
  footer: {
    height: 20,
  },
});

export default DeviceDetailScreen;

