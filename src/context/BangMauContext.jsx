import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { KHOA_MAC_DINH, timBangMau } from "../data/bangMau.js";
import { useGiaoDien } from "./NoiDungContext.jsx";

// ============================================================
// BangMauContext — quyết định website đang mặc bảng màu nào.
//
// Có HAI nguồn, và thứ tự ưu tiên là chuyện quan trọng nhất ở đây:
//
//   1. Bảng người xem tự chọn  (localStorage, chỉ nằm trong máy họ)
//   2. Bảng CHÍNH THỨC của website  (sửa trong /admin, lưu ở database)
//
// Nguồn 1 đè lên nguồn 2, nhưng KHÔNG BAO GIỜ ra khỏi máy người xem. Nghĩa là
// bạn thử màu trên máy mình thoải mái mà khách vẫn thấy đúng bảng bạn đã chốt
// trong /admin. Đây là lý do widget chọn màu ngoài trang chủ không làm hỏng
// nhận diện thương hiệu: nó là kính lúp để xem thử, không phải công tắc chung.
//
// Việc áp màu chỉ là gán một thuộc tính lên thẻ <html>; bảng màu thật nằm
// trong src/styles/bangMau.css. Xem thêm scripts/kiem-tra-bang-mau.mjs.
// ============================================================

/** Bảng người xem tự chọn. */
const KHOA_LUU = "imob_bang_mau";

/** Nhớ bảng CHÍNH THỨC của lần vào trước.
    Chỉ để chống nháy màu: index.html đọc khoá này và áp ngay trước khi trình
    duyệt vẽ, khỏi phải chờ React gắn xong. Không phải thứ đáng tin, chỉ là
    phỏng đoán tốt — React gắn xong sẽ ghi lại cho đúng. */
const KHOA_NHO = "imob_bang_mau_web";

const BangMauContext = createContext(null);

function doc(khoa) {
  try {
    return localStorage.getItem(khoa);
  } catch {
    // Trình duyệt chặn storage (chế độ riêng tư, hoặc chặn cookie bên thứ ba).
    // Không sao: mất khả năng nhớ lựa chọn, chứ trang vẫn chạy.
    return null;
  }
}

function ghi(khoa, giaTri) {
  try {
    if (giaTri === null) localStorage.removeItem(khoa);
    else localStorage.setItem(khoa, giaTri);
  } catch {
    /* không sao */
  }
}

export function BangMauProvider({ children }) {
  const giaoDien = useGiaoDien();

  // Bảng chính thức: cho qua timBangMau để một khoá rác trong database không
  // làm cả website mất màu.
  const chinhThuc = timBangMau(giaoDien?.bangMau ?? KHOA_MAC_DINH).khoa;

  const [thuNghiem, setThuNghiem] = useState(() => doc(KHOA_LUU));

  const dangDung = thuNghiem ?? chinhThuc;
  const bang = timBangMau(dangDung);

  useEffect(() => {
    const goc = document.documentElement;
    goc.dataset.bangMau = bang.khoa;

    // Thanh trình duyệt trên điện thoại cũng phải đổi theo, không thì bảng nền
    // tối bị viền một dải trắng ở mép trên. Đọc màu đã tính RA TỪ CSS chứ không
    // lấy lại từ dữ liệu JS — như vậy chỉ có đúng một nguồn màu.
    const mau = getComputedStyle(goc).getPropertyValue("--color-paper").trim();
    const the = document.querySelector('meta[name="theme-color"]');
    if (the && mau) the.setAttribute("content", mau);
  }, [bang.khoa]);

  useEffect(() => {
    ghi(KHOA_NHO, chinhThuc);
  }, [chinhThuc]);

  const chon = useCallback((khoa) => {
    const hopLe = timBangMau(khoa).khoa;
    setThuNghiem(hopLe);
    ghi(KHOA_LUU, hopLe);
  }, []);

  const thoiThu = useCallback(() => {
    setThuNghiem(null);
    ghi(KHOA_LUU, null);
  }, []);

  const giaTri = useMemo(
    () => ({ bang, dangDung, chinhThuc, dangThu: thuNghiem !== null, chon, thoiThu }),
    [bang, dangDung, chinhThuc, thuNghiem, chon, thoiThu]
  );

  return <BangMauContext.Provider value={giaTri}>{children}</BangMauContext.Provider>;
}

/** Gọi ngoài Provider thì trả bảng mặc định thay vì ném lỗi. */
export function useBangMau() {
  return (
    useContext(BangMauContext) ?? {
      bang: timBangMau(KHOA_MAC_DINH),
      dangDung: KHOA_MAC_DINH,
      chinhThuc: KHOA_MAC_DINH,
      dangThu: false,
      chon: () => {},
      thoiThu: () => {},
    }
  );
}
