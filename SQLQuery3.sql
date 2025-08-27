-- ===================================
-- Bảng chính không có khóa ngoại
-- ===================================

-- 1. Departments (Phòng ban)
CREATE TABLE Departments (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của phòng ban
    DepartmentName NVARCHAR(150) NOT NULL, -- Tên phòng ban
    DepartmentCode NVARCHAR(50) UNIQUE, -- Mã phòng ban (duy nhất)
    Location NVARCHAR(255), -- Vị trí
    IsDeleted BIT DEFAULT 0, -- Cờ đánh dấu đã xóa mềm
    UpdatedAt DATETIME NULL, -- Thời gian cập nhật cuối cùng
    UpdatedBy UNIQUEIDENTIFIER NULL, -- Người cập nhật cuối cùng
    DeletedAt DATETIME NULL, -- Thời điểm xóa
    DeletedBy UNIQUEIDENTIFIER NULL, -- Người xóa
);

-- 2. DeviceTypes (Loại thiết bị)
CREATE TABLE DeviceTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của loại thiết bị
    TypeName NVARCHAR(100) UNIQUE NOT NULL, -- Tên loại thiết bị (ví dụ: Laptop, Monitor)
    Description NVARCHAR(255) -- Mô tả chi tiết
);

-- 3. Suppliers (Nhà cung cấp)
CREATE TABLE Suppliers (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của nhà cung cấp
    SupplierName NVARCHAR(150) NOT NULL, -- Tên nhà cung cấp
    ContactPerson NVARCHAR(100), -- Người liên hệ
    Email NVARCHAR(100), -- Email liên hệ
    Phone NVARCHAR(20), -- Số điện thoại liên hệ
    IsDeleted BIT DEFAULT 0, -- Cờ đánh dấu đã xóa mềm
    UpdatedAt DATETIME NULL, -- Thời gian cập nhật cuối cùng
    UpdatedBy UNIQUEIDENTIFIER NULL, -- Người cập nhật cuối cùng
    DeletedAt DATETIME NULL, -- Thời điểm xóa
    DeletedBy UNIQUEIDENTIFIER NULL, -- Người xóa
);

-- ===================================
-- Bảng phụ thuộc cấp 1
-- ===================================

-- 4. Users (Người dùng) - Phụ thuộc vào Departments
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của người dùng
    FullName NVARCHAR(100), -- Họ và tên đầy đủ
    Email NVARCHAR(100) UNIQUE, -- Email người dùng (duy nhất)
    PasswordHash NVARCHAR(255), -- Hash mật khẩu
    Role NVARCHAR(20), -- Vai trò (ví dụ: Admin, User,...)
    DepartmentId UNIQUEIDENTIFIER NULL, -- Mã phòng ban của người dùng
    Position NVARCHAR(100) NULL, --Vị trí trong phòng ban (nhân viên, trưởng phòng,...)
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo tài khoản
    IsActive BIT DEFAULT 1, -- Trạng thái hoạt động
    IsDeleted BIT DEFAULT 0, -- Cờ đánh dấu đã xóa mềm
    UpdatedAt DATETIME NULL, -- Thời gian cập nhật cuối cùng
    UpdatedBy UNIQUEIDENTIFIER NULL, -- Người cập nhật cuối cùng
    FOREIGN KEY (DepartmentId) REFERENCES Departments(Id), -- Khóa ngoại liên kết với bảng Departments
    DeletedAt DATETIME NULL, -- Thời điểm xóa
    DeletedBy UNIQUEIDENTIFIER NULL -- Người xóa
);

-- 5. DeviceModels (Mẫu thiết bị) - Phụ thuộc vào DeviceTypes
CREATE TABLE DeviceModels (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của mẫu thiết bị
    ModelName NVARCHAR(150) NOT NULL, -- Tên mẫu thiết bị
    DeviceTypeId UNIQUEIDENTIFIER, -- Mã loại thiết bị
    Manufacturer NVARCHAR(100), -- Nhà sản xuất
    Specifications NVARCHAR(MAX), -- Thông số kỹ thuật
    IsDeleted BIT DEFAULT 0, -- Cờ đánh dấu đã xóa mềm
    UpdatedAt DATETIME NULL, -- Thời gian cập nhật cuối cùng
    UpdatedBy UNIQUEIDENTIFIER NULL, -- Người cập nhật cuối cùng
    FOREIGN KEY (DeviceTypeId) REFERENCES DeviceTypes(Id), -- Khóa ngoại liên kết với bảng DeviceTypes
    DeletedAt DATETIME NULL, -- Thời điểm xóa
    DeletedBy UNIQUEIDENTIFIER NULL -- Người xóa
);

