import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type RepairDetailRouteProp = RouteProp<RootStackParamList, 'RepairDetail'>;

interface Props {
  route: RepairDetailRouteProp;
}

const RepairDetailScreen: React.FC<Props> = ({ route }) => {
  const { repair } = route.params;

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Thông tin thiết bị</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên thiết bị:</Text>
            <Text style={styles.value}>{repair.deviceName || 'Chưa có'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mã thiết bị:</Text>
            <Text style={styles.value}>{repair.deviceCode || 'Chưa có'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Trạng thái</Text>
          <View style={[styles.statusBadge, { backgroundColor: getRepairStatusColor(repair.status.toString()) }]}>
            <Text style={styles.statusText}>
              {getRepairStatusText(repair.status.toString())}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Mô tả sự cố</Text>
          <Text style={styles.description}>
            {repair.description || 'Chưa có mô tả'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Thông tin sửa chữa</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày bắt đầu:</Text>
            <Text style={styles.value}>{formatDate(repair.startDate)}</Text>
          </View>
          {repair.endDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Ngày hoàn tất:</Text>
              <Text style={styles.value}>{formatDate(repair.endDate)}</Text>
            </View>
          )}
          {repair.cost !== undefined && repair.cost !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Chi phí:</Text>
              <Text style={styles.value}>
                {new Intl.NumberFormat('vi-VN').format(repair.cost)} VNĐ
              </Text>
            </View>
          )}
          {repair.laborHours !== undefined && repair.laborHours !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Giờ lao động:</Text>
              <Text style={styles.value}>{repair.laborHours} giờ</Text>
            </View>
          )}
          {repair.repairCompany && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Đơn vị sửa chữa:</Text>
              <Text style={styles.value}>{repair.repairCompany}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
    marginTop: 5,
  },
  footer: {
    height: 20,
  },
});

export default RepairDetailScreen;

