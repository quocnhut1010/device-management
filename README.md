# Hệ thống Quản lý Thiết bị - Device Management System

Hệ thống quản lý thiết bị toàn diện được xây dựng với kiến trúc 3 tầng: Backend ASP.NET Core Web API, Frontend React + TypeScript, và Mobile App React Native.

## 📋 Mô tả

Ứng dụng web và mobile quản lý thiết bị với 4 vai trò chính:
- **Admin**: Quản lý toàn bộ hệ thống, người dùng, thiết bị, báo cáo thống kê
- **Manager (Trưởng phòng)**: Quản lý phòng ban, xem lịch sử thiết bị, báo cáo
- **Employee (Nhân viên)**: Xem thiết bị được cấp phát, báo cáo sự cố, yêu cầu thay thế
- **Technician (Kỹ thuật viên)**: Quản lý sửa chữa, xử lý lệnh sửa được giao

## 🛠️ Công nghệ sử dụng

### Backend
- **Framework**: ASP.NET Core 7.0 Web API
- **Database**: SQL Server với Entity Framework Core
- **Authentication**: JWT Bearer Token
- **Mapping**: AutoMapper
- **Documentation**: Swagger/OpenAPI
- **Export**: ClosedXML (Excel), QuestPDF (PDF)
- **Email**: MailKit
- **AI**: Google Gemini AI (Chat & Reports)

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Mobile
- **Framework**: React Native với Expo
- **Navigation**: React Navigation (Stack, Bottom Tabs)
- **UI Library**: React Native Paper
- **QR Scanner**: Expo Camera
- **Storage**: AsyncStorage
- **HTTP Client**: Axios

## 🎨 Giao diện

- **Theme**: Hỗ trợ Light/Dark mode
- **Responsive**: Tương thích mobile, tablet, desktop
- **Language**: Tiếng Việt
- **Design System**: Material Design với Radix UI components

## 📁 Cấu trúc dự án

```
DeviceManagement/
├── backend/                    # ASP.NET Core Web API
│   ├── Controllers/            # API Controllers
│   │   ├── AuthController.cs
│   │   ├── DeviceController.cs
│   │   ├── DeviceAssignmentController.cs
│   │   ├── DeviceHistoryController.cs
│   │   ├── DeviceModelsController.cs
│   │   ├── DeviceTypesController.cs
│   │   ├── IncidentReportController.cs
│   │   ├── RepairController.cs
│   │   ├── ReplacementController.cs
│   │   ├── LiquidationController.cs
│   │   ├── DashboardController.cs
│   │   ├── AIChatController.cs
│   │   ├── AIReportController.cs
│   │   ├── UsersController.cs
│   │   ├── DepartmentsController.cs
│   │   ├── SuppliersController.cs
│   │   ├── NotificationController.cs
│   │   ├── ReportExportController.cs
│   │   └── DebugController.cs
│   ├── Models/                 # Domain models
│   │   ├── Entities/           # Database entities
│   │   ├── DTOs/               # Data Transfer Objects
│   │   └── Enums/              # Enumerations
│   ├── Services/               # Business logic layer
│   │   ├── Interfaces/
│   │   └── Implementations/
│   ├── Repositories/           # Data access layer
│   │   ├── Interfaces/
│   │   └── Implementations/
│   ├── Data/                   # Database context
│   │   └── DeviceManagementDbContext.cs
│   ├── Migrations/             # EF Core migrations
│   ├── Helpers/                # Utilities
│   │   ├── AutoMapperProfile.cs
│   │   └── TimeZoneHelper.cs
│   └── wwwroot/                # Static files (images, reports)
├── frontend2/                  # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── ui/             # UI components
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DevicesPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── AssignmentsPage.tsx
│   │   │   ├── IncidentsPage.tsx
│   │   │   ├── RepairsPage.tsx
│   │   │   └── ...
│   │   ├── services/           # API services
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # TypeScript types
│   │   ├── routes/             # Routing configuration
│   │   └── utils/              # Utility functions
│   └── public/                 # Public assets
└── mobile/                     # React Native Mobile App
    ├── src/
    │   ├── screens/            # Screen components
    │   │   ├── LoginScreen.tsx
    │   │   ├── QRScannerScreen.tsx
    │   │   ├── DeviceDetailScreen.tsx
    │   │   ├── admin/
    │   │   ├── employee/
    │   │   └── technician/
    │   ├── navigation/         # Navigation configs
    │   │   ├── AppNavigator.tsx
    │   │   ├── AdminTabs.tsx
    │   │   ├── EmployeeTabs.tsx
    │   │   └── TechnicianTabs.tsx
    │   ├── services/           # API services
    │   ├── contexts/           # React contexts
    │   └── types/              # TypeScript types
    └── assets/                 # Images, icons
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

**Backend:**
- .NET 7.0 SDK
- SQL Server (LocalDB, SQL Server Express, hoặc SQL Server)
- Visual Studio 2022 hoặc VS Code

**Frontend:**
- Node.js 18+ và npm/yarn
- Modern web browser

**Mobile:**
- Node.js 18+
- Expo CLI
- Expo Go app (cho testing trên thiết bị thật)

### Các bước cài đặt

#### 1. Clone repository
```bash
git clone <repository-url>
cd DeviceManagement
```

#### 2. Cấu hình Backend

**a. Cấu hình database**
- Mở file `backend/appsettings.json`
- Cập nhật connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=DeviceManagementDB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

**b. Cấu hình JWT (tùy chọn)**
```json
{
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "DeviceApp",
    "Audience": "DeviceUsers",
    "ExpireHours": 6
  }
}
```

**c. Chạy migrations**
```bash
cd backend
dotnet ef database update
```

**d. Chạy Backend**
```bash
cd backend
dotnet run
```

Backend sẽ chạy tại: `http://localhost:5264`
Swagger UI: `http://localhost:5264/swagger`