-- ===================================
-- Bảng phụ thuộc cấp 2 và cấp 3
-- ===================================

-- 6. Devices (Thiết bị) - Phụ thuộc vào DeviceModels, Suppliers, Departments, Users
CREATE TABLE Devices (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của thiết bị
    DeviceCode NVARCHAR(50) UNIQUE, -- Mã thiết bị (duy nhất)
    DeviceName NVARCHAR(100), -- Tên thiết bị
    ModelId UNIQUEIDENTIFIER, -- Mã mẫu thiết bị
    SupplierId UNIQUEIDENTIFIER NULL, -- Mã nhà cung cấp
    PurchasePrice DECIMAL(18, 2) DEFAULT 0, -- Giá mua
    SerialNumber NVARCHAR(100), -- Số serial
    Status NVARCHAR(50), -- Trạng thái (ví dụ: Available, In Use, Repairing)
    PurchaseDate DATE, -- Ngày mua
    WarrantyExpiry DATE, -- Ngày hết hạn bảo hành
    CurrentDepartmentId UNIQUEIDENTIFIER NULL, -- Mã phòng ban hiện tại
    CurrentUserId UNIQUEIDENTIFIER NULL, -- Mã người dùng hiện tại
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo
    IsDeleted BIT DEFAULT 0, -- Cờ đánh dấu đã xóa mềm
    UpdatedAt DATETIME NULL, -- Thời gian cập nhật cuối cùng
    UpdatedBy UNIQUEIDENTIFIER NULL, -- Người cập nhật cuối cùng
    Barcode NVARCHAR(100) NULL, -- Mã vạch
    DeviceImageUrl NVARCHAR(255) NULL, -- URL hình ảnh thiết bị
    WarrantyProvider NVARCHAR(150) NULL, -- Đơn vị bảo hành
    FOREIGN KEY (ModelId) REFERENCES DeviceModels(Id), -- Khóa ngoại liên kết với bảng DeviceModels
    FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id), -- Khóa ngoại liên kết với bảng Suppliers
    FOREIGN KEY (CurrentDepartmentId) REFERENCES Departments(Id), -- Khóa ngoại liên kết với bảng Departments
    FOREIGN KEY (CurrentUserId) REFERENCES Users(Id), -- Khóa ngoại liên kết với bảng Users
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id), -- Khóa ngoại liên kết với bảng Users (người cập nhật)
    DeletedAt DATETIME NULL, -- Thời điểm xóa
    DeletedBy UNIQUEIDENTIFIER NULL -- Người xóa
);

-- Bổ sung khóa ngoại cho các bảng ban đầu đã tham chiếu đến Users
ALTER TABLE Departments
ADD FOREIGN KEY (DeletedBy) REFERENCES Users(Id);

ALTER TABLE Suppliers
ADD FOREIGN KEY (DeletedBy) REFERENCES Users(Id);

ALTER TABLE DeviceModels
ADD FOREIGN KEY (UpdatedBy) REFERENCES Users(Id),
FOREIGN KEY (DeletedBy) REFERENCES Users(Id);

-- ===================================
-- Các bảng cuối cùng phụ thuộc vào Devices, Users
-- ===================================

-- 7. DeviceAssignments (Lịch sử cấp phát thiết bị)
CREATE TABLE DeviceAssignments (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của lượt cấp phát
    DeviceId UNIQUEIDENTIFIER, -- Mã thiết bị
    AssignedToUserId UNIQUEIDENTIFIER NULL, -- Mã người dùng được cấp
    AssignedToDepartmentId UNIQUEIDENTIFIER, -- Mã phòng ban được cấp
    AssignedDate DATE, -- Ngày cấp phát
    Note NVARCHAR(255), -- Ghi chú
    ReturnedDate DATE NULL, -- Ngày trả thiết bị
    FOREIGN KEY (DeviceId) REFERENCES Devices(Id), -- Khóa ngoại liên kết với bảng Devices
    FOREIGN KEY (AssignedToUserId) REFERENCES Users(Id), -- Khóa ngoại liên kết với bảng Users
    FOREIGN KEY (AssignedToDepartmentId) REFERENCES Departments(Id) -- Khóa ngoại liên kết với bảng Departments
);

