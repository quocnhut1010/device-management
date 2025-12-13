import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../services/api';
import { DeviceListItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getUserId } from '../services/auth';
import Colors from '../theme/colors';

type UserRole = 'Admin' | 'Manager' | 'Technician' | 'Employee';

interface AdminStats {
  totalDevices: number;
  devicesInUse: number;
  devicesAvailable: number;
  devicesRepairing: number;
  devicesPendingLiquidation: number;
  openIncidents: number;
  activeRepairs: number;
  replacementsThisWeek: number;
  liquidationsThisMonth: number;
  unreadNotifications: number;
}

interface ManagerStats {
  departmentDevices: number;
  devicesInUse: number;
  devicesRepairing: number;
  openIncidents: number;
  availableDevices: number;
  ongoingRepairs: number;
}

interface TechnicianStats {
  repairsPending: number;
  repairsInProgress: number;
  repairsAwaitingApproval: number;
  repairsCompletedThisWeek: number;
  avgRepairTime: string;
}

interface EmployeeStats {
  myDevices: number;
  devicesActive: number;
  devicesRepairing: number;
  myIncidentsOpen: number;
  myIncidentsPending: number;
  activeIssues: number;
  resolvedIncidents: number;
}

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  useEffect(() => {
    determineUserRole();
  }, [user]);

  useEffect(() => {
    if (userRole) {
      loadData();
    }
  }, [userRole, departmentId]);

  const determineUserRole = async () => {
    if (!user) return;

    const role = user.role;
    const position = user.position?.toLowerCase() || '';

    if (role === 'Admin') {
      setUserRole('Admin');
    } else if (role === 'User' && position === 'kỹ thuật viên') {
      setUserRole('Technician');
    } else if (role === 'User' && position === 'trưởng phòng') {
      setUserRole('Manager');
      // Get departmentId for manager
      await fetchDepartmentId();
    } else {
      setUserRole('Employee');
    }
  };

  const fetchDepartmentId = async () => {
    try {
      // Get user profile to get departmentId
      const response = await apiClient.get('/Users/profile');
      if (response.data?.departmentId) {
        setDepartmentId(response.data.departmentId);
      }
    } catch (error) {
      console.error('Error fetching departmentId:', error);
    }
  };

  const loadData = async () => {
    if (!userRole) return;

    try {
      setLoading(true);
      let statsResponse;
      let devicesResponse;

      switch (userRole) {
        case 'Admin':
          statsResponse = await apiClient.get('/Dashboard/admin-stats');
          // For admin, we can still show device list
          try {
            devicesResponse = await apiClient.get('/Device/paged', {
              params: { page: 1, pageSize: 20 },
            });
            if (devicesResponse.data?.devices) {
              setDevices(devicesResponse.data.devices);
            }
          } catch (error) {
            console.error('Error loading devices:', error);
          }
          break;

        case 'Manager':
          // For manager, we need departmentId
          // If we don't have it yet, fetch it first
          if (!departmentId) {
            try {
              const userProfileResponse = await apiClient.get('/Users/profile');
              if (userProfileResponse.data?.departmentId) {
                const deptId = userProfileResponse.data.departmentId;
                setDepartmentId(deptId);
                statsResponse = await apiClient.get('/Dashboard/manager-stats', {
                  params: { departmentId: deptId },
                });
              } else {
                console.error('User profile does not have departmentId');
              }
            } catch (error) {
              console.error('Error getting manager departmentId:', error);
            }
          } else {
            statsResponse = await apiClient.get('/Dashboard/manager-stats', {
              params: { departmentId },
            });
          }
          break;

        case 'Technician':
          statsResponse = await apiClient.get('/Dashboard/technician-stats');
          break;

        case 'Employee':
          statsResponse = await apiClient.get('/Dashboard/employee-stats');
          break;
      }

      if (statsResponse?.data) {
        // Convert PascalCase to camelCase if needed
        const data = statsResponse.data;
        const convertedStats: any = {};
        
        // Helper to convert PascalCase to camelCase
        const toCamelCase = (str: string) => {
          return str.charAt(0).toLowerCase() + str.slice(1);
        };
        
        // Convert all properties
        Object.keys(data).forEach(key => {
          const camelKey = toCamelCase(key);
          convertedStats[camelKey] = data[key];
        });
        
        setStats(convertedStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatsCards = () => {
    if (!userRole) return null;

    switch (userRole) {
      case 'Admin':
        return renderAdminStats();
      case 'Manager':
        return renderManagerStats();
      case 'Technician':
        return renderTechnicianStats();
      case 'Employee':
        return renderEmployeeStats();
      default:
        return null;
    }
  };

  const renderAdminStats = () => {
    const adminStats = stats as AdminStats;
    return (
      <>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>{adminStats.totalDevices || 0}</Text>
            <Text style={styles.statLabel}>Tổng số thiết bị</Text>
          </Card.Content>
        </Card>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.success + '20' }]}>
                <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {adminStats.devicesInUse || 0}
              </Text>
              <Text style={styles.statLabel}>Đang sử dụng</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.info + '20' }]}>
                <MaterialCommunityIcons name="package-variant" size={24} color={Colors.info} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.info }]}>
                {adminStats.devicesAvailable || 0}
              </Text>
              <Text style={styles.statLabel}>Có sẵn</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.warning + '20' }]}>
                <MaterialCommunityIcons name="wrench" size={24} color={Colors.warning} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.warning }]}>
                {adminStats.devicesRepairing || 0}
              </Text>
              <Text style={styles.statLabel}>Đang sửa</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.error + '20' }]}>
                <MaterialCommunityIcons name="clock-alert" size={24} color={Colors.error} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.error }]}>
                {adminStats.devicesPendingLiquidation || 0}
              </Text>
              <Text style={styles.statLabel}>Chờ thanh lý</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                <MaterialCommunityIcons name="alert-circle" size={24} color={Colors.secondary} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.secondary }]}>
                {adminStats.openIncidents || 0}
              </Text>
              <Text style={styles.statLabel}>Sự cố mở</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.info + '20' }]}>
                <MaterialCommunityIcons name="tools" size={24} color={Colors.info} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.info }]}>
                {adminStats.activeRepairs || 0}
              </Text>
              <Text style={styles.statLabel}>Sửa chữa đang thực hiện</Text>
            </Card.Content>
          </Card>
        </View>
      </>
    );
  };

  const renderManagerStats = () => {
    const managerStats = stats as ManagerStats;
    return (
      <>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: Colors.primary + '20' }]}>
              <MaterialCommunityIcons name="office-building" size={32} color={Colors.primary} />
            </View>
            <Text style={[styles.statNumber, { color: Colors.primary }]}>
              {managerStats.departmentDevices || 0}
            </Text>
            <Text style={styles.statLabel}>Thiết bị phòng ban</Text>
          </Card.Content>
        </Card>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.success + '20' }]}>
                <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {managerStats.devicesInUse || 0}
              </Text>
              <Text style={styles.statLabel}>Đang sử dụng</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.info + '20' }]}>
                <MaterialCommunityIcons name="package-variant" size={24} color={Colors.info} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.info }]}>
                {managerStats.availableDevices || 0}
              </Text>
              <Text style={styles.statLabel}>Có sẵn</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.warning + '20' }]}>
                <MaterialCommunityIcons name="wrench" size={24} color={Colors.warning} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.warning }]}>
                {managerStats.devicesRepairing || 0}
              </Text>
              <Text style={styles.statLabel}>Đang sửa</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                <MaterialCommunityIcons name="alert-circle" size={24} color={Colors.secondary} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.secondary }]}>
                {managerStats.openIncidents || 0}
              </Text>
              <Text style={styles.statLabel}>Sự cố mở</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: Colors.info + '20' }]}>
              <MaterialCommunityIcons name="tools" size={32} color={Colors.info} />
            </View>
            <Text style={[styles.statNumber, { color: Colors.info }]}>
              {managerStats.ongoingRepairs || 0}
            </Text>
            <Text style={styles.statLabel}>Sửa chữa đang thực hiện</Text>
          </Card.Content>
        </Card>
      </>
    );
  };

  const renderTechnicianStats = () => {
    const techStats = stats as TechnicianStats;
    return (
      <>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.warning + '20' }]}>
                <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.warning} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.warning }]}>
                {techStats.repairsPending || 0}
              </Text>
              <Text style={styles.statLabel}>Chờ xử lý</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.info + '20' }]}>
                <MaterialCommunityIcons name="wrench" size={24} color={Colors.info} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.info }]}>
                {techStats.repairsInProgress || 0}
              </Text>
              <Text style={styles.statLabel}>Đang thực hiện</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                <MaterialCommunityIcons name="clock-check" size={24} color={Colors.secondary} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.secondary }]}>
                {techStats.repairsAwaitingApproval || 0}
              </Text>
              <Text style={styles.statLabel}>Chờ phê duyệt</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.success + '20' }]}>
                <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {techStats.repairsCompletedThisWeek || 0}
              </Text>
              <Text style={styles.statLabel}>Hoàn thành tuần này</Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: Colors.info + '20' }]}>
              <MaterialCommunityIcons name="timer" size={32} color={Colors.info} />
            </View>
            <Text style={[styles.statNumber, { color: Colors.info, fontSize: 24 }]}>
              {techStats.avgRepairTime || 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Thời gian sửa trung bình</Text>
          </Card.Content>
        </Card>
      </>
    );
  };

  const renderEmployeeStats = () => {
    const empStats = stats as EmployeeStats;
    return (
      <>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: Colors.primary + '20' }]}>
              <MaterialCommunityIcons name="devices" size={32} color={Colors.primary} />
            </View>
            <Text style={[styles.statNumber, { color: Colors.primary }]}>
              {empStats.myDevices || 0}
            </Text>
            <Text style={styles.statLabel}>Thiết bị của tôi</Text>
          </Card.Content>
        </Card>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.success + '20' }]}>
                <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {empStats.devicesActive || 0}
              </Text>
              <Text style={styles.statLabel}>Thiết bị đang hoạt động</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.warning + '20' }]}>
                <MaterialCommunityIcons name="wrench" size={24} color={Colors.warning} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.warning }]}>
                {empStats.devicesRepairing || 0}
              </Text>
              <Text style={styles.statLabel}>Thiết bị đang sửa</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                <MaterialCommunityIcons name="alert-circle" size={24} color={Colors.secondary} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.secondary }]}>
                {empStats.myIncidentsOpen || 0}
              </Text>
              <Text style={styles.statLabel}>Sự cố mở</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.error + '20' }]}>
                <MaterialCommunityIcons name="clock-alert" size={24} color={Colors.error} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.error }]}>
                {empStats.myIncidentsPending || 0}
              </Text>
              <Text style={styles.statLabel}>Sự cố chờ xử lý</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.info + '20' }]}>
                <MaterialCommunityIcons name="alert" size={24} color={Colors.info} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.info }]}>
                {empStats.activeIssues || 0}
              </Text>
              <Text style={styles.statLabel}>Vấn đề đang hoạt động</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.statCardHalf]}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.success + '20' }]}>
                <MaterialCommunityIcons name="check-all" size={24} color={Colors.success} />
              </View>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {empStats.resolvedIncidents || 0}
              </Text>
              <Text style={styles.statLabel}>Sự cố đã giải quyết</Text>
            </Card.Content>
          </Card>
        </View>
      </>
    );
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
        <Text style={styles.statsTitle}>
          {userRole === 'Admin' && 'Thống kê tổng quan'}
          {userRole === 'Manager' && 'Thống kê phòng ban'}
          {userRole === 'Technician' && 'Thống kê sửa chữa'}
          {userRole === 'Employee' && 'Thống kê của tôi'}
        </Text>
        
        {renderStatsCards()}
      </View>

      {userRole === 'Admin' && devices.length > 0 && (
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
      )}
    </ScrollView>
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
  },
  statsContainer: {
    padding: 16,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  statCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: Colors.surface,
  },
  statCardHalf: {
    width: '48%',
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  devicesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  deviceCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    backgroundColor: Colors.surface,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  deviceCode: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
  deviceUser: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});

export default DashboardScreen;

