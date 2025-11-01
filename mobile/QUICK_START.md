# Quick Start Guide

## 🚀 Để app tự động reload khi sửa code

Fast Refresh của React Native **TỰ ĐỘNG BẬT** trong Expo Go!

### Không cần làm gì cả!
Chỉ cần:
1. ✅ Save file (Ctrl+S / Cmd+S)
2. ✅ App tự động reload

### Nếu không reload

**Option 1**: Restart Expo (đơn giản nhất)
```bash
# Trong terminal Expo, nhấn 'r'
```

**Option 2**: Stop và start lại
```bash
# Stop (Ctrl+C)
npm start
```

## 📝 Scripts mới

```bash
npm start        # Start với auto clear cache
npm run android  # Start cho Android
npm run ios      # Start cho iOS
npm run web      # Start cho Web
npm run dev      # Alias của start
```

## 🔍 Tips

### Enable Auto-save trong VS Code
File → Preferences → Settings
Search: "Auto Save"
Chọn: "afterDelay" và set 500ms

### Check Fast Refresh
Trong Expo terminal, sẽ thấy:
```
✓ Fast Refresh enabled
```

## ⚠️ Lưu ý

Fast Refresh KHÔNG reload khi:
- Sửa file không phải component (services, utils)
- Có error trong code
- Thay đổi file cấu hình (babel, package.json)

Trong trường hợp này **phải restart** bằng `npm start`!

## 🐛 Troubleshooting

### App stuck?
```bash
# Clear và restart
npm start  # (đã có --clear)
```

### Không detect thay đổi?
1. Check file có save chưa
2. Check có error không
3. Restart: `npm start`

## ✅ Checklist

- [ ] Backend đang chạy: `cd backend && dotnet run --urls "http://0.0.0.0:5264"`
- [ ] Mobile đang chạy: `cd mobile && npm start`
- [ ] iPhone đã mở app
- [ ] Vào Expo terminal để xem logs

## 🎯 Test ngay

1. Mở `LoginScreen.tsx`
2. Đổi text "Đăng nhập" thành "Login Test"
3. **Save file** (Ctrl+S)
4. **App tự động reload!** ✨

---

**Xem chi tiết**: [FAST_REFRESH_GUIDE.md](./FAST_REFRESH_GUIDE.md)

