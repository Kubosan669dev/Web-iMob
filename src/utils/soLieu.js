// ============================================================
// Số liệu công bố ra ngoài — ĐẾM, KHÔNG GÕ TAY.
//
// Bản trước ghi thẳng "50+ dự án · 30+ khách hàng · 99% hài lòng" vào JSON,
// lặp lại ở 8 chỗ khác nhau. Không ấn phẩm nào của công ty có ba con số đó và
// không ai còn nhớ chúng từ đâu ra. Với khách là cơ quan nhà nước thì một con
// số không chứng minh được chính là chỗ dễ bị vặn nhất lúc thẩm định hồ sơ —
// đặc biệt là "99% mức độ hài lòng", thứ chỉ đúng khi có phiếu khảo sát thật.
//
// Giờ mọi con số đều đếm từ danh sách sản phẩm thật (sửa trong /admin → Sản
// phẩm). Thêm một sản phẩm là số tự tăng. Nó không thể nói sai được nữa, vì nó
// không còn là một câu chữ ai đó chép lại mà là kết quả của một phép đếm.
//
// ĐỔI LẠI: số nhỏ hơn nhiều so với "50+". Chấp nhận — với khách cơ quan nhà
// nước, cái tên "Khu di tích Yên Tử" và "Bảo tàng – Thư viện tỉnh Quảng Ninh"
// nặng hơn hẳn một con số không ai kiểm được, mà hai cái tên đó thì thật.
// ============================================================

/** Đếm ba chỉ số từ danh sách sản phẩm. Trả về số nguyên, chưa định dạng. */
export function demSoLieu(sanPham) {
  const ds = sanPham ?? [];
  // Đếm giá trị KHÁC NHAU: hai sản phẩm cùng một phường thì đó vẫn là một
  // đơn vị, đếm thành hai là thổi phồng đúng kiểu ta vừa bỏ đi.
  const soKhacNhau = (truong) =>
    new Set(ds.map((s) => (s?.[truong] ?? "").trim()).filter(Boolean)).size;

  return {
    sanPham: ds.length,
    donVi: soKhacNhau("khachHang"),
    nhom: soKhacNhau("loai"),
  };
}

/**
 * Danh sách sản phẩm dạng markdown, để chatbot đọc cho khách nghe.
 *
 * Bản trước kho kiến thức chép tay 6 dòng dự án — và cả 6 đều KHÔNG CÓ THẬT
 * ("Zalo Mini App đặt lịch Spa", "Ứng dụng quản lý nhà hàng"...). Bot nói ra
 * như thể chắc chắn, khách hỏi xin xem thì không có gì để đưa. Giờ nó đọc
 * đúng danh sách đang hiện trên trang chủ, không hơn.
 */
export function danhSachMarkdown(sanPham) {
  return (sanPham ?? [])
    .filter((s) => s?.title)
    .map((s) => {
      const ten = s.title.trim();
      const khach = (s.khachHang ?? "").trim();
      // Bỏ tên đơn vị khi nó TRÙNG tên sản phẩm — "Bảo tàng – Thư viện tỉnh
      // Quảng Ninh — Zalo Mini App, Bảo tàng – Thư viện tỉnh Quảng Ninh" đọc
      // lên thành một câu lắp bắp.
      const phu = [(s.loai ?? "").trim(), khach === ten ? "" : khach].filter(Boolean);
      return `- **${ten}**${phu.length ? ` — ${phu.join(", ")}` : ""}`;
    })
    .join("\n");
}

/** Ba ô số cho dải thống kê (trang chủ và các trang dịch vụ dùng chung). */
export function soLieuHienThi(sanPham) {
  const s = demSoLieu(sanPham);
  return [
    { value: String(s.sanPham), label: "Sản phẩm đang chạy" },
    { value: String(s.donVi), label: "Cơ quan, đơn vị" },
    { value: String(s.nhom), label: "Nhóm giải pháp" },
  ];
}
