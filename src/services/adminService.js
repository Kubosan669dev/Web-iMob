import { API_BASE_URL } from "../utils/constants.js";

// ============================================================
// adminService — mọi lời gọi API của trang quản trị đi qua đây.
//
// Về chỗ cất "vé" (token) đăng nhập: dùng sessionStorage chứ không phải
// localStorage. sessionStorage đóng tab là mất, localStorage thì nằm lại mãi.
// Với một trang quản trị nội dung, phải đăng nhập lại sau khi đóng tab là cái
// giá rẻ để đổi lấy an toàn — nhất là khi máy có nhiều người dùng chung.
// ============================================================

const KHOA_VE = "imob_admin_ve";
const KHOA_TEN = "imob_admin_ten";
const KHOA_VAI = "imob_admin_vai";

// Hai vai trò — phải khớp với auth.py bên backend.
export const VAI_QUAN_TRI = "quan_tri";
export const VAI_KHACH_THU = "khach_thu";

// Backend gói free trên Render NGỦ sau 15 phút. Lần gọi đầu phải chờ máy chủ
// thức dậy nên hạn chờ phải rộng — 45 giây. Trang admin có hiện thông báo
// "đang đánh thức máy chủ" để bạn biết là nó đang chạy chứ không treo.
const HET_GIO_MS = 45000;

export function layVe() {
  try {
    return sessionStorage.getItem(KHOA_VE);
  } catch {
    return null;
  }
}

export function layTenDangNhap() {
  try {
    return sessionStorage.getItem(KHOA_TEN);
  } catch {
    return null;
  }
}

/** Vai trò của người đang đăng nhập.
 *
 *  CHỈ để quyết định hiện hay ẩn phần nào trên giao diện. KHÔNG phải hàng rào
 *  an ninh — giá trị này nằm trong máy khách nên sửa được bằng một dòng trong
 *  F12. Hàng rào thật nằm ở máy chủ (auth.yeu_cau_quan_tri), và nó không đọc
 *  ô này mà đọc vai trò ký sẵn trong vé. */
export function layVaiTro() {
  try {
    return sessionStorage.getItem(KHOA_VAI) || VAI_QUAN_TRI;
  } catch {
    return VAI_QUAN_TRI;
  }
}

export function laKhachThu() {
  return layVaiTro() === VAI_KHACH_THU;
}

function luuVe(ve, ten, vai) {
  try {
    sessionStorage.setItem(KHOA_VE, ve);
    sessionStorage.setItem(KHOA_TEN, ten);
    sessionStorage.setItem(KHOA_VAI, vai || VAI_QUAN_TRI);
  } catch {
    // Trình duyệt chặn storage — vẫn dùng được trong phiên hiện tại vì
    // AdminPage giữ vé trong state, chỉ là tải lại trang thì phải đăng nhập lại.
  }
}

export function dangXuat() {
  try {
    sessionStorage.removeItem(KHOA_VE);
    sessionStorage.removeItem(KHOA_TEN);
    sessionStorage.removeItem(KHOA_VAI);
  } catch {
    /* không sao */
  }
}

/** Lỗi có kèm mã HTTP để nơi gọi biết đường xử lý (401 = hết phiên). */
export class LoiApi extends Error {
  constructor(thongDiep, ma) {
    super(thongDiep);
    this.ma = ma;
  }
}

