import { API_BASE_URL } from "../utils/constants.js";

// ============================================================
// taiKhoanService — tài khoản THÀNH VIÊN (khách tự đăng ký ngoài website).
//
// KHÁC adminService.js CHỖ NÀO: file kia phục vụ trang /admin của công ty và
// cất vé dưới khóa imob_admin_*. File này phục vụ khách, cất dưới khóa
// imob_tv_*. Hai bộ khóa tách hẳn nhau, cố ý — cùng một trình duyệt phải đăng
// nhập được cả hai tài khoản mà không cái nào đá cái nào ra.
//
// Cả hai gọi chung /api/dang-nhap: máy chủ chỉ có MỘT bảng tài khoản, khác
// nhau ở vai trò ghi trong vé.
// ============================================================

export const VAI_QUAN_TRI = "quan_tri";
export const VAI_THANH_VIEN = "thanh_vien";

const KHOA_VE = "imob_tv_ve";
const KHOA_TEN = "imob_tv_ten";
const KHOA_HO_TEN = "imob_tv_ho_ten";
const KHOA_VAI = "imob_tv_vai";

const HET_GIO_MS = 30000;

// CHỖ CẤT VÉ TÙY THEO VAI.
//
//   thành viên -> localStorage : đóng tab mở lại vẫn còn đăng nhập. Khách ghé
//                 website không chờ đợi chuyện phải gõ lại mật khẩu mỗi lần.
//   quản trị   -> sessionStorage: đóng tab là mất. Vé quản trị mở được toàn bộ
//                 nội dung website và danh sách khách hàng, nên nó không nên
//                 nằm lại trên đĩa của một máy có thể là máy dùng chung.
//
// Vé nào cũng chỉ sống 8 tiếng, nên đây là chuyện tiện tay chứ không phải
// chuyện an toàn dài hạn.
function kho(vai) {
  return vai === VAI_QUAN_TRI ? sessionStorage : localStorage;
}

function doc(khoa) {
  try {
    return sessionStorage.getItem(khoa) ?? localStorage.getItem(khoa);
  } catch {
    // Trình duyệt chặn storage (chế độ riêng tư, chặn cookie bên thứ ba…).
    return null;
  }
}

export function layVe() {
  return doc(KHOA_VE);
}

/** Người đang đăng nhập, hoặc null. Đọc từ trình duyệt nên KHÔNG phải bằng
 *  chứng gì cả — chỉ để giao diện biết hiện tên hay hiện nút "Đăng nhập".
 *  Hàng rào thật nằm ở máy chủ, nó đọc vai trò ký sẵn trong vé. */
export function nguoiDangDangNhap() {
  const ve = layVe();
  if (!ve) return null;
  return {
    ten_dang_nhap: doc(KHOA_TEN) || "",
    ho_ten: doc(KHOA_HO_TEN) || "",
    vai_tro: doc(KHOA_VAI) || VAI_THANH_VIEN,
  };
}

function luu({ ve, ten_dang_nhap, ho_ten, vai_tro }) {
  const vai = vai_tro || VAI_THANH_VIEN;
  try {
    // Dọn cả hai kho trước. Không dọn thì đăng nhập tài khoản thành viên trên
    // một máy vừa dùng tài khoản quản trị sẽ để lại vé cũ ở kho kia, và hàm
    // doc() ở trên đọc sessionStorage TRƯỚC — tức là vé cũ thắng vé mới.
    xoaVe();
    const k = kho(vai);
    k.setItem(KHOA_VE, ve);
    k.setItem(KHOA_TEN, ten_dang_nhap);
    k.setItem(KHOA_HO_TEN, ho_ten || "");
    k.setItem(KHOA_VAI, vai);
  } catch {
    /* Không cất được thì phiên này vẫn chạy nhờ state trong React. */
  }
}

export function xoaVe() {
  for (const k of [localStorage, sessionStorage]) {
    for (const khoa of [KHOA_VE, KHOA_TEN, KHOA_HO_TEN, KHOA_VAI]) {
      try {
        k.removeItem(khoa);
      } catch {
        /* không sao */
      }
    }
  }
}

export class LoiApi extends Error {
  constructor(thongDiep, ma) {
    super(thongDiep);
    this.ma = ma;
  }
}

async function goi(duongDan, { method = "GET", than, canVe = true } = {}) {
  const controller = new AbortController();
  const hetGio = setTimeout(() => controller.abort(), HET_GIO_MS);

  const headers = { "Content-Type": "application/json" };
  if (canVe) {
    const ve = layVe();
    if (!ve) throw new LoiApi("Bạn cần đăng nhập.", 401);
    headers.Authorization = `Bearer ${ve}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${duongDan}`, {
      method,
      headers,
      signal: controller.signal,
      body: than === undefined ? undefined : JSON.stringify(than),
    });
  } catch (err) {
    throw new LoiApi(
      err.name === "AbortError"
        ? "Máy chủ không phản hồi kịp. Bạn thử lại sau giây lát nhé."
        : "Không kết nối được tới máy chủ.",
      0,
    );
  } finally {
    clearTimeout(hetGio);
  }

  // 401 trên request CÓ gửi vé = vé hết hạn hoặc tài khoản không còn -> xóa vé.
  // 401 trên chính request đăng nhập (canVe: false) thì là sai mật khẩu, phải
  // để nó rơi xuống nhánh dưới cho hiện đúng câu của máy chủ.
  if (res.status === 401 && canVe) {
    xoaVe();
    throw new LoiApi("Phiên đăng nhập đã hết hạn. Bạn đăng nhập lại nhé.", 401);
  }

  if (!res.ok) {
    let thongDiep = `Máy chủ báo lỗi ${res.status}.`;
    try {
      const loi = await res.json();
      if (typeof loi?.detail === "string") thongDiep = loi.detail;
    } catch {
      /* không đọc được thân lỗi — giữ câu mặc định */
    }
    throw new LoiApi(thongDiep, res.status);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---------- Đăng ký / đăng nhập ----------
export async function dangKy({ tenDangNhap, matKhau, hoTen }) {
  const kq = await goi("/api/dang-ky", {
    method: "POST",
    canVe: false,
    than: { ten_dang_nhap: tenDangNhap, mat_khau: matKhau, ho_ten: hoTen || "" },
  });
  luu(kq);
  return kq;
}

export async function dangNhap({ tenDangNhap, matKhau }) {
  const kq = await goi("/api/dang-nhap", {
    method: "POST",
    canVe: false,
    than: { ten_dang_nhap: tenDangNhap, mat_khau: matKhau },
  });
  luu(kq);
  return kq;
}

export function dangXuat() {
  xoaVe();
}

// ---------- Hồ sơ ----------
export function hoSoCuaToi() {
  return goi("/api/toi");
}

export function suaHoSo(hoTen) {
  return goi("/api/toi", { method: "PUT", than: { ho_ten: hoTen } });
}

export function doiMatKhau(matKhauCu, matKhauMoi) {
  return goi("/api/toi/mat-khau", {
    method: "PUT",
    than: { mat_khau_cu: matKhauCu, mat_khau_moi: matKhauMoi },
  });
}

// ---------- Tiện ích hiển thị ----------
/** Tên để chào: ưu tiên tên hiển thị, không có thì dùng tên đăng nhập. */
export function tenGoi(nguoi) {
  if (!nguoi) return "";
  return nguoi.ho_ten?.trim() || nguoi.ten_dang_nhap || "";
}

export function ngayViet(chuoi) {
  if (!chuoi) return "";
  const d = new Date(chuoi);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
