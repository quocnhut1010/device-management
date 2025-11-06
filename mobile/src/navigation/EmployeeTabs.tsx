import React from 'react';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import MyDevicesScreen from '../screens/employee/MyDevicesScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import { EmployeeTabParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator<EmployeeTabParamList>();

const EmployeeTabs: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        unmountOnBlur: true,
        detachInactiveScreens: true,
      }}
    >
      <Tab.Screen
        name="MyDevices"
        component={MyDevicesScreen}
        options={({ navigation }) => ({
          title: 'Thiết bị của tôi',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="devices" color={color} size={size} />
          ),
          headerRight: () => (
            <IconButton
              icon="logout"
              iconColor="#fff"
              size={24}
              onPress={handleLogout}
            />
          ),
        })}
      />
      <Tab.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          title: 'Quét QR',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" color={color} size={size} />
          ),
          unmountOnBlur: true,
        }}
      />
    </Tab.Navigator>
  );
};

export default EmployeeTabs;

