import { API_BASE_URL } from "../utils/constants.js";

// ============================================================
// Tài khoản người dùng website (thành viên) — làm lại 18/11/2026.
//
// Gọi API có sẵn trong chatbot-python/:
//   POST /api/dang-ky   { ten_dang_nhap, mat_khau, ho_ten } -> vé, vào luôn
//   POST /api/dang-nhap { ten_dang_nhap, mat_khau }         -> vé
// Hai đường này dùng chung bảng tài khoản với /admin; vai trò nằm trong vé.
//
// Vé cất ở localStorage (khác /admin dùng sessionStorage): người dùng thường
// không muốn mỗi lần mở tab lại phải đăng nhập. Vé tự hết hạn sau 8 giờ phía
// máy chủ; ở đây lưu kèm mốc hết hạn để khỏi hiện "đã đăng nhập" khi vé chết.
//
// Khoá riêng (imob_tv_*), không đụng khoá của trang quản trị.
// ============================================================

const KHOA = "imob_tv";
export const SU_KIEN_TAI_KHOAN = "imob:tai-khoan";

// Luật giống hệt máy chủ (api_thanh_vien.py) để báo lỗi ngay khi gõ.
// Máy chủ vẫn kiểm lại — đây chỉ là tiện cho người dùng.
export const MAU_TEN = /^[a-z0-9][a-z0-9._-]{2,23}$/;
export const DAI_MAT_KHAU_TOI_THIEU = 8;

function ghi(du) {
  try {
    localStorage.setItem(KHOA, JSON.stringify(du));
  } catch {
    /* trình duyệt chặn storage: vẫn đăng nhập được trong phiên này */
  }
  window.dispatchEvent(new Event(SU_KIEN_TAI_KHOAN));
}

export function nguoiDangDangNhap() {
  try {
    const du = JSON.parse(localStorage.getItem(KHOA) || "null");
    if (!du?.ve || !du.hetHan || Date.now() > du.hetHan) return null;
    return du;
  } catch {
    return null;
  }
}

export function dangXuat() {
  try {
    localStorage.removeItem(KHOA);
  } catch {
    /* bỏ qua */
  }
  window.dispatchEvent(new Event(SU_KIEN_TAI_KHOAN));
}

// Lấy câu lỗi đọc được từ FastAPI: detail là chuỗi (lỗi của mình) hoặc mảng
// (lỗi kiểu dữ liệu 422).
async function goi(duongDan, than) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${duongDan}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(than),
    });
  } catch {
    throw new Error("Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại.");
  }
  const du = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (typeof du.detail === "string") throw new Error(du.detail);
    if (res.status === 401) throw new Error("Sai tên đăng nhập hoặc mật khẩu.");
    throw new Error("Máy chủ đang bận, bạn thử lại sau ít phút.");
  }
  return du;
}

function luuVe(du) {
  const nguoi = {
    ve: du.ve,
    ten: du.ten_dang_nhap,
    hoTen: du.ho_ten || "",
    vai: du.vai_tro,
    hetHan: Date.now() + (du.het_han_sau || 0) * 1000,
  };
  ghi(nguoi);
  return nguoi;
}

export async function dangNhap({ tenDangNhap, matKhau }) {
  return luuVe(
    await goi("/api/dang-nhap", {
      ten_dang_nhap: tenDangNhap.trim().toLowerCase(),
      mat_khau: matKhau,
    }),
  );
}

export async function dangKy({ hoTen, tenDangNhap, matKhau }) {
  return luuVe(
    await goi("/api/dang-ky", {
      ho_ten: hoTen.trim(),
      ten_dang_nhap: tenDangNhap.trim().toLowerCase(),
      mat_khau: matKhau,
    }),
  );
}

// Tên gọi ngắn để chào: chữ cuối của họ tên ("Trần Văn Nam" -> "Nam").
export function tenGoi(nguoi) {
  const hoTen = (nguoi?.hoTen || "").trim();
  return hoTen ? hoTen.split(/\s+/).pop() : nguoi?.ten || "";
}
