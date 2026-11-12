import { Navigate, useLocation } from "react-router-dom";
import bang from "../../data/chuyenHuong.json";
import { timDichChuyenHuong } from "../../utils/chuyenHuong.js";

// ChuyenHuongCu: bọc quanh <Routes>. Khách vào một link cũ (trang dịch vụ, tin
// tức, imob.vn/#about…) thì đưa sang trang mới thay vì hiện trang cũ.
//
// Trên máy chủ thật, nginx đã trả 301 trước khi web kịp tải (xem
// trien-khai/nginx-chuyen-huong.conf) — Google cần mã 301 thật mới chuyển thứ
// hạng sang trang mới. Component này lo hai trường hợp nginx không thấy:
//   • link có dấu # (imob.vn/#contact): phần sau # không gửi lên máy chủ;
//   • chạy `npm run dev` trên máy mình, không có nginx.
//
// Công tắc `bat` nằm trong data/chuyenHuong.json. Đang tắt thì component này
// không làm gì cả.
export default function ChuyenHuongCu({ children }) {
  const { pathname, hash } = useLocation();
  const dich = bang.bat ? timDichChuyenHuong(bang, pathname, hash) : null;

  // replace: không để link cũ lại trong lịch sử — bấm Quay lại không bị đẩy
  // sang trang mới lần nữa.
  return dich ? <Navigate to={dich} replace /> : children;
}