-- 8. IncidentReports (Báo cáo sự cố)
CREATE TABLE IncidentReports (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của báo cáo
    DeviceId UNIQUEIDENTIFIER, -- Mã thiết bị gặp sự cố
    ReportedByUserId UNIQUEIDENTIFIER, -- Mã người dùng báo cáo sự cố
    ReportType NVARCHAR(50), -- Loại báo cáo (ví dụ: Hỏng hóc, Mất mát)
    Description NVARCHAR(MAX), -- Mô tả chi tiết sự cố
    ReportDate DATETIME DEFAULT GETDATE(), -- Thời gian người dùng tạo báo cáo
    Status INT NOT NULL DEFAULT 0, -- Trạng thái xử lý (0=Chờ duyệt, 1=Đã duyệt, 2=Đã tạo lệnh sửa, 3=Đã từ chối)
    ImageUrl NVARCHAR(255), -- URL hình ảnh minh họa sự cố (nếu có)
    -- Thông tin từ chối báo cáo (nếu có)
    RejectedBy UNIQUEIDENTIFIER NULL, -- Mã người từ chối xử lý (thường là admin)
    RejectedReason NVARCHAR(500) NULL, -- Lý do từ chối báo cáo
    RejectedAt DATETIME NULL, -- Thời điểm từ chối
    -- Ràng buộc khóa ngoại
    FOREIGN KEY (DeviceId) REFERENCES Devices(Id),
    FOREIGN KEY (ReportedByUserId) REFERENCES Users(Id),
    FOREIGN KEY (RejectedBy) REFERENCES Users(Id)
);

-- 9. Repairs (Lệnh sửa chữa)
CREATE TABLE Repairs (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của lượt sửa chữa
    DeviceId UNIQUEIDENTIFIER, -- Mã thiết bị được sửa
    IncidentReportId UNIQUEIDENTIFIER NULL, -- Mã báo cáo sự cố liên quan (nếu có)
    RepairDate DATE, -- Ngày thực hiện sửa chữa
    Description NVARCHAR(MAX), -- Mô tả công việc sửa chữa
    Cost DECIMAL(18, 2), -- Chi phí sửa chữa (nếu có)
    LaborHours DECIMAL(5, 2) DEFAULT 0, -- Số giờ lao động kỹ thuật
    RepairCompany NVARCHAR(255), -- Tên đơn vị hoặc cá nhân sửa chữa
    Status INT NOT NULL DEFAULT 0, -- Trạng thái (0=Chờ thực hiện, 1=Đang sửa, 2=Chờ duyệt hoàn tất, 3=Đã hoàn tất, 4=Không cần sửa, 5=Kỹ thuật từ chối)
    -- Thông tin từ chối tiếp nhận sửa chữa (nếu có)
    RejectedBy UNIQUEIDENTIFIER NULL, -- Mã người từ chối sửa chữa (thường là kỹ thuật viên)
    RejectedReason NVARCHAR(500) NULL, -- Lý do từ chối
    RejectedAt DATETIME NULL, -- Thời điểm từ chối sửa chữa
    -- Ràng buộc khóa ngoại
    FOREIGN KEY (DeviceId) REFERENCES Devices(Id),
    FOREIGN KEY (IncidentReportId) REFERENCES IncidentReports(Id),
    FOREIGN KEY (RejectedBy) REFERENCES Users(Id)
);

-- 10. Replacements (Thay thế)
CREATE TABLE Replacements (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của lượt thay thế
    OldDeviceId UNIQUEIDENTIFIER, -- Mã thiết bị cũ
    NewDeviceId UNIQUEIDENTIFIER, -- Mã thiết bị mới
    ReplacementDate DATE, -- Ngày thay thế
    Reason NVARCHAR(MAX), -- Lý do thay thế
    FOREIGN KEY (OldDeviceId) REFERENCES Devices(Id), -- Khóa ngoại liên kết với thiết bị cũ
    FOREIGN KEY (NewDeviceId) REFERENCES Devices(Id) -- Khóa ngoại liên kết với thiết bị mới
);

-- 11. Liquidations (Thanh lý)
CREATE TABLE Liquidations (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của lượt thanh lý
    DeviceId UNIQUEIDENTIFIER, -- Mã thiết bị được thanh lý
    Reason NVARCHAR(MAX), -- Lý do thanh lý
    LiquidationDate DATE, -- Ngày thanh lý
    ApprovedBy UNIQUEIDENTIFIER, -- Người phê duyệt
    FOREIGN KEY (DeviceId) REFERENCES Devices(Id), -- Khóa ngoại liên kết với bảng Devices
    FOREIGN KEY (ApprovedBy) REFERENCES Users(Id) -- Khóa ngoại liên kết với bảng Users (người phê duyệt)
);

