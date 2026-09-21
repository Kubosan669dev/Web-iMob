import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  dangKy as goiDangKy,
  dangNhap as goiDangNhap,
  dangXuat as goiDangXuat,
  hoSoCuaToi,
  nguoiDangDangNhap,
} from "../services/taiKhoanService.js";

// ============================================================
// TaiKhoanContext — ai đang đăng nhập, cho cả website biết.
//
// VÌ SAO CẦN CONTEXT chứ không để mỗi trang tự đọc localStorage: thanh menu và
// trang hồ sơ phải nhìn thấy CÙNG một sự thật. Để mỗi nơi tự đọc thì bấm "Đăng
// xuất" ở trang hồ sơ xong, thanh menu phía trên vẫn hiện tên — vì nó không
// biết có chuyện gì vừa xảy ra, và chỉ đúng lại sau khi tải lại trang.
//
// KHÔNG DÙNG CHO TRANG /admin. Trang đó có bộ đăng nhập riêng trong
// adminService.js, cất vé ở khóa khác. Xem ghi chú đầu taiKhoanService.js.
// ============================================================

const Boi = createContext(null);

export function TaiKhoanProvider({ children }) {
  // Đọc từ trình duyệt NGAY lúc dựng, không chờ máy chủ. Chờ thì mỗi lần tải
  // trang thanh menu sẽ chớp một nhịp "Đăng nhập" rồi mới đổi thành tên người
  // dùng — nhìn như bị đăng xuất.
  const [nguoi, setNguoi] = useState(() => nguoiDangDangNhap());
  const [dangKiemTra, setDangKiemTra] = useState(() => nguoiDangDangNhap() !== null);

  // Rồi mới hỏi máy chủ xem vé còn giá trị không. Vé sống 8 tiếng nên chuyện
  // "trình duyệt tưởng còn đăng nhập mà thật ra hết hạn" xảy ra hằng ngày.
  useEffect(() => {
    if (!nguoiDangDangNhap()) {
      setDangKiemTra(false);
      return;
    }
    let conHieuLuc = true;
    hoSoCuaToi()
      .then((hs) => conHieuLuc && setNguoi(hs))
      .catch((err) => {
        if (!conHieuLuc) return;
        // 401 = vé hỏng/hết hạn, service đã xóa vé -> coi như chưa đăng nhập.
        // Lỗi mạng thì GIỮ NGUYÊN trạng thái: mất mạng một lúc không phải lý
        // do để đá người ta ra.
        if (err.ma === 401) setNguoi(null);
      })
      .finally(() => conHieuLuc && setDangKiemTra(false));
    return () => {
      conHieuLuc = false;
    };
  }, []);

  // Đăng nhập/đăng ký chỉ trả về đủ thứ cần để vào: vé, tên, vai. Hồ sơ đầy đủ
  // (ngày tham gia, lần đăng nhập trước) nằm ở /api/toi. Lấy thêm một nhịp nữa
  // cho xong, nếu không thì trang hồ sơ vừa mở sẽ thiếu ngày tham gia và chỉ
  // hiện ra sau khi tải lại trang — trông như dữ liệu bị mất.
  //
  // Lời gọi phụ này hỏng thì KỆ. Người ta đã đăng nhập được rồi, không có lý
  // do gì để một dòng ngày tháng làm hỏng việc đó.
  const vaoVaLayHoSo = useCallback(async (goi, thongTin) => {
    const kq = await goi(thongTin);
    setNguoi(kq);
    try {
      const hs = await hoSoCuaToi();
      setNguoi((cu) => ({ ...cu, ...hs }));
    } catch {
      /* giữ nguyên thông tin rút gọn */
    }
    return kq;
  }, []);

  const dangNhap = useCallback(
    (thongTin) => vaoVaLayHoSo(goiDangNhap, thongTin),
    [vaoVaLayHoSo],
  );

  const dangKy = useCallback(
    (thongTin) => vaoVaLayHoSo(goiDangKy, thongTin),
    [vaoVaLayHoSo],
  );

  const dangXuat = useCallback(() => {
    goiDangXuat();
    setNguoi(null);
  }, []);

  const giaTri = useMemo(
    () => ({ nguoi, dangKiemTra, dangNhap, dangKy, dangXuat, capNhat: setNguoi }),
    [nguoi, dangKiemTra, dangNhap, dangKy, dangXuat],
  );

  return <Boi.Provider value={giaTri}>{children}</Boi.Provider>;
}

export function useTaiKhoan() {
  const giaTri = useContext(Boi);
  if (!giaTri) {
    throw new Error("useTaiKhoan phải nằm trong <TaiKhoanProvider>.");
  }
  return giaTri;
}
