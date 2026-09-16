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
// ⚠️ VÌ SAO PHẢI GHÉP API_BASE_URL VÀO "/api/anh/<mã>":
// khi website và API nằm ở HAI tên miền khác nhau, để nguyên đường dẫn tương
// đối là trình duyệt đi tìm ảnh ngay trên tên miền của website. Mà website là
// trang đơn (SPA) nên luật "đường dẫn lạ thì trả index.html" sẽ nuốt luôn lời
// gọi đó: "/api/anh/abc" KHÔNG trả 404 mà trả về index.html kèm mã 200. Thẻ
// <img> nhận một cục HTML rồi báo lỗi tải ảnh — nhìn vào chỉ thấy "ảnh vỡ",
// không có manh mối nào chỉ ra nguyên nhân thật.
//
// Từ 15/09/2026 hệ thống chạy trên MỘT máy chủ CMC Cloud: nginx nhận /api/*
// chuyển thẳng cho uvicorn, phần còn lại mới rơi vào luật SPA. API_BASE_URL
// lúc này RỖNG và đường dẫn tương đối chạy đúng — thứ tự khối location trong
// trien-khai/nginx-imob.conf là cái bảo đảm điều đó.
//
// Giữ nguyên đoạn ghép này chứ không xoá: nó vô hại khi cùng tên miền, và là
// thứ duy nhất cứu được nếu sau này lại tách API sang máy khác.
//
// Lúc chạy ở máy thì API_BASE_URL cũng rỗng và vite.config.js đã chuyển tiếp
// /api/* sang cổng 8000, nên vẫn đúng mà không phải phân nhánh thêm.
// ============================================================
export function diaChiAnh(duongDan) {
  const d = (duongDan ?? "").trim();
  if (!d) return "";
  if (/^(https?:)?\/\//i.test(d) || d.startsWith("data:")) return d;
  if (d.startsWith("/api/")) return `${API_BASE_URL}${d}`;
  return d;
}
