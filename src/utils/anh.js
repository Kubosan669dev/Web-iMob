import { API_BASE_URL } from "./constants.js";

// ============================================================
// Địa chỉ thật của một tấm ảnh.
//
// Trường `anh` trong CMS chứa MỘT TRONG BA dạng:
//
//   /anh/ten-file.webp    ảnh đóng gói sẵn trong public/anh/ — website tự phục
//                         vụ, nhanh nhất, không bao giờ ngủ
//   /api/anh/<mã>         ảnh do người dùng tải lên trong trang quản trị, nằm
//                         trong database và do máy chủ API phục vụ
//   https://...           ảnh ở nơi khác
//
// ⚠️ VÌ SAO KHÔNG ĐỂ NGUYÊN "/api/anh/<mã>" MÀ PHẢI GHÉP TÊN MIỀN:
// website chạy trên Vercel còn API chạy trên Render — hai tên miền khác nhau.
// Tệ hơn nữa, vercel.json có luật rewrite "/(.*)" -> "/index.html" để trang
// đơn (SPA) hoạt động, nên "/api/anh/abc" trên Vercel KHÔNG trả về 404 mà trả
// về trang index.html kèm mã 200. Thẻ <img> nhận một cục HTML rồi báo lỗi tải
// ảnh — nhìn vào chỉ thấy "ảnh vỡ" chứ không có manh mối nào chỉ ra nguyên
// nhân thật. Ghép API_BASE_URL vào là hết.
//
// Lúc chạy ở máy thì API_BASE_URL rỗng và vite.config.js đã chuyển tiếp /api/*
// sang cổng 8000, nên vẫn đúng mà không phải phân nhánh thêm.
// ============================================================
export function diaChiAnh(duongDan) {
  const d = (duongDan ?? "").trim();
  if (!d) return "";
  if (/^(https?:)?\/\//i.test(d) || d.startsWith("data:")) return d;
  if (d.startsWith("/api/")) return `${API_BASE_URL}${d}`;
  return d;
}
