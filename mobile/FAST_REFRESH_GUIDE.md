# Fast Refresh / Auto Reload Guide

## Vấn đề
App không tự động reload khi sửa code, phải nhấn `r` trong terminal.

## Nguyên nhân
- Expo Go có giới hạn về auto reload
- Metro bundler cần restart để pick up changes
- Cache có thể làm outdated code

## Giải pháp

### Cách 1: Sử dụng Fast Refresh (Khuyên dùng)
**Fast Refresh của React Native tự động bật** trong Expo Go!

1. Đảm bảo app đang chạy
2. Sửa code trong editor
3. **Không cần save**, Fast Refresh tự động detect và reload
4. Hoặc Save file (Cmd+S / Ctrl+S)

### Cách 2: Nếu Fast Refresh không hoạt động
Restart Metro bundler:
```bash
# Stop server (Ctrl+C)
npm start
```

### Cách 3: Clear cache nếu cần
```bash
# Stop server
npm start  # (đã có --clear trong package.json)
```

## Debug Fast Refresh

### Fast Refresh hoạt động khi:
✅ Sửa component props
✅ Sửa state logic
✅ Sửa hook calls
✅ Thêm hoặc xóa components

### Fast Refresh KHÔNG hoạt động khi:
❌ Sửa file ngoài React components (services, utils)
❌ Export non-React modules
❌ Error trong component (phải reload manually)
❌ Thay đổi file trong folder không được watch

## Khi nào cần nhấn 'r'

Chỉ cần nhấn `r` khi:
1. **Đổi file cấu hình** (package.json, babel.config.js, etc)
2. **Có error** trong component
3. **Thêm native module mới**
4. **Clear cache hoàn toàn**

## Tips

### 1. Enable Auto-save
VS Code: Settings → "Auto Save: afterDelay" → 500ms

### 2. Check Fast Refresh Status
Trong Expo DevTools, check:
```
Fast Refresh: ✓ Enabled
```

### 3. Nếu vẫn không auto reload
- Kiểm tra file có trong `.gitignore` không
- Check Metro bundler đang chạy
- Restart Expo: `npm start`

## Scripts mới

```bash
npm start        # Start với --clear (auto)
npm run android  # Start Android với clear
npm run ios      # Start iOS với clear
npm run web      # Start Web với clear
npm run dev      # Alias của npm start
```

## Khắc phục khi bị stuck

```bash
# 1. Stop server (Ctrl+C)
# 2. Clear all caches
rm -rf .expo
rm -rf node_modules/.cache

# 3. Restart
npm start
```

## Notes

- Fast Refresh là tính năng mặc định của React Native
- Expo Go hỗ trợ đầy đủ Fast Refresh
- Không cần config gì thêm
- Chỉ cần save file là auto reload!

## Troubleshooting

### Vấn đề: Save file nhưng không reload
**Giải pháp**: Check xem có error trong console không

### Vấn đề: Reload nhưng không thấy thay đổi
**Giải pháp**: Clear cache và restart
```bash
npm start
```

### Vấn đề: Metro bundler không detect changes
**Giải pháp**: Restart hoàn toàn
```bash
# Ctrl+C để stop
npm start
```

