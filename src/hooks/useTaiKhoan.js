import { useEffect, useState } from "react";
import { nguoiDangDangNhap, SU_KIEN_TAI_KHOAN } from "../services/taiKhoanService.js";

// Người đang đăng nhập (hoặc null). Tự cập nhật khi đăng nhập/đăng xuất ở tab
// này (sự kiện SU_KIEN_TAI_KHOAN) hoặc ở tab khác (sự kiện "storage").
export default function useTaiKhoan() {
  const [nguoi, setNguoi] = useState(nguoiDangDangNhap);

  useEffect(() => {
    const capNhat = () => setNguoi(nguoiDangDangNhap());
    window.addEventListener(SU_KIEN_TAI_KHOAN, capNhat);
    window.addEventListener("storage", capNhat);
    return () => {
      window.removeEventListener(SU_KIEN_TAI_KHOAN, capNhat);
      window.removeEventListener("storage", capNhat);
    };
  }, []);

  return nguoi;
}
