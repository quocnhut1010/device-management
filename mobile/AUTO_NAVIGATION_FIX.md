# Auto Navigation Fix

## Vấn đề
Sau khi login thành công, app không tự động navigate đến Dashboard. Phải nhấn `r` trong terminal để reload mới vào được.

## Nguyên nhân
`NavigationContainer` chỉ áp dụng `initialRouteName` khi render lần đầu. Khi `isAuthenticated` thay đổi, navigation không tự động re-route.

## Giải pháp
Thêm `key` prop vào `NavigationContainer` để force re-render khi auth state thay đổi.

### Code thay đổi

#### AppNavigator.tsx

**Trước:**
```typescript
<NavigationContainer>
  <Stack.Navigator initialRouteName={getInitialRoute() as keyof RootStackParamList}>
    ...
  </Stack.Navigator>
</NavigationContainer>
```

**Sau:**
```typescript
// Key để force re-render NavigationContainer when auth state changes
const navKey = isAuthenticated ? 'authenticated' : 'unauthenticated';

<NavigationContainer key={navKey}>
  <Stack.Navigator initialRouteName={getInitialRoute() as keyof RootStackParamList}>
    ...
  </Stack.Navigator>
</NavigationContainer>
```

## Cách hoạt động

1. Khi user login, `isAuthenticated` thay đổi từ `false` → `true`
2. `navKey` thay đổi từ `'unauthenticated'` → `'authenticated'`
3. React detect `key` change và **unmount/remount** `NavigationContainer`
4. Container mới sử dụng `initialRouteName` với giá trị mới
5. User được redirect đến đúng dashboard

## Debug logging

Đã thêm console.log để track auth state changes:
```typescript
React.useEffect(() => {
  console.log('Auth state changed:', { isAuthenticated, user: user?.email });
}, [isAuthenticated, user]);
```

## Kết quả

✅ Login thành công → **Tự động navigate** đến Dashboard
✅ Logout → **Tự động navigate** về Login
✅ Không cần nhấn `r` trong terminal
✅ Navigation smooth và instant

## Testing

1. Mở app → thấy LoginScreen
2. Nhập email/password và login
3. **App tự động navigate đến Dashboard** (không cần reload)
4. Nhấn logout
5. **App tự động navigate về Login**

## Lưu ý

- `key` prop force re-render → có thể reset navigation state
- Đây là expected behavior cho auth-based navigation
- Navigation history bị clear khi logout/login (đúng như mong muốn)

