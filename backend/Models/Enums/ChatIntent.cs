using System.Text.Json.Serialization;

namespace backend.Models.Enums;

public enum ChatIntent
{
    Unknown = 0,

    /// <summary>
    /// Tra cứu / tìm kiếm thông tin thiết bị.
    /// </summary>
    TraCuuThietBi = 1,

    /// <summary>
    /// Báo cáo, tạo phiếu sự cố thiết bị.
    /// </summary>
    BaoCaoSuCo = 2,

    /// <summary>
    /// Thống kê, báo cáo thiết bị theo phòng ban.
    /// </summary>
    ThongKeThietBiTheoPhongBan = 3,

    /// <summary>
    /// Hướng dẫn sử dụng thiết bị, quy trình.
    /// </summary>
    HuongDanSuDung = 4,

    /// <summary>
    /// Kiểm tra, tra cứu tình trạng sửa chữa thiết bị.
    /// </summary>
    KiemTraTinhTrangSuaChua = 5
}


