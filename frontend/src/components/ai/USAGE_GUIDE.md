# 🤖 Hướng dẫn sử dụng AI Chatbot - Hệ thống Quản lý Thiết bị

## 🎯 Tính năng mới: Truy vấn dữ liệu thực từ hệ thống

Chatbot hiện có khả năng truy cập và phân tích dữ liệu thực từ SQL Server backend của bạn!

## 📋 Các loại câu hỏi được hỗ trợ

### 1. 📊 Thống kê tổng quan
```
🗣️ "Tổng quan hệ thống thiết bị"
🗣️ "Thống kê thiết bị hiện tại"
🗣️ "Cho tôi biết tình hình thiết bị"

✅ Trả về: Tổng số thiết bị, số đang sử dụng, số phòng ban, nhà cung cấp, trạng thái chi tiết
```

### 2. 🔢 Số lượng thiết bị
```
🗣️ "Hệ thống hiện có bao nhiêu thiết bị?"
🗣️ "Có bao nhiêu thiết bị đang được sử dụng?"
🗣️ "Số lượng thiết bị hiện tại là bao nhiêu?"

✅ Trả về: Số lượng chính xác từ database với tỷ lệ phần trăm
```

### 3. 🏢 Thiết bị theo phòng ban
```
🗣️ "Có bao nhiêu thiết bị thuộc phòng Kế Toán?"
🗣️ "Phòng IT có bao nhiêu thiết bị?"
🗣️ "Phòng ban nào có nhiều thiết bị nhất?"

✅ Trả về: Thống kê chi tiết theo phòng ban với số lượng cụ thể
```

### 4. 🏭 Thông tin nhà cung cấp
```
🗣️ "Nhà cung cấp nào có nhiều thiết bị nhất?"
🗣️ "Thống kê thiết bị theo nhà cung cấp"
🗣️ "Top 5 nhà cung cấp hàng đầu"

✅ Trả về: Ranking nhà cung cấp với số lượng thiết bị từng nhà
```

### 5. 🗑️ Thiết bị chờ thanh lý
```
🗣️ "Những thiết bị đang chờ thanh lý là gì?"
🗣️ "Có thiết bị nào cần thanh lý không?"
🗣️ "Danh sách thiết bị thanh lý"

✅ Trả về: Danh sách cụ thể các thiết bị chờ thanh lý với thông tin chi tiết
```

### 6. 📈 Phân tích trạng thái
```
🗣️ "Tình trạng thiết bị hiện tại như thế nào?"
🗣️ "Phân tích trạng thái thiết bị"
🗣️ "Có bao nhiêu thiết bị đang bảo trì?"

✅ Trả về: Thống kê chi tiết theo từng trạng thái (Đang sử dụng, Bảo trì, Chờ thanh lý, v.v.)
```

## 🚀 Cách sử dụng

### Bước 1: Mở AI Chatbot
1. Đăng nhập vào hệ thống
2. Truy cập Dashboard
3. Click nút 🤖 ở góc dưới bên phải

### Bước 2: Cài đặt API Key (nếu cần)
1. Click biểu tượng ⚙️ trong dialog chat
2. **Tùy chọn 1**: Click "Sử dụng mặc định" (khuyến nghị)
3. **Tùy chọn 2**: Nhập API key riêng từ [Google AI Studio](https://aistudio.google.com/app/apikey)

### Bước 3: Bắt đầu trò chuyện
1. Nhập câu hỏi vào ô chat
2. Nhấn Enter hoặc click nút Send
3. Chờ AI phân tích và trả về kết quả

## 🔄 Cách hoạt động

### 1. Nhận diện câu hỏi
AI tự động nhận diện xem câu hỏi có liên quan đến dữ liệu hệ thống không dựa trên từ khóa:
- "bao nhiêu thiết bị"
- "số lượng thiết bị" 
- "nhà cung cấp"
- "phòng ban"
- "thanh lý"
- "thống kê"

### 2. Truy xuất dữ liệu
- Tự động gọi API backend để lấy dữ liệu mới nhất
- Cache dữ liệu trong 5 phút để tăng hiệu suất
- Xử lý song song nhiều API calls

### 3. Phân tích và trả lời
- Phân tích dữ liệu SQL Server thực tế
- Tính toán thống kê chi tiết
- Trình bày kết quả với format đẹp mắt

## 💡 Mẹo sử dụng hiệu quả

### ✅ Câu hỏi nên hỏi:
- Câu hỏi cụ thể về số liệu
- Yêu cầu so sánh và phân tích
- Hỏi về trạng thái hiện tại
- Tìm hiểu xu hướng sử dụng

### ❌ Câu hỏi nên tránh:
- Câu hỏi quá chung chung
- Yêu cầu sửa đổi dữ liệu
- Câu hỏi về tương lai xa
- Thông tin không liên quan đến thiết bị

## 🔍 Ví dụ hội thoại thực tế

**User:** "Hệ thống hiện có bao nhiêu thiết bị đang được sử dụng?"

**AI:** 
```
🔧 Hiện tại hệ thống có 87 thiết bị đang được sử dụng trên tổng số 120 thiết bị (72.5%).
```

**User:** "Phòng ban nào có nhiều thiết bị nhất?"

**AI:**
```
🏢 Thống kê thiết bị theo phòng ban:

• Phòng IT: 35 thiết bị
• Phòng Kế toán: 28 thiết bị  
• Phòng Marketing: 22 thiết bị
• Phòng Nhân sự: 18 thiết bị
• Phòng Kinh doanh: 17 thiết bị
```

**User:** "Có thiết bị nào đang chờ thanh lý không?"

**AI:**
```
🗑️ Có 5 thiết bị đang chờ thanh lý:

• Dell Optiplex 7010 (Phòng Kế toán)
• HP LaserJet P1102 (Phòng Nhân sự)  
• Lenovo ThinkPad E450 (Phòng IT)
• Canon Pixma MP287 (Phòng Marketing)
• Samsung Monitor 19" (Chưa phân bổ)
```

## 🛠️ Xử lý sự cố

### Lỗi API Key
```
❌ "API key không hợp lệ"
✅ Giải pháp: Click ⚙️ → "Sử dụng mặc định" hoặc nhập key mới
```

### Không có dữ liệu
```
❌ "Không thể truy cập dữ liệu hệ thống"  
✅ Giải pháp: Kiểm tra kết nối mạng, backend có đang chạy không
```

### Phản hồi chậm
```
❌ AI phản hồi lâu
✅ Giải pháp: Đợi 5-10 giây, hệ thống đang tải dữ liệu từ database
```

## 📱 Tính năng nâng cao

### 1. Cache thông minh
- Dữ liệu được cache 5 phút
- Tự động refresh khi có thay đổi
- Hiệu suất cao, ít tải trên server

### 2. Fallback AI
- Nếu không truy xuất được dữ liệu hệ thống
- Tự động chuyển sang chế độ tư vấn thông thường
- Đảm bảo luôn có phản hồi cho user

### 3. Real-time data
- Dữ liệu luôn được cập nhật từ SQL Server
- Phản ánh tình trạng thiết bị real-time
- Đồng bộ với các thay đổi trên frontend

---

🎉 **Giờ đây bạn có thể hỏi AI về bất kỳ thông tin nào trong hệ thống quản lý thiết bị và nhận được câu trả lời chính xác dựa trên dữ liệu thực!**