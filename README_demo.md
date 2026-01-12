# Online Course Platform - EduTech

Hệ thống quản lý khóa học trực tuyến được xây dựng bằng ASP.NET Core MVC 8.0.

## 📋 Mô tả

Ứng dụng web quản lý khóa học trực tuyến với 3 vai trò chính:
- **Admin**: Quản lý người dùng, danh mục, khóa học, xem báo cáo thống kê
- **Instructor**: Tạo và quản lý khóa học, bài học, theo dõi tiến độ học viên
- **Student**: Đăng ký khóa học, học bài, theo dõi tiến độ học tập

## 🛠️ Công nghệ sử dụng

- **Framework**: ASP.NET Core MVC 8.0
- **Database**: SQL Server với Entity Framework Core
- **Authentication**: Cookie Authentication
- **Frontend**: Tailwind CSS, jQuery, jQuery Validation
- **Icons**: Material Symbols Outlined
- **Fonts**: Lexend (Google Fonts)
- **Architecture**: MVC với Areas pattern

## 🎨 Giao diện

- **Theme**: Hỗ trợ Light/Dark mode (mặc định Light)
- **Responsive**: Tương thích mobile, tablet, desktop
- **Language**: Tiếng Việt

## 📁 Cấu trúc dự án

```
Online_Course/
├── Areas/                    # Phân chia theo vai trò
│   ├── Admin/               # Quản trị viên
│   │   ├── Controllers/     # Dashboard, Users, Courses, Categories, Reports, Profile
│   │   └── Views/
│   ├── Instructor/          # Giảng viên
│   │   ├── Controllers/     # Dashboard, Courses, Lessons, Students, Analytics, Profile
│   │   └── Views/
│   └── Student/             # Học viên
│       ├── Controllers/     # Courses, Learning, Progress
│       └── Views/
├── Controllers/             # Controllers chung (Home, Account, Profile)
├── Models/                  # Domain models
├── ViewModels/              # View models cho UI
├── Services/                # Business logic layer
├── Data/                    # Database context và seed data
├── Views/                   # Razor views
│   └── Shared/              # Layouts (_Layout, _AdminLayout, _InstructorLayout, _StudentLayout)
└── wwwroot/                 # Static files (CSS, JS, images)
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- .NET 8.0 SDK
- SQL Server (LocalDB hoặc SQL Server Express)
- Visual Studio 2022 hoặc VS Code

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd Online_Course
```

2. **Cấu hình database**
   - Mở file `Online_Course/appsettings.json`
   - Cập nhật connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=OnlineCourseDb_v2;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

3. **Chạy ứng dụng**
```bash
cd Online_Course
dotnet run
```

4. **Truy cập ứng dụng**
   - URL: `http://localhost:5227`

## 👤 Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@onlinecourse.com | Admin@123 |
| Instructor | hung.nguyen@onlinecourse.com | Instructor@123 |
| Student | an.hoang@gmail.com | Student@123 |

## 👥 Vai trò và quyền

### Admin
- Quản lý người dùng (thêm, sửa, xóa, xem chi tiết)
- Quản lý danh mục khóa học
- Quản lý tất cả khóa học
- Xem báo cáo & thống kê tổng quan
- Quản lý thông tin cá nhân

### Instructor
- Tạo và quản lý khóa học của mình
- Tạo và quản lý bài học (video, nội dung)
- Xem danh sách học viên và tiến độ học tập
- Xem thống kê phân tích khóa học
- Quản lý thông tin cá nhân

### Student
- Duyệt và tìm kiếm khóa học
- Đăng ký / Hủy đăng ký khóa học
- Xem nội dung bài học (video, text)
- Đánh dấu hoàn thành bài học
- Theo dõi tiến độ học tập
- Quản lý thông tin cá nhân

## � Chác tính năng chính

### Xác thực & Phân quyền
- ✅ Đăng ký / Đăng nhập người dùng
- ✅ Phân quyền theo vai trò (Admin, Instructor, Student)
- ✅ Quên mật khẩu / Đặt lại mật khẩu
- ✅ Đổi mật khẩu

### Quản lý khóa học
- ✅ CRUD khóa học với trạng thái (Draft, Private, Public)
- ✅ Quản lý danh mục khóa học
- ✅ Upload/URL hình ảnh thumbnail
- ✅ Lọc khóa học theo danh mục

### Quản lý bài học
- ✅ CRUD bài học
- ✅ Hỗ trợ video YouTube và video URL
- ✅ Sắp xếp thứ tự bài học
- ✅ Nội dung mô tả chi tiết

### Học tập
- ✅ Đăng ký khóa học
- ✅ Xem video bài học
- ✅ Đánh dấu hoàn thành bài học
- ✅ Theo dõi tiến độ học tập (%)
- ✅ Điều hướng bài học (Trước/Sau)

### Dashboard & Báo cáo
- ✅ Dashboard cho từng vai trò
- ✅ Thống kê tổng quan (Admin)
- ✅ Phân tích khóa học (Instructor)
- ✅ Tiến độ học tập (Student)

### Giao diện
- ✅ Light/Dark mode toggle
- ✅ Responsive design
- ✅ Giao diện tiếng Việt
- ✅ Material Design icons

## 🧪 Testing

Project có kèm test project `Online_Course.Tests` với các property-based tests.

Chạy tests:
```bash
dotnet test
```

## 📝 Ghi chú

- Database sẽ được tự động seed với dữ liệu mẫu khi khởi động lần đầu
- Mặc định sử dụng giao diện sáng (Light mode)
- Có thể chuyển đổi Light/Dark mode bằng nút toggle trên header

## 📄 License

[MIT License](LICENSE)

---

**EduTech** - Nền tảng học tập trực tuyến
