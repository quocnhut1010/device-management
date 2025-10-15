# 🔔 Notification System Testing Guide

## **✅ Fixes Applied for User Switching Issue**

### **Problem Solved:**
- ❌ **Before**: When user logout → new user login, old notifications remain visible until 30s polling refresh
- ✅ **After**: Notifications are cleared immediately when user changes

### **Key Improvements:**

1. **Immediate Notification Clearing**
   - Notifications clear instantly on user ID change
   - No waiting for 30s polling cycle
   - Proper state management across user sessions

2. **Enhanced User Detection**
   - Track previous user ID to detect actual user changes
   - Separate useEffect for user tracking to avoid infinite re-renders
   - Console logging for debugging user changes

3. **AuthContext Integration**
   - Proper login/logout handling through context
   - Storage event listener for cross-tab synchronization
   - Consistent authentication state management

4. **Bell Click Refresh**
   - Force refresh notifications when bell is clicked
   - Ensures latest data is always displayed

## **🧪 Testing Scenarios**

### **Scenario 1: Basic User Switching**
1. **Employee Login** → Create incident report
2. **Logout** → **Admin Login**
3. **✅ Expected**: Bell shows admin's notifications (new incident from employee)
4. **✅ Expected**: Employee's old notifications are gone

### **Scenario 2: Role-based Filtering**
1. **Admin Login** → Approve/reject incident reports
2. **Logout** → **Employee Login**  
3. **✅ Expected**: Bell shows employee notifications (approval/rejection)
4. **✅ Expected**: Admin's notifications are not visible

### **Scenario 3: Technician Workflow**
1. **Admin Login** → Assign repair to technician
2. **Logout** → **Technician Login**
3. **✅ Expected**: Bell shows repair assignment notification
4. **Technician** → Complete repair
5. **Logout** → **Admin Login**
6. **✅ Expected**: Bell shows repair completion notification

### **Scenario 4: Cross-tab Synchronization**
1. Open app in **Tab 1** (Employee logged in)
2. Open app in **Tab 2** → Login as Admin
3. **✅ Expected**: Tab 1 automatically switches to Admin's notifications
4. **✅ Expected**: No employee notifications remain in Tab 1

## **🔧 Testing Commands**

### **Start Backend:**
```bash
cd backend
dotnet run
```

### **Start Frontend:**
```bash
cd frontend  
npm run dev
```

### **Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5264
- Swagger: http://localhost:5264/swagger

## **👀 Visual Indicators**

### **Notification Bell States:**
- 🔔 **Empty**: No notifications
- 🔔 **With badge**: Shows unread count
- 🔴 **Red badge**: Pulsing animation for new notifications
- ⚡ **Active icon**: When hover or has unread notifications

### **Role-based Content:**
- **Admin**: 👨‍💼 New incident reports, repair completions/rejections
- **Employee/Manager**: 🧑‍💻 Report approvals, device assignments, repair completions
- **Technician**: 🔧 New repair assignments, feedback ratings

## **🚀 Advanced Features Tested**

### **Real-time Updates:**
- ✅ 30-second polling for new notifications
- ✅ Browser notifications (with permission)
- ✅ Immediate refresh on bell click
- ✅ Auto-clear old notifications on user change

### **UI/UX Features:**
- ✅ Bell shake animation on hover with unread notifications
- ✅ Badge pulse animation for new notifications  
- ✅ Role-appropriate icons (warning, tools, devices, etc.)
- ✅ Relative timestamps with Vietnamese locale
- ✅ Priority color coding (error, success, warning, info)

### **Performance:**
- ✅ Optimized polling (stops when no user)
- ✅ Proper cleanup on unmount
- ✅ Efficient state updates to avoid re-renders
- ✅ Cached notification count

## **🐛 Debug Tools**

### **Console Logs:**
- `User changed, clearing notifications immediately`
- `User logged out, clearing notifications`  
- `User ID changed from [old] to [new]`

### **Debug Component:**
Add `<NotificationDebug />` to any page to see:
- Current user info
- Notification count
- Loading states
- Recent notifications
- Manual refresh/clear buttons

## **📝 Test Checklist**

- [ ] Employee → Admin switch clears notifications immediately
- [ ] Admin → Technician switch clears notifications immediately  
- [ ] Technician → Employee switch clears notifications immediately
- [ ] Logout clears all notifications
- [ ] Cross-tab login switches notifications in other tabs
- [ ] Bell click refreshes latest notifications
- [ ] Role-based filtering works correctly
- [ ] Real-time polling continues working
- [ ] Browser notifications work (with permission)
- [ ] No infinite re-renders in console
- [ ] Performance is smooth during user switches

## **🎯 Success Criteria**

✅ **Immediate Clear**: No old notifications remain after user switch
✅ **Proper Filtering**: Each role sees only relevant notifications  
✅ **Real-time Sync**: New notifications appear within 30 seconds
✅ **Cross-tab Sync**: User changes sync across browser tabs
✅ **Performance**: No lag or infinite renders during switches
✅ **UX**: Smooth animations and clear visual feedback