# Environment Setup for Mobile App

## Đã hoàn thành

✅ Cài `react-native-dotenv`  
✅ Tạo file `.env` với IP: `192.168.1.10`  
✅ Config `babel.config.js`  
✅ Sửa `api.ts` để đọc từ `.env`  
✅ Thêm TypeScript types cho `@env`  
✅ Thêm `.env` vào `.gitignore`

## File .env hiện tại

```
API_BASE_URL=http://192.168.1.10:5264/api
```

## Cách thay đổi IP (nếu cần)

1. **Tìm IP máy tính:**
   ```bash
   ipconfig
   ```
   Tìm dòng **IPv4 Address** trong **Wireless LAN adapter Wi-Fi**

2. **Sửa file `.env`:**
   ```
   API_BASE_URL=http://NEW_IP_HERE:5264/api
   ```

3. **Restart Expo:**
   ```bash
   npm start
   ```
   Nhấn `r` để reload app

## Cách test

1. **Đảm bảo backend đang chạy:**
   ```bash
   cd backend
   dotnet run
   ```

2. **Đảm bảo máy tính và iPhone cùng Wi-Fi**

3. **Chạy mobile app:**
   ```bash
   cd mobile
   npm start
   ```

4. **Test login:**
   - Mở app trên iPhone
   - Đăng nhập với tài khoản test
   - Nếu thành công → API đã kết nối

## Troubleshooting

### Vẫn bị Network Error?

1. **Kiểm tra firewall Windows:**
   - Mở Windows Defender Firewall
   - Allow port 5264 cho cả Private và Public networks

2. **Kiểm tra backend có chạy không:**
   ```bash
   curl http://192.168.1.10:5264/api
   ```

3. **Kiểm tra IP có đúng không:**
   ```bash
   ipconfig
   ```
   Verify IP vẫn là `192.168.1.10`

4. **Clear cache và rebuild:**
   ```bash
   cd mobile
   npm start -- --clear
   ```

## Notes

- File `.env` không được commit lên Git (đã thêm vào `.gitignore`)
- File `.env.example` là template để team khác setup
- Mỗi máy dev sẽ có IP khác nhau → mỗi người tự tạo `.env` riêng

