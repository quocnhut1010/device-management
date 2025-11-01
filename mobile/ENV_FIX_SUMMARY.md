# ENV Loading Fix Summary

## Vấn đề
`API_BASE_URL` trả về `undefined` khi import từ `@env`

## Nguyên nhân
1. ✅ **File .env đã có nhưng nội dung sai** - Fixed: `Network Error/api` → `http://192.168.1.10:5264/api`
2. ❌ **Cache của Expo/Babel** - Fixed: Cleared và restart

## Đã thực hiện

### 1. ✅ Fixed file .env
```bash
# Nội dung cũ (SAI):
API_BASE_URL= Network Error/api

# Nội dung mới (ĐÚNG):
API_BASE_URL=http://192.168.1.10:5264/api
```

### 2. ✅ Cleared all caches
```bash
# Đã xóa:
- .expo/ directory
- node_modules/.cache/
# Restart Expo với --clear
```

### 3. ✅ Configurations đúng
- ✅ `babel.config.js` - Đã có `react-native-dotenv` plugin
- ✅ `src/types/env.d.ts` - TypeScript declaration đúng
- ✅ `.gitignore` - Đã ignore `.env`

## Kiểm tra bây giờ

### 1. Expo đang chạy với cache cleared
```bash
npx expo start --clear
```

### 2. Mở app trên iPhone và check console
Sẽ thấy:
```
📱 Mobile App Connection Info:
================================
API_BASE_URL: http://192.168.1.10:5264/api  ← PHẢI KHÔNG undefined
================================
```

### 3. Test login
- Email: `admin@example.com` (hoặc user khác)
- Password: (password của user đó)

## Nếu vẫn còn undefined

### Option 1: Restart hoàn toàn
```bash
# Terminal 1 - Stop Expo (Ctrl+C)
# Terminal 1 - Start lại
cd mobile
npx expo start --clear

# Terminal 2 - Check backend đang chạy
cd backend
dotnet run --urls "http://0.0.0.0:5264"
```

### Option 2: Reinstall dependencies
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### Option 3: Verify .env location
File `.env` PHẢI ở thư mục root của mobile project:
```
mobile/
  ├── .env              ← PHẢI Ở ĐÂY
  ├── babel.config.js
  ├── package.json
  ├── App.tsx
  └── src/
```

## Kết quả mong đợi

✅ Console log: `API_BASE_URL: http://192.168.1.10:5264/api`  
✅ Login không còn Network Error  
✅ Kết nối được với backend  
✅ Token được save vào AsyncStorage  

## Troubleshooting

### Nếu API_BASE_URL vẫn undefined
1. Verify `.env` location: `Get-Content .env` (PowerShell)
2. Check Babel cache: Clear `.expo/` và restart
3. Check Metro bundler: Restart với `--clear`
4. Check import: `import { API_BASE_URL } from '@env'` (không phải `from 'react-native-dotenv'`)

### Nếu vẫn Network Error sau khi fix undefined
1. Backend chạy với: `dotnet run --urls "http://0.0.0.0:5264"`
2. CORS đã allow all origins
3. Firewall allow port 5264
4. iPhone và máy tính cùng Wi-Fi

## Notes
- File `.env` KHÔNG được commit lên Git (đã trong `.gitignore`)
- Mỗi developer cần tạo `.env` riêng với IP của máy mình
- Khi đổi IP (ví dụ đổi Wi-Fi), update `.env` và restart Expo

