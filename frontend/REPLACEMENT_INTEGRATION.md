# Tích hợp tính năng Thay thế thiết bị

## Tổng quan

Tính năng thay thế thiết bị đã được triển khai đầy đủ với:
- ✅ Backend API hoàn chỉnh
- ✅ Frontend components và pages
- ✅ Routing và navigation  
- ✅ Component tái sử dụng cho tích hợp

## Cách sử dụng

### 1. Truy cập trang quản lý thay thế

- **URL**: `/replacements`
- **Quyền**: Admin (tạo replacement), User (xem lịch sử)
- **Navigation**: Sidebar → "Thay thế"

### 2. Sử dụng ReplacementButton trong các trang khác

#### Import component:
```tsx
import { ReplacementButton } from '../components/replacement';
```

#### Trong Device Table/List:
```tsx
<ReplacementButton
  device={device}
  variant="iconButton"
  onSuccess={() => refreshData()}
/>
```

#### Trong Device Details Dialog:
```tsx
<ReplacementButton
  device={device}
  variant="button"
  onSuccess={() => handleRefresh()}
/>
```

#### Trong Incident Report Details:
```tsx
<ReplacementButton
  device={device}
  variant="menuItem"
  incidentReportId={incidentReport.id}
  onSuccess={() => refreshIncidents()}
/>
```

## Các thành phần chính

### 1. Backend API

**Endpoints**:
- `GET /api/replacement/suggested-devices/{oldDeviceId}` - Lấy thiết bị đề xuất
- `GET /api/replacement/available-devices` - Lấy tất cả thiết bị available
- `POST /api/replacement` - Tạo replacement
- `GET /api/replacement/history` - Lịch sử thay thế
- `GET /api/replacement/{id}` - Chi tiết replacement

### 2. Frontend Components

#### **SelectReplacementDeviceDialog**
Dialog chọn thiết bị thay thế với:
- Tìm kiếm và lọc thiết bị
- Hiển thị thiết bị đề xuất (cùng model)
- Form nhập lý do thay thế

#### **ReplacementHistoryList**
Danh sách lịch sử thay thế với:
- Bảng hiển thị thông tin replacement
- Tìm kiếm và lọc
- Xem chi tiết replacement

#### **ReplacementDetailsDialog**
Dialog hiển thị chi tiết replacement với:
- Luồng thay thế (old → new device)
- Thông tin người dùng
- Ngày tháng và lý do

#### **ReplacementButton**
Component tái sử dụng với 3 variants:
- `button`: Button thông thường
- `iconButton`: Icon button nhỏ gọn  
- `menuItem`: Menu item trong dropdown

### 3. Types và Interfaces

```typescript
interface ReplacementDto {
  id: string;
  oldDeviceId?: string;
  newDeviceId?: string;
  replacementDate?: string;
  reason?: string;
  oldDeviceCode?: string;
  oldDeviceName?: string;
  newDeviceCode?: string;
  newDeviceName?: string;
  userId?: string;
  userFullName?: string;
  userEmail?: string;
}

interface CreateReplacementDto {
  oldDeviceId: string;
  newDeviceId: string;
  reason: string;
  incidentReportId?: string;
}

interface SuggestedDeviceDto {
  id: string;
  deviceCode: string;
  deviceName: string;
  modelName: string;
  typeName: string;
  status: string;
  purchaseDate?: string;
  purchasePrice?: number;
  deviceImageUrl?: string;
  isSameModel: boolean;
}
```

## Hướng dẫn tích hợp trong các trang hiện có

### 1. Device List Page

Thêm cột "Thao tác" với ReplacementButton:

```tsx
// Trong DeviceTable.tsx
import { ReplacementButton } from '../components/replacement';

// Thêm vào actions column
<TableCell>
  <Box display="flex" gap={1}>
    {/* Existing buttons */}
    <ReplacementButton
      device={device}
      variant="iconButton"
      onSuccess={() => handleRefresh()}
    />
  </Box>
</TableCell>
```

### 2. Device Details Dialog

Thêm button thay thế trong actions:

```tsx
// Trong DeviceDetailDialog.tsx
import { ReplacementButton } from '../components/replacement';

<DialogActions>
  {/* Existing buttons */}
  <ReplacementButton
    device={device}
    variant="button"
    onSuccess={() => onUpdate()}
  />
</DialogActions>
```

### 3. Incident Report Details

Thêm option thay thế thiết bị:

```tsx
// Trong IncidentReportDetails.tsx
import { ReplacementButton } from '../components/replacement';

<Menu>
  {/* Existing menu items */}
  <ReplacementButton
    device={incidentReport.device}
    variant="menuItem"
    incidentReportId={incidentReport.id}
    onSuccess={() => refreshIncidents()}
  />
</Menu>
```

## Logic nghiệp vụ

### Điều kiện thay thế
Thiết bị có thể được thay thế khi:
- Status: `InUse`, `Damaged`, `Maintenance`
- Không thể thay thế khi: `Available`, `Replaced`

### Quy trình thay thế
1. **Chọn thiết bị cũ** cần thay thế
2. **Đề xuất thiết bị mới**: 
   - Ưu tiên thiết bị cùng model
   - Nếu không có, hiển thị tất cả thiết bị available
3. **Chọn thiết bị mới** và nhập lý do
4. **Thực hiện thay thế**:
   - Cập nhật status thiết bị cũ → "Replaced"
   - Thu hồi assignment cũ
   - Tạo assignment mới cho thiết bị thay thế
   - Cập nhật status thiết bị mới → "InUse"
   - Ghi lịch sử cho cả hai thiết bị
   - Resolve incident report (nếu có)

### Permissions
- **Admin**: Tạo replacement, xem tất cả lịch sử
- **User**: Xem lịch sử replacement liên quan đến mình
- **Technician**: Xem lịch sử replacement

## Testing

### Kiểm tra Backend
1. Chạy backend: `dotnet run`
2. Truy cập Swagger: `http://localhost:5264/swagger`
3. Test các API endpoints

### Kiểm tra Frontend  
1. Chạy frontend: `npm run dev`
2. Truy cập: `http://localhost:5173`
3. Login với tài khoản Admin
4. Vào trang "Thay thế" từ sidebar
5. Test tạo replacement với mock data

## Troubleshooting

### Lỗi thường gặp

1. **"Device not available"**: Thiết bị đã được gán hoặc không ở trạng thái Available
2. **"Old device not found"**: DeviceId không tồn tại hoặc đã bị xóa
3. **"Permission denied"**: User không có quyền Admin để tạo replacement

### Debug tips

1. Kiểm tra console browser cho lỗi frontend
2. Kiểm tra backend logs cho lỗi API
3. Verify JWT token và permissions
4. Kiểm tra database schema và data

## Các cải tiến trong tương lai

1. **Statistics Tab**: Thống kê replacement theo thời gian, department
2. **Bulk Replacement**: Thay thế nhiều thiết bị cùng lúc
3. **Replacement Templates**: Lưu template cho các loại thay thế phổ biến
4. **Notification System**: Thông báo cho user khi thiết bị được thay thế
5. **Mobile Responsive**: Tối ưu cho thiết bị di động
6. **Excel Export**: Xuất lịch sử thay thế ra file Excel