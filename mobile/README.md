# Device Management Mobile App

Ứng dụng React Native được xây dựng với Expo Go để quản lý thiết bị trên mobile.

## Tính năng chính

### Đăng nhập & Phân quyền
- Đăng nhập JWT với API backend
- Hỗ trợ 3 vai trò: Admin, Nhân viên, Kỹ thuật viên
- Lưu trữ token với AsyncStorage

### Admin
- Dashboard với thống kê tổng quan:
  - Tổng số thiết bị
  - Đang sử dụng, Đang sửa, Chờ thanh lý
- Danh sách thiết bị với filter
- Quét QR code để xem tất cả thiết bị

### Nhân viên
- Xem danh sách thiết bị được cấp phát
- Quét QR code để xem chi tiết thiết bị của mình
- Pull-to-refresh

### Kỹ thuật viên
- Xem danh sách lệnh sửa chữa được giao
- Xem chi tiết lệnh sửa (thông tin thiết bị, trạng thái, chi phí)
- Quét QR code để kiểm tra thiết bị trong lệnh sửa

## Công nghệ sử dụng

- **Framework**: React Native + Expo Go
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **QR Scanner**: expo-barcode-scanner
- **State Management**: Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **JWT**: jwt-decode

## Cài đặt và chạy

### Prerequisites
- Node.js 16+ 
- Expo CLI: `npm install -g expo-cli`
- Expo Go app trên điện thoại (iOS/Android)

### Setup
```bash
cd mobile
npm install
```

### Chạy app
```bash
npm start
# Hoặc
expo start
```

Quét QR code bằng Expo Go app để mở app trên thiết bị.

### Cấu hình API

Mặc định API URL là `http://localhost:5264/api`. Nếu chạy trên thiết bị thật, cần đổi IP trong:
- `src/services/api.ts` - đổi `API_BASE_URL` thành IP máy tính của bạn

Ví dụ: `http://192.168.1.100:5264/api`

## Cấu trúc thư mục

```
mobile/
├── src/
│   ├── contexts/          # AuthContext
│   ├── navigation/        # AppNavigator, Tabs
│   ├── screens/           # Màn hình
│   │   ├── admin/
│   │   ├── employee/
│   │   ├── technician/
│   │   ├── LoginScreen.tsx
│   │   ├── QRScannerScreen.tsx
│   │   └── DeviceDetailScreen.tsx
│   ├── services/          # API, Auth services
│   └── types/             # TypeScript types
├── App.tsx               # Entry point
└── app.json              # Expo config
```

## Backend API Endpoints

- `POST /api/Auth/login` - Đăng nhập
- `GET /api/Device/paged` - Danh sách thiết bị (Admin)
- `GET /api/Device/my` - Thiết bị của tôi (Nhân viên)
- `GET /api/Device/by-code/{code}` - Lấy thiết bị theo mã QR (phân quyền)
- `GET /api/Repair/mine` - Lệnh sửa của tôi (Kỹ thuật viên)

## Notes

- App chỉ xem và quét QR, không có CRUD
- QR code phải chứa `DeviceCode` để quét được
- Backend phải chạy trước khi test mobile app
- Sử dụng Expo Go để test nhanh, không cần build native

