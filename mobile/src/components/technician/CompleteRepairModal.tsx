import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Modal, Portal, RadioButton, Text, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import repairService, { RepairRequestDto } from '../../services/repair';
import { Repair } from '../../types';

interface CompleteRepairModalProps {
  visible: boolean;
  repair: Repair | null;
  onDismiss: () => void;
  onSuccess: () => void;
}

const CompleteRepairModal: React.FC<CompleteRepairModalProps> = ({ visible, repair, onDismiss, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [companyType, setCompanyType] = useState<'internal' | 'external'>('internal');
  const [repairCompany, setRepairCompany] = useState('');
  const [cost, setCost] = useState<string>('');
  const [laborHours, setLaborHours] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && repair) {
      setDescription(repair.description || '');
      setCompanyType(repair.repairCompany && repair.repairCompany !== 'Nội bộ' ? 'external' : 'internal');
      setRepairCompany(repair.repairCompany && repair.repairCompany !== 'Nội bộ' ? repair.repairCompany : '');
      setCost(repair.cost ? String(repair.cost) : '');
      setLaborHours(repair.laborHours ? String(repair.laborHours) : '');
      setSelectedImages([]);
      setError('');
    }
  }, [visible, repair]);

  const requestPermission = async (type: 'camera' | 'media') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === ImagePicker.PermissionStatus.GRANTED;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === ImagePicker.PermissionStatus.GRANTED;
  };

  const handlePickImage = async (source: 'camera' | 'library') => {
    const permitted = await requestPermission(source === 'camera' ? 'camera' : 'media');
    if (!permitted) {
      setError('Ứng dụng cần quyền truy cập camera/thư viện');
      return;
    }

    const pickerFn =
      source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const result = await pickerFn({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const images = result.assets ? result.assets : [result as ImagePicker.ImagePickerAsset];
      setSelectedImages((prev) => [...prev, ...images]);
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!repair) return;
    if (!description.trim()) {
      setError('Vui lòng nhập mô tả công việc đã thực hiện');
      return;
    }

    if (companyType === 'external' && !repairCompany.trim()) {
      setError('Vui lòng nhập tên đơn vị sửa chữa');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await repairService.uploadRepairImages(
          repair.id,
          selectedImages.map((image, index) => ({
            uri: image.uri,
            name: image.fileName || `repair-${repair.id}-${index}.jpg`,
            type: image.mimeType || 'image/jpeg',
          }))
        );
      }

      const payload: RepairRequestDto = {
        description: description.trim(),
        cost: companyType === 'external' && cost ? Number(cost) : undefined,
        laborHours: companyType === 'external' && laborHours ? Number(laborHours) : undefined,
        repairCompany: companyType === 'external' ? repairCompany.trim() : 'Nội bộ',
        imageUrls,
      };

      await repairService.completeRepair(repair.id, payload);
      onSuccess();
      onDismiss();
    } catch (submitError) {
      console.error('Error completing repair:', submitError);
      setError('Không thể hoàn thành sửa chữa. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        {!repair ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          <>
            <Text style={styles.modalTitle}>Hoàn thành sửa chữa</Text>
            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <TextInput
                label="Mô tả công việc"
                value={description}
                onChangeText={setDescription}
                multiline
                mode="outlined"
              />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đơn vị sửa chữa</Text>
                <RadioButton.Group
                  onValueChange={(value) => setCompanyType(value as 'internal' | 'external')}
                  value={companyType}
                >
                  <View style={styles.radioRow}>
                    <RadioButton value="internal" />
                    <Text>Nội bộ</Text>
                  </View>
                  <View style={styles.radioRow}>
                    <RadioButton value="external" />
                    <Text>Bên ngoài</Text>
                  </View>
                </RadioButton.Group>
              </View>

              {companyType === 'external' && (
                <>
                  <TextInput
                    label="Tên công ty sửa chữa"
                    value={repairCompany}
                    onChangeText={setRepairCompany}
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="Chi phí (VND)"
                    value={cost}
                    onChangeText={setCost}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="Giờ công"
                    value={laborHours}
                    onChangeText={setLaborHours}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                  />
                </>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ảnh minh chứng</Text>
                <View style={styles.buttonsRow}>
                  <Button
                    mode="outlined"
                    onPress={() => handlePickImage('camera')}
                    style={styles.buttonHalf}
                  >
                    Chụp ảnh
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handlePickImage('library')}
                    style={styles.buttonHalf}
                  >
                    Chọn ảnh
                  </Button>
                </View>

                <View style={styles.imageGrid}>
                  {selectedImages.map((image) => (
                    <View key={image.uri} style={styles.imageWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.previewImage} />
                      <Button
                        mode="contained"
                        compact
                        onPress={() => removeImage(image.uri)}
                        style={styles.removeButton}
                      >
                        Xóa
                      </Button>
                    </View>
                  ))}
                </View>
              </View>

              {error ? <HelperText type="error">{error}</HelperText> : null}
            </ScrollView>

            <View style={styles.actions}>
              <Button onPress={onDismiss} disabled={loading} style={styles.dismissButton}>
                Hủy
              </Button>
              <Button mode="contained" onPress={handleSubmit} loading={loading}>
                Gửi duyệt
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  form: {
    flexGrow: 0,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginTop: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  imageWrapper: {
    width: 100,
    height: 140,
    marginRight: 12,
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  dismissButton: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default CompleteRepairModal;

