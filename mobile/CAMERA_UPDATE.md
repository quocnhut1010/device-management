# QR Scanner Update: expo-barcode-scanner → expo-camera

## Thay đổi

Đã chuyển từ `expo-barcode-scanner` sang `expo-camera` để tương thích với Expo Go trên iOS.

## Lý do

- `expo-barcode-scanner` yêu cầu native module không có trong Expo Go
- `expo-camera` đã được tích hợp sẵn trong Expo Go
- Không cần build native app, chạy ngay trên iPhone

## Files đã thay đổi

### 1. `package.json`
- ❌ Removed: `expo-barcode-scanner`
- ✅ Added: `expo-camera`

### 2. `app.json`
```json
"plugins": [
  [
    "expo-camera",
    {
      "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera to scan QR codes."
    }
  ]
]
```

### 3. `src/screens/QRScannerScreen.tsx`
**Thay đổi imports:**
```typescript
// Before
import { BarCodeScanner } from 'expo-barcode-scanner';

// After
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
```

**Thay đổi component:**
```typescript
// Before
<BarCodeScanner
  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
  style={StyleSheet.absoluteFillObject}
/>

// After
<CameraView
  style={StyleSheet.absoluteFillObject}
  facing="back"
  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
  barcodeScannerSettings={{
    barcodeTypes: ['qr'],
  }}
/>
```

**Thay đổi permission:**
```typescript
// Before
await BarCodeScanner.requestPermissionsAsync();

// After
await Camera.requestCameraPermissionsAsync();
```

## Cách test

1. **Restart Expo:**
   ```bash
   cd mobile
   npm start
   ```

2. **Quét QR code bằng Expo Go** trên iPhone

3. **Test QR Scanner:**
   - Mở tab "Quét QR"
   - Cho phép camera
   - Quét QR code thiết bị
   - Verify: 200 OK → hiển thị chi tiết, 403 → thông báo lỗi quyền

## Tính năng giữ nguyên

- ✅ Quét QR code
- ✅ Phân quyền theo role (Admin/Nhân viên/Kỹ thuật viên)
- ✅ Handle 200/403/404
- ✅ Loading state
- ✅ Scan again button
- ✅ UI overlay

## Bonus

`expo-camera` còn hỗ trợ:
- Chụp ảnh (dùng cho báo cáo sự cố sau này)
- Video recording
- Flash control
- Zoom

## Notes

- Không cần rebuild app
- Chạy ngay trên Expo Go
- TypeScript: ✅ No errors
- Linter: ✅ No errors

