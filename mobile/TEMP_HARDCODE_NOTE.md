# ⚠️ TEMPORARY HARDCODE FIX - REMOVE LATER

## Status
API URL đã được HARDCODE tạm thời để test chức năng mobile app.

## File Changed
`mobile/src/services/api.ts`

### Change Made
```typescript
// BEFORE (không hoạt động)
import { API_BASE_URL } from '@env';

// AFTER (tạm thời)
const API_BASE_URL = 'http://192.168.1.10:5264/api';
```

## Why?
`react-native-dotenv` không load được `.env` trong Expo Go, dẫn đến `API_BASE_URL: undefined`.

## Next Steps
Sau khi test xong, cần migrate sang:
1. **Expo Constants** (recommended) - dùng `expo-constants`
2. **Config file** - Tạo `config.ts` riêng
3. **Native config** - Build config trong app

## Current IP
`192.168.1.10:5264`

**Nếu IP máy tính thay đổi** (đổi Wi-Fi), phải update lại hardcoded value này.

## Remove This File
File này nên được xóa sau khi có solution đúng.

