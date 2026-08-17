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

function luuVe(ve, ten) {
  try {
    sessionStorage.setItem(KHOA_VE, ve);
    sessionStorage.setItem(KHOA_TEN, ten);
  } catch {
    // Trình duyệt chặn storage — vẫn dùng được trong phiên hiện tại vì
    // AdminPage giữ vé trong state, chỉ là tải lại trang thì phải đăng nhập lại.
  }
}

export function dangXuat() {
  try {
    sessionStorage.removeItem(KHOA_VE);
    sessionStorage.removeItem(KHOA_TEN);
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

  if (res.status === 401) {
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
  luuVe(kq.ve, kq.ten_dang_nhap);
  return kq.ten_dang_nhap;
}

// ---------- Nội dung ----------
export function docNoiDung() {
  return goi("/api/noi-dung", { canVe: false });
}

export function ghiNoiDung(khoa, duLieu) {
  return goi(`/api/noi-dung/${khoa}`, { method: "PUT", than: { du_lieu: duLieu } });
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
