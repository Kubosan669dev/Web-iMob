import { useEffect, useRef } from "react";

// ============================================================
// TỰ ĐỘNG ĐĂNG XUẤT KHỎI TRANG QUẢN TRỊ
//
// Công ty yêu cầu 20/08/2026: "nếu mà thoát khỏi trang web thì sẽ tự động
// đăng xuất". Việc này quan trọng hơn bình thường ở giai đoạn demo, vì mật
// khẩu quản trị đang hiện công khai ngay trên màn hình đăng nhập — một phiên
// bỏ quên trên máy dùng chung là cửa mở sẵn.
//
// BỐN TÌNH HUỐNG, và cách xử lý:
//
//   đóng tab                 -> đã xong từ trước: vé nằm trong sessionStorage,
//                               đóng tab là mất. Không phải làm gì thêm.
//   rời sang trang khác /
//   chuyển tab / thu nhỏ     -> quá NGUONG_ROI_TRANG thì lần quay lại sẽ bị
//                               đăng xuất.
//   mở nhưng ngồi yên        -> quá NGUONG_NGOI_YEN thì đăng xuất tại chỗ.
//   tải lại trang (F5)       -> KHÔNG đăng xuất. Tải lại không phải là rời đi,
//                               và thời gian trôi qua chỉ vài giây nên nó tự
//                               lọt qua cả hai ngưỡng.
//
// ⚠️ VÌ SAO ĐO MỐC THỜI GIAN CHỨ KHÔNG DỌN DẸP LÚC RỜI COMPONENT:
// dự án bật <StrictMode> (xem main.jsx). Ở bản chạy thử, StrictMode cố ý gắn
// rồi tháo rồi gắn lại mỗi effect một lần để lộ ra lỗi. Nếu đặt việc đăng xuất
// vào phần dọn dẹp của effect thì vừa đăng nhập xong đã bị đá ra ngay — mà chỉ
// hỏng ở bản chạy thử nên rất dễ tưởng là lỗi ma. Đo mốc thời gian thì gắn bao
// nhiêu lần cũng cho cùng một kết quả.
//
// ⚠️ CŨNG KHÔNG DÙNG beforeunload/pagehide ĐỂ XOÁ VÉ: hai sự kiện đó nổ cả khi
// người dùng bấm F5. Xoá vé ở đó thì mỗi lần tải lại trang là phải đăng nhập
// lại — phiền, mà chẳng an toàn thêm chút nào.
//
// KHÔNG MẤT VIỆC ĐANG SỬA DỞ — nhưng phải có HAI thứ cùng lúc:
//   1. Khi tự đăng xuất, AdminPage chỉ đổi sang vẽ màn hình đăng nhập chứ bản
//      thân nó KHÔNG bị tháo khỏi cây React, nên state `noiDung` còn nguyên.
//   2. AdminPage phải KHÔNG tải lại nội dung từ máy chủ lúc đăng nhập lại —
//      xem `conSuaDoRef` trong AdminPage.jsx.
//
// Thiếu điểm 2 là mất trắng: bản đầu chỉ có `if (ten) taiNoiDung()`, nên đăng
// nhập lại là gọi API rồi `setNoiDung(d)` ghi đè sạch phần đang sửa. Đã đo
// được: sửa một ô, để hết giờ, đăng nhập lại -> chữ vừa gõ biến mất. Ai sửa
// AdminPage sau này nhớ giữ nguyên chỗ đó.
// ============================================================

// Rời trang bao lâu thì coi như đã đi hẳn.
// 2 phút: mở một tab khác tra cứu rồi quay lại thì vẫn còn phiên; bỏ đi uống
// nước rồi quay lại thì phải đăng nhập lại.
const NGUONG_ROI_TRANG = 2 * 60 * 1000;

// Ngồi trước màn hình mà không đụng gì.
// 15 phút: đủ dài để đọc và soạn một đoạn văn dài mà không bị ngắt ngang.
const NGUONG_NGOI_YEN = 15 * 60 * 1000;

// Nhịp kiểm tra. 30 giây là đủ: sai số tối đa nửa phút trên một ngưỡng 2 phút.
// Đặt dày hơn chỉ tốn pin mà không đổi được gì về mặt an toàn.
const NHIP_KIEM_MS = 30 * 1000;

const SU_KIEN_HOAT_DONG = [
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
  "input",
];

export const LY_DO = {
  ROI_TRANG: "Đã tự đăng xuất vì bạn rời khỏi trang một lúc.",
  NGOI_YEN: "Đã tự đăng xuất vì không có thao tác nào trong 15 phút.",
};

/**
 * @param {boolean}  dangDangNhap  Có đang trong phiên không. False thì hook ngủ.
 * @param {Function} khiHetPhien   Gọi kèm câu giải thích khi hết phiên.
 */
export default function useTuDongDangXuat(dangDangNhap, khiHetPhien) {
  // Giữ trong ref chứ không phải state: mỗi lần chạm chuột mà gọi setState thì
  // cả trang quản trị vẽ lại — vài chục ô nhập, rất nặng và hoàn toàn vô ích.
  const mocCuoi = useRef(Date.now());

  // Hàm gọi lại được dựng mới mỗi lần vẽ. Cất vào ref để effect bên dưới không
  // phải phụ thuộc vào nó — nếu phụ thuộc thì cứ mỗi lần vẽ lại là gỡ sạch
  // listener rồi gắn lại, và bộ đếm bị nhảy về 0 liên tục.
  const goiLai = useRef(khiHetPhien);
  goiLai.current = khiHetPhien;

  useEffect(() => {
    if (!dangDangNhap) return;

    mocCuoi.current = Date.now();

    const chamMoc = () => {
      mocCuoi.current = Date.now();
    };

    const hetPhien = (lyDo) => {
      // Gỡ hết trước khi báo, để không có chuyện báo hai lần khi hai điều kiện
      // cùng đúng trong một nhịp.
      go();
      goiLai.current(lyDo);
    };

    const kiem = () => {
      if (Date.now() - mocCuoi.current > NGUONG_NGOI_YEN) hetPhien(LY_DO.NGOI_YEN);
    };

    const doiTamNhin = () => {
      if (document.hidden) {
        // Ghi mốc lúc rời đi, rồi so khi quay lại.
        chamMoc();
        return;
      }
      if (Date.now() - mocCuoi.current > NGUONG_ROI_TRANG) {
        hetPhien(LY_DO.ROI_TRANG);
        return;
      }
      chamMoc();
    };

    let dongHo = setInterval(kiem, NHIP_KIEM_MS);

    function go() {
      clearInterval(dongHo);
      SU_KIEN_HOAT_DONG.forEach((s) => window.removeEventListener(s, chamMoc));
      document.removeEventListener("visibilitychange", doiTamNhin);
    }

    // passive: mấy sự kiện này chỉ để ghi một con số, không bao giờ chặn cuộn.
    SU_KIEN_HOAT_DONG.forEach((s) =>
      window.addEventListener(s, chamMoc, { passive: true })
    );
    document.addEventListener("visibilitychange", doiTamNhin);

    return go;
  }, [dangDangNhap]);
}
