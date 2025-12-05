using System.Collections.Generic;
using backend.Models.Enums;

namespace backend.Data;

/// <summary>
/// Bộ câu mẫu tiếng Việt dùng để huấn luyện/khởi tạo Naive Bayes cho chatbot.
/// Mỗi intent nên có nhiều câu đa dạng để mô hình phân biệt tốt hơn.
/// </summary>
public static class ChatbotTrainingSamples
{
    public static IReadOnlyDictionary<ChatIntent, IReadOnlyList<string>> GetSamples()
    {
        return new Dictionary<ChatIntent, IReadOnlyList<string>>
        {
            {
                ChatIntent.TraCuuThietBi,
                new List<string>
                {
                    "Cho tôi tra cứu thông tin thiết bị",
                    "Tìm thiết bị theo mã",
                    "Thiết bị laptop của phòng IT đang ở đâu",
                    "Danh sách thiết bị đang sử dụng",
                    "Tra cứu thiết bị của phòng nhân sự",
                    "Xem chi tiết thiết bị ABC123",
                    "Tìm kiếm thiết bị bị hỏng",
                    "Liệt kê toàn bộ thiết bị của công ty",
                    "Tìm thiết bị theo số serial",
                    "Tra cứu tài sản cố định máy tính",
                }
            },
            {
                ChatIntent.BaoCaoSuCo,
                new List<string>
                {
                    "Tôi muốn báo cáo sự cố thiết bị",
                    "Tạo phiếu sự cố mới",
                    "Báo hỏng máy in",
                    "Thiết bị không hoạt động, tạo báo cáo giúp tôi",
                    "Gửi báo cáo sự cố cho phòng IT",
                    "Máy tính bị lỗi màn hình xanh",
                    "Tạo ticket sự cố cho thiết bị này",
                    "Báo cáo lỗi kết nối mạng",
                    "Báo cáo sự cố máy chiếu",
                    "Thiết bị gặp trục trặc cần báo cáo",
                }
            },
            {
                ChatIntent.ThongKeThietBiTheoPhongBan,
                new List<string>
                {
                    "Thống kê thiết bị theo phòng ban",
                    "Cho tôi xem số lượng thiết bị của từng phòng",
                    "Báo cáo thiết bị của phòng kinh doanh",
                    "Thống kê thiết bị phòng nhân sự",
                    "Danh sách thiết bị theo từng bộ phận",
                    "Báo cáo số lượng máy tính theo phòng",
                    "Thống kê tài sản thiết bị của các phòng ban",
                    "Thống kê thiết bị phòng IT",
                    "Cho tôi biểu đồ thiết bị theo phòng ban",
                    "Số lượng thiết bị đang sử dụng ở từng phòng",
                }
            },
            {
                ChatIntent.HuongDanSuDung,
                new List<string>
                {
                    "Hướng dẫn sử dụng hệ thống quản lý thiết bị",
                    "Cách tạo báo cáo sự cố",
                    "Hướng dẫn thanh lý thiết bị",
                    "Chỉ tôi cách thêm thiết bị mới",
                    "Làm sao để xuất báo cáo thiết bị",
                    "Hướng dẫn sử dụng máy in mới",
                    "Cách kiểm tra lịch sử sửa chữa thiết bị",
                    "Hướng dẫn tra cứu thiết bị theo phòng ban",
                    "Hướng dẫn tạo tài khoản cho nhân viên",
                    "Tôi cần tài liệu hướng dẫn sử dụng",
                    "Cách báo cáo sự cố",
                    "Hướng dẫn cách báo cáo sự cố",
                    "Làm sao để gửi báo cáo sự cố",
                    "Chỉ tôi các bước báo cáo sự cố"
                }
            },
            {
                ChatIntent.KiemTraTinhTrangSuaChua,
                new List<string>
                {
                    "Kiểm tra tình trạng sửa chữa thiết bị",
                    "Thiết bị của tôi đang sửa đến đâu rồi",
                    "Tra cứu lệnh sửa chữa",
                    "Xem tiến độ sửa chữa máy tính",
                    "Tình trạng phiếu sửa chữa hiện tại",
                    "Thiết bị đang chờ sửa hay đã hoàn thành",
                    "Kiểm tra trạng thái repair của thiết bị",
                    "Danh sách thiết bị đang sửa chữa",
                    "Thiết bị này đã sửa xong chưa",
                    "Trạng thái đơn sửa chữa mới nhất",
                }
            }
        };
    }
}


