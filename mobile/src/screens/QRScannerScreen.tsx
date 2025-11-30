import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../services/api';
import { DeviceQrScanResult, RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';

type QRScannerNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QRScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const navigation = useNavigation<QRScannerNavigationProp>();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const alertShownRef = useRef(false);
  const processingRef = useRef(false);

  const resetScannerState = useCallback(() => {
    processingRef.current = false;
    setScanned(false);
    setScanningEnabled(true);
  }, []);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (!scanningEnabled || scanned || loading || processingRef.current) return;

    setScanningEnabled(false);
    setScanned(true);
    setLoading(true);
    processingRef.current = true;

    try {
      // Determine if payload looks like a GUID token
      const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(data.trim());
      const encoded = encodeURIComponent(data.trim());
      const url = isGuid
        ? `/Device/by-token/${encoded}`
        : `/Device/by-code/${encoded}`;

      const response = await apiClient.get<DeviceQrScanResult>(url);
      
      if (response.status === 200 && response.data) {
        setLoading(false);
        const device = response.data;
        const isEmployee = user?.role === 'User' && user?.position === 'Nhân viên';

        if (isEmployee) {
          Alert.alert(
            'Thiết bị của bạn',
            'Bạn muốn thực hiện hành động nào?',
            [
              {
                text: 'Xem chi tiết',
                onPress: () => {
                  resetScannerState();
                  navigation.navigate('DeviceDetail', { device });
                },
              },
              {
                text: 'Báo cáo sự cố',
                onPress: () => {
                  resetScannerState();
                  navigation.navigate('IncidentReport', { device });
                },
              },
              {
                text: 'Huỷ',
                style: 'cancel',
                onPress: () => resetScannerState(),
              },
            ],
            { cancelable: true }
          );
        } else {
          resetScannerState();
          navigation.navigate('DeviceDetail', { device });
        }
      }
    } catch (error: any) {
      console.log('QR Scan error:', error);
      const status = error.response?.status;
      
      if (status === 403 || status === 404) {
        if (!alertShownRef.current) {
          alertShownRef.current = true;
          Alert.alert(
            'Không đủ quyền',
            'Bạn không có đủ quyền hạn để quét thiết bị này.',
            [
              {
                text: 'OK',
                onPress: () => {
                  alertShownRef.current = false;
                  resetScannerState();
                },
              },
            ]
          );
        }
      } else {
        Alert.alert(
          'Lỗi',
          'Có lỗi xảy ra khi quét mã QR. Vui lòng thử lại.',
          [
            {
              text: 'Quét lại',
              onPress: () => resetScannerState(),
            },
          ]
        );
      }
    } finally {
      setLoading(false);
      if (!processingRef.current) {
        resetScannerState();
      }
    }
  };

  // Enable scanning only when screen is focused
  useFocusEffect(
    useCallback(() => {
      setScanningEnabled(true);
      alertShownRef.current = false;
      return () => {
        setScanningEnabled(false);
      };
    }, [])
  );

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
      {isFocused ? (
        <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned || !scanningEnabled ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        />
      ) : null}
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