#### 3. Cấu hình Frontend

**a. Cài đặt dependencies**
```bash
cd frontend2
npm install
```

**b. Cấu hình API URL (nếu cần)**
- Kiểm tra file `frontend2/src/services/api.ts`
- Đảm bảo `API_BASE_URL` trỏ đúng backend URL

**c. Chạy Frontend**
```bash
cd frontend2
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

#### 4. Cấu hình Mobile App

**a. Cài đặt dependencies**
```bash
cd mobile
npm install
```

**b. Cấu hình API URL**
- Mở file `mobile/src/services/api.ts`
- Cập nhật `API_BASE_URL` theo IP máy tính khi test trên thiết bị thật:
```typescript
const API_BASE_URL = 'http://192.168.1.XXX:5264/api';
```

**c. Chạy Mobile App**
```bash
cd mobile
npm start
# hoặc
expo start
```

Quét QR code bằng **Expo Go** app để mở trên thiết bị.

## 👤 Tài khoản mẫu

Tài khoản mẫu sẽ được tạo tự động khi database được seed. Vui lòng kiểm tra seed data hoặc tạo tài khoản mới qua API đăng ký.

## 👥 Vai trò và quyền

### Admin
- Quản lý người dùng (thêm, sửa, xóa, xem chi tiết)
- Quản lý thiết bị (CRUD, trạng thái, QR code)
- Quản lý danh mục (loại thiết bị, model thiết bị, nhà cung cấp)
- Quản lý phòng ban
- Quản lý cấp phát thiết bị
- Xem và quản lý tất cả báo cáo sự cố
- Xem và quản lý tất cả lệnh sửa chữa
- Quản lý thay thế thiết bị
- Thanh lý thiết bị
- Xem lịch sử thiết bị
- Xem báo cáo & thống kê tổng quan
- Xuất báo cáo (Excel, PDF)
- Quản lý thông báo
- Sử dụng AI Chat & AI Reports
- Quét QR code xem tất cả thiết bị

### Manager (Trưởng phòng)
- Xem danh sách thiết bị
- Xem phòng ban
- Xem lịch sử thiết bị của phòng ban
- Xem và quản lý báo cáo sự cố
- Yêu cầu thay thế thiết bị
- Xem báo cáo & thống kê
- Quản lý thông tin cá nhân

### Employee (Nhân viên)
- Xem thiết bị được cấp phát cho mình
- Báo cáo sự cố thiết bị
- Yêu cầu thay thế thiết bị
- Xem báo cáo sự cố của mình
- Quét QR code xem thiết bị của mình
- Quản lý thông tin cá nhân

### Technician (Kỹ thuật viên)
- Xem danh sách lệnh sửa được giao
- Cập nhật trạng thái sửa chữa
- Quản lý chi phí sửa chữa
- Upload hình ảnh sửa chữa
- Quét QR code xem thiết bị trong lệnh sửa
- Quản lý thông tin cá nhân

## ✨ Các tính năng chính

### Xác thực & Phân quyền
- ✅ Đăng ký / Đăng nhập người dùng
- ✅ Phân quyền theo vai trò (Admin, Manager, Employee, Technician)
- ✅ JWT Token Authentication
- ✅ Quên mật khẩu / Đặt lại mật khẩu
- ✅ Đổi mật khẩu
- ✅ Quản lý session

### Quản lý thiết bị
- ✅ CRUD thiết bị với đầy đủ thông tin
- ✅ Quản lý trạng thái thiết bị (Chưa cấp phát, Đang sử dụng, Đang sửa chữa, Đã thanh lý, Bảo trì, Mất, Hỏng, Chờ thanh lý)
- ✅ Upload hình ảnh thiết bị
- ✅ Quản lý QR Code và Barcode
- ✅ Tìm kiếm và lọc thiết bị
- ✅ Phân trang danh sách thiết bị
- ✅ Soft delete và restore thiết bị
- ✅ Quản lý khấu hao thiết bị

### Quản lý cấp phát
- ✅ Cấp phát thiết bị cho người dùng
- ✅ Thu hồi thiết bị
- ✅ Yêu cầu trả thiết bị
- ✅ Lịch sử cấp phát
- ✅ Theo dõi thiết bị hiện tại của người dùng

### Báo cáo sự cố
- ✅ Tạo báo cáo sự cố thiết bị
- ✅ Upload hình ảnh sự cố
- ✅ Quản lý trạng thái sự cố (Chờ duyệt, Đã tạo lệnh sửa, Đã từ chối, Đã đóng, Chờ thực hiện)
- ✅ Phân loại mức độ nghiêm trọng (Severity)
- ✅ Xem danh sách sự cố theo vai trò

### Quản lý sửa chữa
- ✅ Tạo lệnh sửa chữa
- ✅ Theo dõi SLA (Service Level Agreement)
- ✅ Ước tính chi phí sửa chữa
- ✅ Upload hình ảnh sửa chữa
- ✅ Quản lý trạng thái sửa chữa (Chờ thực hiện, Đang sửa, Chờ duyệt hoàn tất, Đã hoàn tất, Từ chối, Không cần sửa)
- ✅ Phân công kỹ thuật viên
- ✅ Lịch sử sửa chữa

### Quản lý thay thế
- ✅ Yêu cầu thay thế thiết bị
- ✅ Phê duyệt/yêu cầu thay thế
- ✅ Theo dõi quá trình thay thế

### Thanh lý thiết bị
- ✅ Tạo yêu cầu thanh lý
- ✅ Quản lý quy trình thanh lý
- ✅ Lịch sử thanh lý

### Lịch sử thiết bị
- ✅ Xem toàn bộ lịch sử thiết bị
- ✅ Theo dõi thay đổi trạng thái
- ✅ Lịch sử cấp phát, sửa chữa, thay thế
- ✅ Audit trail đầy đủ

### Dashboard & Analytics
- ✅ Dashboard cho từng vai trò
- ✅ Thống kê tổng quan (Admin)
- ✅ Phân tích thiết bị theo phòng ban
- ✅ Thống kê sửa chữa, sự cố
- ✅ Biểu đồ và visualizations

### AI Chat & AI Reports
- ✅ Chat với AI về thiết bị
- ✅ Tạo báo cáo tự động bằng AI
- ✅ Phân tích dữ liệu thiết bị
- ✅ Tư vấn quản lý thiết bị

### Xuất báo cáo
- ✅ Xuất báo cáo Excel (ClosedXML)
- ✅ Xuất báo cáo PDF (QuestPDF)
- ✅ Báo cáo thiết bị, sửa chữa, sự cố
- ✅ Báo cáo thống kê tổng hợp

### Thông báo
- ✅ Hệ thống thông báo real-time
- ✅ Thông báo sự cố, sửa chữa
- ✅ Thông báo cấp phát, thu hồi

### QR Code Scanner
- ✅ Quét QR code trên Web
- ✅ Quét QR code trên Mobile
- ✅ Phân quyền truy cập theo vai trò
- ✅ Xem thông tin thiết bị nhanh chóng

### Quản lý danh mục
- ✅ Quản lý loại thiết bị (Device Types)
- ✅ Quản lý model thiết bị (Device Models)
- ✅ Quản lý nhà cung cấp (Suppliers)
- ✅ Quản lý phòng ban (Departments)

## 🧪 Testing

### Backend API Testing
- Sử dụng Swagger UI tại `http://localhost:5264/swagger`
- Test các endpoints với JWT token

