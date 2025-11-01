# Network Error Troubleshooting Guide

## ✅ Đã thực hiện

1. **CORS Configuration** - Đã update để allow all origins cho mobile
2. **Backend Binding** - Đang chạy với `--urls "http://0.0.0.0:5264"`
3. **Test Connection Script** - Đã tạo để debug connection issues
4. **Mobile App** - Đã restart với cache cleared

## 🔍 Kiểm tra ngay

### 1. Backend đang chạy đúng không?
```bash
# Terminal 1 - Backend phải chạy với:
cd backend
dotnet run --urls "http://0.0.0.0:5264"
```

Phải thấy output:
```
Now listening on: http://0.0.0.0:5264
```

### 2. Mobile app console
Khi mở app, check console trong Expo để xem:
- `API_BASE_URL: http://192.168.1.10:5264/api`
- Connection test results

### 3. Test từ browser trên máy tính
Mở browser, truy cập:
```
http://192.168.1.10:5264/swagger
```
Nếu không load → backend chưa bind đúng IP

### 4. Test từ iPhone browser
Trên iPhone, mở Safari:
```
http://192.168.1.10:5264/swagger
```
Nếu không load → Network/Firewall issue

## 🛠️ Các bước fix

### Step 1: Windows Firewall
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Allow Backend Port 5264" -Direction Inbound -LocalPort 5264 -Protocol TCP -Action Allow
```

### Step 2: Verify IP address
```bash
ipconfig
# Tìm IPv4 Address của Wi-Fi adapter
# Update .env nếu IP đã thay đổi
```

### Step 3: Backend launchSettings.json
Tạo/sửa `backend/Properties/launchSettings.json`:
```json
{
  "profiles": {
    "backend": {
      "commandName": "Project",
      "applicationUrl": "http://0.0.0.0:5264",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

### Step 4: Test với curl từ máy khác
```bash
# Từ máy khác cùng mạng
curl http://192.168.1.10:5264/api
```

## 📱 Debug trên Mobile

1. **Xem Expo logs**
   - Nhấn `j` trong terminal Expo để mở debugger
   - Check Network tab

2. **Add more logging**
   Trong `LoginScreen.tsx`, thêm:
   ```typescript
   console.log('Login attempt:', { email, password });
   console.log('API URL:', API_BASE_URL);
   ```

3. **Test với Postman mobile**
   - Cài Postman trên iPhone
   - Test: POST http://192.168.1.10:5264/api/Auth/login

## 🚨 Common Issues

### Issue 1: "Network Error" vẫn xảy ra
**Nguyên nhân**: Backend không accessible từ mobile
**Fix**: 
- Đảm bảo backend chạy với `0.0.0.0` không phải `localhost`
- Check firewall rules
- Verify cùng Wi-Fi network

### Issue 2: CORS error
**Nguyên nhân**: CORS policy chặn mobile app
**Fix**: Đã update `Program.cs` để allow all origins

### Issue 3: Connection refused
**Nguyên nhân**: Wrong IP or port
**Fix**: 
- Update `.env` với đúng IP
- Restart Expo với `--clear`

## 📝 Quick Checklist

- [ ] Backend running với `--urls "http://0.0.0.0:5264"`
- [ ] `.env` có đúng IP: `192.168.1.10`
- [ ] iPhone và máy tính cùng Wi-Fi
- [ ] Firewall allow port 5264
- [ ] Expo app restarted với `--clear`
- [ ] Test endpoint accessible từ iPhone browser

## 💡 Alternative Solutions

### 1. Ngrok (for testing)
```bash
# Install ngrok
ngrok http 5264
# Use ngrok URL in .env
```

### 2. USB Debugging
- Connect iPhone via USB
- Use `localhost` với Expo tunneling

### 3. Different Port
Nếu 5264 bị block:
```bash
# Backend
dotnet run --urls "http://0.0.0.0:8080"

# Mobile .env
API_BASE_URL=http://192.168.1.10:8080/api
```
