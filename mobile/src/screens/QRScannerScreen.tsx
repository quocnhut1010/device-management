import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../services/api';
import { DeviceQrScanResult, RootStackParamList } from '../types';

type QRScannerNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QRScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<QRScannerNavigationProp>();

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      // Call backend endpoint to get device by code
      const response = await apiClient.get<DeviceQrScanResult>(`/Device/by-code/${data}`);
      
      if (response.status === 200 && response.data) {
        // Navigate to device detail screen
        navigation.navigate('DeviceDetail', { device: response.data });
      }
    } catch (error: any) {
      console.error('QR Scan error:', error);
      const status = error.response?.status;
      
      if (status === 403) {
        Alert.alert(
          'Không đủ quyền',
          'Bạn không có quyền truy cập thiết bị này.'
        );
      } else if (status === 404) {
        Alert.alert(
          'Không tìm thấy',
          'Không tìm thấy thiết bị với mã này.'
        );
      } else {
        Alert.alert(
          'Lỗi',
          'Có lỗi xảy ra khi quét mã QR. Vui lòng thử lại.'
        );
      }
    } finally {
      setLoading(false);
      // Allow scanning again after 2 seconds
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.message}>Đang yêu cầu quyền truy cập camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không có quyền truy cập camera</Text>
        <Button
          mode="contained"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
          style={styles.button}
        >
          Cho phép camera
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Đang xử lý...</Text>
            </View>
          )}
        </View>
      </View>
      {scanned && !loading && (
        <Button
          mode="contained"
          onPress={() => setScanned(false)}
          style={styles.scanAgainButton}
        >
          Quét lại
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6200ee',
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    paddingHorizontal: 40,
  },
});

export default QRScannerScreen;
