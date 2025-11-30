import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceQrScanResult, RootStackParamList } from '../../types';
import incidentService from '../../services/incident';

type IncidentReportRouteProp = RouteProp<RootStackParamList, 'IncidentReport'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  route: IncidentReportRouteProp;
}

const REPORT_TYPES = [
  'Hỏng hóc phần cứng',
  'Lỗi phần mềm',
  'Mất mát thiết bị',
  'Hư hỏng vật lý',
  'Lỗi kết nối mạng',
  'Khác',
];

const IncidentReportScreen: React.FC<Props> = ({ route }) => {
  const { device } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const [reportType, setReportType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Quyền camera', 'Vui lòng cấp quyền camera để chụp ảnh.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!reportType) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn loại sự cố.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mô tả chi tiết sự cố.');
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl: string | undefined;

      if (selectedImage) {
        imageUrl = await incidentService.uploadIncidentImage({
          uri: selectedImage.uri,
          name: selectedImage.fileName || 'incident.jpg',
          type: selectedImage.mimeType || 'image/jpeg',
        });
      }

      await incidentService.createIncident({
        deviceId: device.id,
        reportType,
        description: description.trim(),
        imageUrl,
      });

      Alert.alert(
        'Thành công',
        'Báo cáo sự cố đã được gửi tới quản trị viên.',
        [
          {
            text: 'Đóng',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Create incident error:', error);
      const message =
        error?.response?.data?.message || 'Không thể gửi báo cáo. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Thiết bị" subtitle="Bạn đang báo cáo sự cố cho thiết bị này" />
        <Card.Content>
          <Text style={styles.deviceName}>{device.deviceName}</Text>
          <Text style={styles.deviceCode}>Mã: {device.deviceCode}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Text style={styles.value}>{device.status}</Text>
          </View>
          {device.departmentName && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phòng ban:</Text>
              <Text style={styles.value}>{device.departmentName}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Thông tin sự cố" />
        <Card.Content>
          <Text style={styles.sectionLabel}>Loại sự cố *</Text>
          <View style={styles.chipContainer}>
            {REPORT_TYPES.map((type) => (
              <Chip
                key={type}
                onPress={() => setReportType(type)}
                selected={reportType === type}
                style={styles.chip}
              >
                {type}
              </Chip>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Mô tả chi tiết *</Text>
          <TextInput
            mode="outlined"
            placeholder="Mô tả triệu chứng, thời gian xảy ra..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <Text style={styles.sectionLabel}>Ảnh minh chứng (tuỳ chọn)</Text>
          {selectedImage ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              <Button
                mode="outlined"
                onPress={() => setSelectedImage(null)}
                style={styles.removeImageButton}
              >
                Xoá ảnh
              </Button>
            </View>
          ) : (
            <View style={styles.imageButtonRow}>
              <Button
                mode="outlined"
                icon="camera"
                style={styles.imageButton}
                onPress={handleTakePhoto}
              >
                Chụp ảnh
              </Button>
              <Button
                mode="outlined"
                icon="image"
                style={styles.imageButton}
                onPress={handlePickImage}
              >
                Chọn ảnh
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={submitting}
        style={styles.submitButton}
      >
        {submitting ? <ActivityIndicator animating color="#fff" /> : 'Gửi báo cáo'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceCode: {
    color: '#757575',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#757575',
  },
  value: {
    fontWeight: '600',
  },
  sectionLabel: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  textArea: {
    marginBottom: 8,
  },
  imageButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    marginRight: 8,
  },
  imagePreviewWrapper: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    alignSelf: 'flex-start',
  },
  submitButton: {
    marginTop: 8,
  },
});

export default IncidentReportScreen;