### Frontend Testing
- Chạy ứng dụng và test các tính năng theo vai trò
- Kiểm tra responsive trên các thiết bị

### Mobile Testing
- Sử dụng Expo Go để test trên thiết bị thật
- Test QR Scanner với camera
- Test authentication và navigation

## 📝 Ghi chú

- Database sẽ được tự động tạo khi chạy migrations lần đầu
- JWT token có thời hạn mặc định 6 giờ (có thể cấu hình trong appsettings.json)
- CORS được cấu hình để cho phép frontend và mobile app kết nối
- Hình ảnh được lưu trong `backend/wwwroot/images/`
- Báo cáo AI được lưu trong `backend/wwwroot/ai-reports/`
- Mobile app cần cấu hình đúng API URL khi test trên thiết bị thật
- Backend phải chạy trước khi test frontend và mobile app

## 🔒 Bảo mật

- JWT Authentication cho tất cả API endpoints
- Phân quyền theo vai trò (Role-based Authorization)
- Password hashing với ASP.NET Core Identity PasswordHasher (PBKDF2)
- CORS configuration
- Input validation với Data Annotations và Zod
- SQL Injection protection với Entity Framework Core

## 📄 License

[MIT License](LICENSE)

---

**Device Management System** - Hệ thống quản lý thiết bị toàn diện