-- 12. DeviceHistories (Lịch sử thiết bị)
CREATE TABLE DeviceHistories (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của lịch sử
    DeviceId UNIQUEIDENTIFIER, -- Mã thiết bị
    Action NVARCHAR(100), -- Hành động (ví dụ: 'Assigned', 'Repaired')
    Description NVARCHAR(MAX), -- Mô tả chi tiết hành động
    ActionBy UNIQUEIDENTIFIER, -- Người thực hiện hành động
    ActionDate DATETIME DEFAULT GETDATE(), -- Thời gian thực hiện
    FOREIGN KEY (DeviceId) REFERENCES Devices(Id), -- Khóa ngoại liên kết với bảng Devices
    FOREIGN KEY (ActionBy) REFERENCES Users(Id) -- Khóa ngoại liên kết với bảng Users (người thực hiện)
);

-- 13. Notifications (Thông báo)
CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của thông báo
    UserId UNIQUEIDENTIFIER, -- Mã người dùng nhận thông báo
    Title NVARCHAR(255), -- Tiêu đề thông báo
    Content NVARCHAR(MAX), -- Nội dung thông báo
    IsRead BIT DEFAULT 0, -- Trạng thái đã đọc hay chưa
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo
    FOREIGN KEY (UserId) REFERENCES Users(Id) -- Khóa ngoại liên kết với bảng Users
);

-- 14. ReportExports (Xuất báo cáo)
CREATE TABLE ReportExports (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã định danh duy nhất của lượt xuất báo cáo
    ExportedBy UNIQUEIDENTIFIER, -- Người thực hiện xuất báo cáo
    ReportType NVARCHAR(50), -- Loại báo cáo
    ExportDate DATETIME DEFAULT GETDATE(), -- Thời gian xuất
    FileUrl NVARCHAR(255), -- URL tệp báo cáo
    FOREIGN KEY (ExportedBy) REFERENCES Users(Id) -- Khóa ngoại liên kết với bảng Users
);

-- 15. RepairImages: Lưu nhiều hình ảnh minh họa trước và sau sửa chữa
CREATE TABLE RepairImages (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã hình ảnh
    RepairId UNIQUEIDENTIFIER,       -- Liên kết lượt sửa chữa
    ImageUrl NVARCHAR(255),          -- Đường dẫn ảnh minh họa
    IsAfterRepair BIT DEFAULT 0,     -- 0=Trước sửa, 1=Sau sửa
    UploadedAt DATETIME DEFAULT GETDATE(), -- Thời gian tải lên
    UploadedBy UNIQUEIDENTIFIER,     -- Người tải ảnh
    FOREIGN KEY (RepairId) REFERENCES Repairs(Id),
    FOREIGN KEY (UploadedBy) REFERENCES Users(Id)
);

-- 16. RepairFeedback: Đánh giá lượt sửa chữa
CREATE TABLE RepairFeedback (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã đánh giá
    RepairId UNIQUEIDENTIFIER,       -- Liên kết lượt sửa
    Rating INT CHECK (Rating BETWEEN 1 AND 5), -- Điểm đánh giá 1–5 sao
    Comment NVARCHAR(MAX),           -- Nhận xét
    CreatedBy UNIQUEIDENTIFIER,      -- Người đánh giá
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian đánh giá
    FOREIGN KEY (RepairId) REFERENCES Repairs(Id),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);

-- 17. DeviceStatusLogs: Nhật ký thay đổi trạng thái thiết bị
CREATE TABLE DeviceStatusLogs (
    Id UNIQUEIDENTIFIER PRIMARY KEY, -- Mã log
    DeviceId UNIQUEIDENTIFIER,       -- Mã thiết bị
    OldStatus NVARCHAR(100),         -- Trạng thái cũ
    NewStatus NVARCHAR(100),         -- Trạng thái mới
    ChangedAt DATETIME DEFAULT GETDATE(), -- Thời gian thay đổi
    ChangedBy UNIQUEIDENTIFIER,      -- Người thay đổi
    Note NVARCHAR(MAX),              -- Ghi chú lý do thay đổi
    FOREIGN KEY (DeviceId) REFERENCES Devices(Id),
    FOREIGN KEY (ChangedBy) REFERENCES Users(Id)
);



--dữ liệu mẫu
-- Dữ liệu mẫu cho Admin
INSERT INTO Users (
    Id,
    FullName,
    Email,
    PasswordHash,
    Role,
    DepartmentId,
    Position,
    CreatedAt,
    IsActive,
    IsDeleted
) VALUES (
    NEWID(), -- Id tự sinh
    N'Quản trị viên hệ thống',
    'admin@example.com',
    'AQAAAAIAAYagAAAAEFbyIaGviH5kci1odA9V0Zu9gZoJkVF7DH2Eq/KEZptf560MZ4FyDcoArYiABrI9CQ==', -- Thay bằng hash thực tế khi triển khai
    N'Admin',
    NULL,
    N'Quản trị hệ thống',
    GETDATE(),
    1,
    0
);
select * from Departments
select * from Users