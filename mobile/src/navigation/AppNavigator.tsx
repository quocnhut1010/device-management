import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import AdminTabs from './AdminTabs';
import EmployeeTabs from './EmployeeTabs';
import TechnicianTabs from './TechnicianTabs';
import DeviceDetailScreen from '../screens/DeviceDetailScreen';
import RepairDetailScreen from '../screens/technician/RepairDetailScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Wait for auth to initialize
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Log auth state changes for debugging
  React.useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, user: user?.email });
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!isAuthenticated) {
      return 'Login';
    }

    const role = user?.role;
    const position = user?.position;

    if (role === 'Admin') {
      return 'AdminTabs';
    } else if (role === 'User' && position === 'Kỹ thuật viên') {
      return 'TechnicianTabs';
    } else {
      return 'EmployeeTabs';
    }
  };

  // Key để force re-render NavigationContainer when auth state changes
  const navKey = isAuthenticated ? 'authenticated' : 'unauthenticated';

  return (
    <NavigationContainer key={navKey}>
      <Stack.Navigator
        initialRouteName={getInitialRoute() as keyof RootStackParamList}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdminTabs" 
          component={AdminTabs}
          options={{ title: 'Device Management - Admin' }}
        />
        <Stack.Screen 
          name="EmployeeTabs" 
          component={EmployeeTabs}
          options={{ title: 'Thiết bị của tôi' }}
        />
        <Stack.Screen 
          name="TechnicianTabs" 
          component={TechnicianTabs}
          options={{ title: 'Lệnh sửa chữa' }}
        />
        <Stack.Screen 
          name="DeviceDetail" 
          component={DeviceDetailScreen}
          options={{ title: 'Chi tiết thiết bị' }}
        />
        <Stack.Screen 
          name="RepairDetail" 
          component={RepairDetailScreen}
          options={{ title: 'Chi tiết lệnh sửa' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;

