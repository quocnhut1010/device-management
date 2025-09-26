# Backend Build Scripts

## Vấn đề
Trước đây, khi chạy `dotnet build` hoặc `dotnet run`, đôi khi .NET build system tạo ra các thư mục `bin` và `obj` ở những vị trí không mong muốn (như trong thư mục `Models\DTOs\IncidentReport`), gây lỗi và xung đột trong các lần build sau.

## Giải pháp
Tôi đã tạo ra các script PowerShell để tự động dọn dẹp và build một cách an toàn:

## Scripts có sẵn

### 1. `cleanup-build.ps1`
**Mục đích**: Dọn dẹp các thư mục `bin` và `obj` không mong muốn

**Cách sử dụng**:
```powershell
# Dọn dẹp thông thường (giữ lại bin/obj chính của project)
.\cleanup-build.ps1

# Dọn dẹp sâu (xóa tất cả bin/obj kể cả của project chính)
.\cleanup-build.ps1 -Deep
```

### 2. `safe-build.ps1`
**Mục đích**: Build an toàn với auto cleanup

**Cách sử dụng**:
```powershell
# Build thông thường
.\safe-build.ps1

# Build với deep clean trước đó
.\safe-build.ps1 -DeepClean

# Build và chạy luôn server
.\safe-build.ps1 -Run

# Build với deep clean và chạy server
.\safe-build.ps1 -DeepClean -Run
```

### 3. `cleanup.bat`
**Mục đích**: Chạy cleanup script dễ dàng cho người không quen PowerShell

**Cách sử dụng**: 
- Double-click vào file `cleanup.bat` trong Windows Explorer

## Quy trình build được khuyến nghị

### Lần đầu hoặc khi gặp lỗi:
```powershell
.\safe-build.ps1 -DeepClean
```

### Build hàng ngày:
```powershell
.\safe-build.ps1
```

### Build và chạy server:
```powershell
.\safe-build.ps1 -Run
```

## Lưu ý

1. **Execution Policy**: Nếu gặp lỗi execution policy, chạy:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Luôn chạy từ thư mục backend**: 
   ```powershell
   cd D:\Do_An\DeviceManagement\backend
   .\safe-build.ps1
   ```

3. **Kiểm tra kết quả**: Các script sẽ báo cáo chi tiết quá trình và kết quả

## Lợi ích

✅ **Tự động dọn dẹp** các artifact không mong muốn  
✅ **Tránh lỗi build** do xung đột thư mục  
✅ **Build process đáng tin cậy** và nhất quán  
✅ **Tiết kiệm thời gian** debug các lỗi build lạ  
✅ **Dễ sử dụng** với nhiều tùy chọn linh hoạt  

## Xử lý sự cố

Nếu vẫn gặp vấn đề:
1. Chạy `.\safe-build.ps1 -DeepClean`
2. Kiểm tra không có process nào đang lock file `.exe`
3. Chạy lại `dotnet build` thông thường
4. Liên hệ để được hỗ trợ thêm