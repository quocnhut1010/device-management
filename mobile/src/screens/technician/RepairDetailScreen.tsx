import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Repair, getRepairStatusColor, getRepairStatusText, RepairStatus } from '../../types';
import repairService from '../../services/repair';
import CompleteRepairModal from '../../components/technician/CompleteRepairModal';
import { getApiBaseUrl } from '../../utils/baseUrl';
import RejectRepairModal from '../../components/technician/RejectRepairModal';
import { useAuth } from '../../contexts/AuthContext';

type RepairDetailRouteProp = RouteProp<RootStackParamList, 'RepairDetail'>;

interface Props {
  route: RepairDetailRouteProp;
}

const RepairDetailScreen: React.FC<Props> = ({ route }) => {
  const initialRepair = route.params.repair;
  const [repair, setRepair] = useState<Repair | null>(initialRepair);
  const [loading, setLoading] = useState(!initialRepair);
  const [actionLoading, setActionLoading] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const currentUserId = user?.nameid;

  const loadRepairDetail = useCallback(async () => {
    try {
      setLoading(true);
      const latest = await repairService.getRepairById(initialRepair.id);
      setRepair(latest);
    } catch (error) {
      console.error('Error loading repair detail:', error);
    } finally {
      setLoading(false);
    }
  }, [initialRepair.id]);

  useEffect(() => {
    loadRepairDetail();
  }, [loadRepairDetail]);

  useEffect(() => {
    const loadBaseUrl = async () => {
      const base = await getApiBaseUrl();
      setApiBaseUrl(base);
    };
    loadBaseUrl();
  }, []);

  const handleAccept = async () => {
    if (!repair) return;
    try {
      setActionLoading(true);
      await repairService.acceptRepair(repair.id);
      await loadRepairDetail();
    } catch (error) {
      console.error('Error accepting repair:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCompleteModal = () => {
    setCompleteModalVisible(true);
  };

  const handleCloseCompleteModal = () => {
    setCompleteModalVisible(false);
  };

  const handleCompleteSuccess = () => {
    loadRepairDetail();
  };

  const canRejectOrNotNeeded = !!(
    repair &&
    (repair.status === RepairStatus.ChoThucHien || repair.status === RepairStatus.DangSua) &&
    (!!repair.technicianId ? repair.technicianId === currentUserId : !!currentUserId)
  );

  const handleRejectSuccess = () => {
    loadRepairDetail();
  };

  const staticBaseUrl = useMemo(() => {
    if (!apiBaseUrl) return null;
    return apiBaseUrl.replace(/\/api\/?$/, '');
  }, [apiBaseUrl]);

  const buildImageUrl = useCallback(
    (url?: string) => {
      if (!url) return undefined;
      if (/^https?:\/\//i.test(url)) {
        return url;
      }
      if (!staticBaseUrl) return undefined;
      const normalizedBase = staticBaseUrl.replace(/\/$/, '');
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return `${normalizedBase}${normalizedPath}`;
    },
    [staticBaseUrl]
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

  if (loading || !repair) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={[styles.statusBadge, { backgroundColor: getRepairStatusColor(repair.status) }]}>
            <Text style={styles.statusText}>
              {getRepairStatusText(repair.status)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {repair.rejectedReason && (
        <Card style={[styles.card, styles.rejectedCard]}>
          <Card.Content>
            <Text style={styles.rejectedTitle}>Lý do từ chối gần nhất</Text>
            <Text style={styles.rejectedReason}>{repair.rejectedReason}</Text>
            {repair.rejectedAt && (
              <Text style={styles.rejectedMeta}>Cập nhật: {formatDateTime(repair.rejectedAt)}</Text>
            )}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Mô tả sự cố</Text>
          <Text style={styles.description}>
            {repair.description || 'Chưa có mô tả'}
          </Text>
        </Card.Content>
      </Card>

      {repair.repairImages && repair.repairImages.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Ảnh sau sửa chữa</Text>
            <View style={styles.imagesGrid}>
              {repair.repairImages.map((image) => {
                const absoluteUrl = buildImageUrl(image.imageUrl);
                if (!absoluteUrl) return null;
                return <Image key={image.id} source={{ uri: absoluteUrl }} style={styles.repairImage} />;
              })}
            </View>
          </Card.Content>
        </Card>
      )}

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

      <View style={styles.footer}>
        {repair.status === RepairStatus.ChoThucHien && (
          <Button
            mode="contained"
            onPress={handleAccept}
            loading={actionLoading}
            style={styles.footerButton}
          >
            Tiếp nhận lệnh
          </Button>
        )}
        {repair.status === RepairStatus.DangSua && (
          <Button
            mode="contained"
            onPress={handleOpenCompleteModal}
            style={styles.footerButton}
          >
            Hoàn thành sửa chữa
          </Button>
        )}
        {canRejectOrNotNeeded && (
          <Button
            mode="outlined"
            onPress={() => setRejectModalVisible(true)}
            style={styles.footerButton}
          >
            Từ chối / Không cần sửa
          </Button>
        )}
      </View>

      </ScrollView>

      <CompleteRepairModal
        visible={completeModalVisible}
        repair={repair}
        onDismiss={handleCloseCompleteModal}
        onSuccess={handleCompleteSuccess}
      />
      <RejectRepairModal
        visible={rejectModalVisible}
        repair={repair}
        onDismiss={() => setRejectModalVisible(false)}
        onSuccess={handleRejectSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 16,
  },
  footerButton: {
    marginTop: 8,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  repairImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  rejectedCard: {
    borderColor: '#f44336',
  },
  rejectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  rejectedReason: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 4,
  },
  rejectedMeta: {
    fontSize: 12,
    color: '#757575',
  },
});

export default RepairDetailScreen;

