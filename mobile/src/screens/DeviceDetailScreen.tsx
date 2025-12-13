import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { format } from 'date-fns';
import { getApiBaseUrl } from '../utils/baseUrl';
import Colors from '../theme/colors';

type DeviceDetailRouteProp = RouteProp<RootStackParamList, 'DeviceDetail'>;

interface Props {
  route: DeviceDetailRouteProp;
}

const DeviceDetailScreen: React.FC<Props> = ({ route }) => {
  const { device } = route.params;
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadBaseUrl = async () => {
      const base = await getApiBaseUrl();
      setApiBaseUrl(base);
    };
    loadBaseUrl();
  }, []);

  const resolvedImageUrl = useMemo(() => {
    const url = device.deviceImageUrl;
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    if (!apiBaseUrl) return null;
    const normalizedBase = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${normalizedBase}${normalizedPath}`;
  }, [device.deviceImageUrl, apiBaseUrl]);

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
      {resolvedImageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: resolvedImageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="information" size={24} color={Colors.primary} />
            <Text style={styles.title}>Thông tin cơ bản</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="barcode" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Mã thiết bị:</Text>
            </View>
            <Text style={styles.value}>{device.deviceCode}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="devices" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Tên thiết bị:</Text>
            </View>
            <Text style={styles.value}>{device.deviceName}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="circle" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Trạng thái:</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(device.status) }]}>
              <Text style={styles.statusText}>{device.status}</Text>
            </View>
          </View>

          {device.serialNumber && (
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="identifier" size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Số serial:</Text>
              </View>
              <Text style={styles.value}>{device.serialNumber}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="package-variant" size={24} color={Colors.primary} />
            <Text style={styles.title}>Thông tin Model</Text>
          </View>
          <Divider style={styles.divider} />
          
          {device.modelName && (
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="cube" size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Model:</Text>
              </View>
              <Text style={styles.value}>{device.modelName}</Text>
            </View>
          )}

          {device.deviceTypeName && (
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="shape" size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Loại thiết bị:</Text>
              </View>
              <Text style={styles.value}>{device.deviceTypeName}</Text>
            </View>
          )}

          {device.manufacturer && (
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="factory" size={16} color={Colors.textSecondary} />
                <Text style={styles.label}>Nhà sản xuất:</Text>
              </View>
              <Text style={styles.value}>{device.manufacturer}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="account-group" size={24} color={Colors.primary} />
            <Text style={styles.title}>Người dùng & Phòng ban</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="account" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Người sử dụng:</Text>
            </View>
            <Text style={styles.value}>{device.currentUserName || 'Chưa cấp phát'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="office-building" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Phòng ban:</Text>
            </View>
            <Text style={styles.value}>{device.departmentName || 'Chưa có'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="history" size={24} color={Colors.primary} />
            <Text style={styles.title}>Lịch sử bảo trì</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="wrench" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Số lần sửa chữa:</Text>
            </View>
            <Text style={styles.value}>{device.repairCount}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Sửa chữa gần nhất:</Text>
            </View>
            <Text style={styles.value}>{formatDate(device.lastRepairDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Số sự cố:</Text>
            </View>
            <Text style={styles.value}>{device.incidentCount}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.primary} />
            <Text style={styles.title}>Thông tin khác</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="calendar" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Ngày mua:</Text>
            </View>
            <Text style={styles.value}>{formatDate(device.purchaseDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="shield-check" size={16} color={Colors.textSecondary} />
              <Text style={styles.label}>Hết bảo hành:</Text>
            </View>
            <Text style={styles.value}>{formatDate(device.warrantyExpiry)}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const getStatusColor = (status?: string) => {
  return Colors.status[status as keyof typeof Colors.status] || Colors.textSecondary;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: Colors.surface,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: Colors.divider,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    height: 24,
  },
});

export default DeviceDetailScreen;