// API_BASE_URL rỗng -> gọi đường dẫn tương đối. Lúc `npm run dev` thì
// vite.config.js chuyển tiếp /api/* sang backend ở cổng 8000.
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
        ? "Máy chủ không phản hồi kịp. Thử lại sau giây lát nhé."
        : "Không kết nối được tới máy chủ.",
      0
    );
  } finally {
    clearTimeout(hetGio);
  }

  // 401 trên request CÓ gửi vé = vé hỏng hoặc hết hạn -> đá về màn hình đăng nhập.
  //
  // Nhưng 401 trên chính request ĐĂNG NHẬP (canVe: false) thì KHÔNG phải hết
  // phiên, mà là sai tên đăng nhập hoặc mật khẩu. Bản trước bắt chung cả hai nên
  // người vừa gõ sai mật khẩu lại đọc được câu "Phiên đăng nhập đã hết hạn" —
  // trong khi họ còn chưa đăng nhập được lần nào. Để rơi xuống nhánh !res.ok
  // bên dưới cho nó hiện đúng câu của máy chủ.
  if (res.status === 401 && canVe) {
    dangXuat();
    throw new LoiApi("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
  }

  if (!res.ok) {
    // FastAPI trả lỗi ở trường `detail`. Đọc được thì hiện đúng câu của server
    // (vd "Sai quá nhiều lần. Thử lại sau 15 phút.") thay vì câu chung chung.
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

  // Máy chủ trả HTML thay vì JSON = gần như chắc chắn request đã đi nhầm sang
  // chính website tĩnh chứ không tới API.
  //
  // Vì sao lỗi này khó đoán nếu không bắt riêng: trang tĩnh có luật SPA rewrite
  // (/* -> /index.html) nên mọi đường dẫn lạ đều trả index.html kèm mã 200 —
  // trông y như thành công, chỉ vỡ ở bước đọc JSON với một câu lỗi vô nghĩa
  // kiểu "Unexpected token '<'". Bắt ở đây để nói thẳng nguyên nhân.
  const kieu = res.headers.get("content-type") || "";
  if (!kieu.includes("application/json")) {
    throw new LoiApi(
      API_BASE_URL
        ? `Máy chủ ở ${API_BASE_URL} không trả về dữ liệu. Kiểm tra địa chỉ API có đúng không.`
        : "Website chưa biết địa chỉ máy chủ API. Trên Render: mở dịch vụ website " +
          "→ Environment → đặt VITE_API_URL trỏ tới địa chỉ API, rồi Manual Deploy " +
          "→ Clear build cache & deploy.",
      0
    );
  }

  return res.json();
}

// ---------- Đăng nhập ----------
export async function dangNhap(tenDangNhap, matKhau) {
  const kq = await goi("/api/dang-nhap", {
    method: "POST",
    canVe: false,
    than: { ten_dang_nhap: tenDangNhap, mat_khau: matKhau },
  });
  luuVe(kq.ve, kq.ten_dang_nhap, kq.vai_tro);
  return kq.ten_dang_nhap;
}

/** Tài khoản dùng thử để hiện ở màn hình đăng nhập. Trả null khi tính năng tắt.
 *
 *  Nuốt mọi lỗi: máy chủ đang ngủ hoặc bản backend cũ chưa có đường dẫn này thì
 *  chỉ là không hiện dòng gợi ý — tuyệt đối không được chặn người ta đăng nhập. */
export async function taiKhoanThu() {
  try {
    const kq = await goi("/api/tai-khoan-thu", { canVe: false });
    return kq?.ten && kq?.mat_khau ? kq : null;
  } catch {
    return null;
  }
}

// ---------- Nội dung ----------
export function docNoiDung() {
  return goi("/api/noi-dung", { canVe: false });
}

export function ghiNoiDung(khoa, duLieu) {
  return goi(`/api/noi-dung/${khoa}`, { method: "PUT", than: { du_lieu: duLieu } });
}

/** Trạng thái máy chủ cho màn hình Tổng quan.
    Gọi /health — đường dẫn CÔNG KHAI, không cần vé, nên vẫn xem được kể cả khi
    phiên đăng nhập vừa hết hạn. */
export function trangThaiMayChu() {
  return goi("/health", { canVe: false });
}

// ---------- Liên hệ ----------
export function danhSachLienHe() {
  return goi("/api/lien-he");
}

export function danhDauLienHe(ma, daXuLy) {
  return goi(`/api/lien-he/${ma}`, {
    method: "PATCH",
    than: { da_xu_ly: daXuLy },
  });
}


// ---------- Ảnh ----------
//
// Tải file KHÔNG đi qua goi() ở trên được: hàm đó luôn đặt
// Content-Type: application/json và tự JSON.stringify phần thân. Với FormData
// thì phải để trình duyệt TỰ đặt Content-Type, vì nó còn phải kèm chuỗi
// `boundary` ngẫu nhiên phân tách các phần — tự viết tay header là hỏng.
export async function taiAnhLen(file) {
  const ve = layVe();
  if (!ve) throw new LoiApi("Bạn cần đăng nhập.", 401);

  const bieuMau = new FormData();
  bieuMau.append("file", file);

  const controller = new AbortController();
  const hetGio = setTimeout(() => controller.abort(), HET_GIO_MS);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/anh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ve}` },
      body: bieuMau,
      signal: controller.signal,
    });
  } catch (err) {
    throw new LoiApi(
      err.name === "AbortError"
        ? "Tải ảnh lâu quá. Ảnh nặng hoặc mạng chậm — thử lại nhé."
        : "Không kết nối được tới máy chủ.",
      0
    );
  } finally {
    clearTimeout(hetGio);
  }

  if (res.status === 401) {
    dangXuat();
    throw new LoiApi("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
  }

  if (!res.ok) {
    let thongDiep = `Máy chủ báo lỗi ${res.status}.`;
    try {
      const loi = await res.json();
      if (typeof loi?.detail === "string") thongDiep = loi.detail;
    } catch {
      /* không đọc được thân lỗi */
    }
    throw new LoiApi(thongDiep, res.status);
  }

  return res.json();
}

export function danhSachAnh() {
  return goi("/api/anh");
}

export function xoaAnh(ma) {
  return goi(`/api/anh/${encodeURIComponent(ma)}`, { method: "DELETE" });
}
