import HeroHoiDap from "../sections/hoi-dap/HeroHoiDap.jsx";
import DiaPhuongTieuBieu from "../sections/hoi-dap/DiaPhuongTieuBieu.jsx";
import NguonTriThuc from "../sections/hoi-dap/NguonTriThuc.jsx";
import DangKyDiaPhuong from "../sections/hoi-dap/DangKyDiaPhuong.jsx";

// ============================================================
// Trang chủ = trang HỎI ĐÁP AI cho địa phương (từ 13/11/2026).
//
// Định hướng mới của công ty (11/2026): iMob cho thuê chatbot AI (RAG) cho các
// địa phương; imob.vn chỉ còn hai mục — Hỏi đáp AI (trang này) và Về chúng tôi
// (pages/VeChungToiPage.jsx, chính là trang chủ cũ). Bố cục theo giao diện
// công ty chốt 13/11/2026; các chỗ cố ý khác ảnh mẫu ghi ở đầu từng file khối.
//
//   1. HeroHoiDap        — ô hỏi lớn: chọn vùng, vai trò, câu gợi ý
//   2. DiaPhuongTieuBieu — thẻ các địa phương (data/diaPhuong.json)
//   3. NguonTriThuc      — RAG bằng lời thường + dải "trả lời kèm nguồn"
//   4. DangKyDiaPhuong   — dải tối + form đăng ký cho địa phương (#dang-ky)
//
// Nhịp nền: kem (paper) · kem đậm (mist) · kem · xanh rừng đậm — không có hai
// dải cùng màu đứng cạnh nhau.
//
// Trang chat cả màn hình (ảnh mẫu thứ 4) CHƯA làm: cần tài liệu API của nền
// tảng chatbot (anh Thắng). Hiện mọi nút hỏi đều mở khung chat của nền tảng.
// ============================================================
export default function HomePage() {
  return (
    <>
      <HeroHoiDap />
      <DiaPhuongTieuBieu />
      <NguonTriThuc />
      <DangKyDiaPhuong />
    </>
  );
}
