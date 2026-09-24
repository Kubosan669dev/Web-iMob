import { goiApi } from "./adminService.js";

// ============================================================
// baiVietService — mục "Câu chuyện khách hàng".
//
// Hai nhóm hàm, khớp với hai gốc đường dẫn bên máy chủ
// (xem chatbot-python/api_bai_viet.py):
//
//   CÔNG KHAI  /api/bai-viet…            chỉ thấy bài ĐÃ ĐĂNG, không cần vé
//   QUẢN TRỊ   /api/quan-tri/bai-viet…   thấy cả bài nháp, phải đăng nhập
//
// Giữ hai nhóm trong cùng một file (thay vì tách "public" và "admin") vì chúng
// nói về cùng một thứ, và để nhìn một chỗ là thấy ngay hàm nào cần vé — mấu
// chốt của tính năng này là bài nháp không được lọt ra trang công khai.
// ============================================================

// ============================================================
// HAI LOẠI BÀI
//
// Chuỗi ở đây phải khớp TỪNG KÝ TỰ với LOAI_HOP_LE trong
// chatbot-python/api_bai_viet.py. Lệch một chữ thì máy chủ trả 400 và bài
// không lưu được — đỡ hơn là lưu im lặng vào một loại không trang nào hiện.
// ============================================================
export const LOAI_CAU_CHUYEN = "cau_chuyen";
export const LOAI_TIN_CONG_TY = "tin_cong_ty";

export const LOAI = {
  [LOAI_CAU_CHUYEN]: {
    nhan: "Câu chuyện khách hàng",
    nhanNgan: "Câu chuyện",
    duongDan: "/cau-chuyen",
    moTa: "Sản phẩm đã bàn giao, kể từ góc nhìn của người dùng thật.",
  },
  [LOAI_TIN_CONG_TY]: {
    nhan: "Tin công ty",
    nhanNgan: "Tin công ty",
    duongDan: "/tin-tuc",
    moTa: "Ký kết, sự kiện và những việc iMob đang làm.",
  },
};

// ============================================================
// GIỚI HẠN ĐỘ DÀI
//
// Phải khớp với DAI_NHAT_* trong chatbot-python/api_bai_viet.py. Đặt ở đây một
// bản để form đếm được ký tự và chặn TRƯỚC khi gửi đi.
//
// Vì sao cần chặn ở cả hai nơi: máy chủ chặn là để dữ liệu không hỏng, còn form
// chặn là để người soạn biết mình đang vượt bao nhiêu NGAY LÚC GÕ. Chỉ chặn ở
// máy chủ thì họ viết xong cả bài mới biết mình phải cắt — đúng chuyện đã xảy
// ra ngày 23/09/2026.
//
// ⚠️ Sửa số ở đây thì sửa luôn bên api_bai_viet.py. Để lệch thì hoặc form chặn
// oan, hoặc máy chủ trả 422 mà form bảo là vẫn còn chỗ.
// ============================================================
export const GIOI_HAN = {
  tieu_de: 200,
  tom_tat: 500,
  noi_dung: 40000,
  // Hai số dưới là cho chữ GÕ VÀO. Trước 24/09/2026 là 100 và 80 — link ảnh
  // Facebook (200–400 ký tự) và một câu gõ tay 81 ký tự đều bị 422. Đường dẫn
  // lưu lại vẫn luôn ≤ 80 ký tự vì máy chủ tự rút gọn.
  anh_bia: 2000,
  ten_khach: 200,
  duong_dan: 300,
};

// ============================================================
// XEM TRƯỚC ĐƯỜNG DẪN
//
// Bản sao của duong_dan_tu_o_nhap() + tao_duong_dan() bên
// chatbot-python/api_bai_viet.py, CHỈ để hiện cho người soạn thấy đường dẫn
// thật trông ra sao ngay lúc gõ. Máy chủ mới là nơi quyết định: lưu xong, form
// nạp lại đúng đường dẫn máy chủ đã chốt, nên lỡ hai bản lệch nhau một chữ thì
// người dùng vẫn thấy kết quả thật ngay sau khi bấm Lưu.
// ============================================================
const TEN_MIEN_CUA_MINH = ["imob.vn", "localhost", "127.0.0.1"];

/** Là link tới một trang KHÁC imob.vn? (dán nhầm link Facebook vào ô Đường dẫn) */
export function laLinkTrangKhac(chu) {
  const c = (chu ?? "").trim();
  if (!c.includes("://") && !c.toLowerCase().startsWith("www.")) return false;
  try {
    const may = new URL(c.includes("://") ? c : `https://${c}`).hostname.toLowerCase();
    return !TEN_MIEN_CUA_MINH.some((m) => may === m || may.endsWith(`.${m}`));
  } catch {
    return true;
  }
}

export const LOI_LINK_TRANG_KHAC =
  "Ô «Đường dẫn» là phần đuôi địa chỉ của bài NGAY TRÊN imob.vn (ví dụ: ngay-nay-nam-truoc), " +
  "không phải link tới trang khác. Muốn dẫn nguồn thì dán link vào cuối nội dung bài. " +
  "Để trống ô này thì máy tự đặt theo tiêu đề.";

/** "Ngày này năm trước" -> "ngay-nay-nam-truoc". Trả "" nếu chưa gõ gì. */
export function xemTruocDuongDan(chu) {
  let c = (chu ?? "").trim();
  if (!c || laLinkTrangKhac(c)) return "";
  if (c.includes("://") || c.toLowerCase().startsWith("www.")) {
    try {
      c = decodeURIComponent(new URL(c.includes("://") ? c : `https://${c}`).pathname);
    } catch {
      return "";
    }
  }
  if (c.includes("/")) c = c.split("/").filter((d) => d.trim()).pop() ?? "";
  let s = c
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length > 80) {
    s = s.slice(0, 80);
    if (s.includes("-")) s = s.slice(0, s.lastIndexOf("-"));
    s = s.replace(/-+$/, "");
  }
  return s || "bai-viet";
}

/** Nhãn tiếng Việt của từng ô, để dựng câu lỗi "Ô «Tóm tắt» dài quá". */
export const NHAN_O = {
  tieu_de: "Tiêu đề",
  tom_tat: "Tóm tắt",
  noi_dung: "Nội dung bài",
  anh_bia: "Ảnh bìa",
  ten_khach: "Tên khách hàng",
  duong_dan: "Đường dẫn",
};

/** Ô đầu tiên vượt giới hạn, hoặc chuỗi rỗng nếu mọi ô đều đạt. */
export function loiDoDai(bai) {
  for (const [o, toiDa] of Object.entries(GIOI_HAN)) {
    const dai = (bai[o] ?? "").length;
    if (dai > toiDa) {
      return `Ô «${NHAN_O[o]}» đang dài ${dai} ký tự, tối đa ${toiDa}. Bạn rút bớt ${dai - toiDa} ký tự rồi lưu lại nhé.`;
    }
  }
  return "";
}

/** Địa chỉ trang đọc của một bài, đặt theo đúng loại của nó.
 *
 *  Dùng hàm này ở mọi chỗ cần dựng link thay vì tự nối chuỗi: loại nào nằm
 *  dưới đường dẫn nào chỉ được quyết định ở MỘT nơi, nên sau này muốn đổi
 *  cũng chỉ sửa một chỗ. */
export function duongDanBai(bai) {
  const goc = LOAI[bai?.loai]?.duongDan ?? LOAI[LOAI_CAU_CHUYEN].duongDan;
  return `${goc}/${bai.duong_dan}`;
}

// ---------- Công khai ----------

/** Danh sách bài đã đăng, mới nhất trước. Không kèm thân bài.
 *  Bỏ trống `loai` thì lấy cả hai loại. */
export function danhSachBaiViet(loai) {
  const q = loai ? `?loai=${encodeURIComponent(loai)}` : "";
  return goiApi(`/api/bai-viet${q}`, { canVe: false });
}

/** Một bài đầy đủ theo đường dẫn (phần đuôi URL). */
export function docBaiViet(duongDan) {
  return goiApi(`/api/bai-viet/${encodeURIComponent(duongDan)}`, { canVe: false });
}

// ---------- Quản trị ----------

export function danhSachBaiVietQuanTri() {
  return goiApi("/api/quan-tri/bai-viet");
}

/** Một bài ĐẦY ĐỦ (có thân bài) để mở ra sửa.
 *
 *  Phải có hàm riêng vì danh sách cố ý không kèm cột noi_dung, và vì bài nháp
 *  không tồn tại trên đường công khai nên docBaiViet() ở trên không lấy được. */
export function docBaiVietQuanTri(ma) {
  return goiApi(`/api/quan-tri/bai-viet/${ma}`);
}

export function themBaiViet(bai) {
  return goiApi("/api/quan-tri/bai-viet", { method: "POST", than: bai });
}

export function suaBaiViet(ma, bai) {
  return goiApi(`/api/quan-tri/bai-viet/${ma}`, { method: "PUT", than: bai });
}

export function xoaBaiViet(ma) {
  return goiApi(`/api/quan-tri/bai-viet/${ma}`, { method: "DELETE" });
}

// ---------- Dùng chung cho cả trang công khai lẫn trang quản trị ----------

/** Tách thân bài thành các đoạn.
 *
 *  Quy ước: DÒNG TRỐNG ngăn hai đoạn. Xuống dòng đơn nằm trong cùng một đoạn,
 *  vì người gõ trong ô textarea hay xuống dòng cho vừa mắt chứ không có ý
 *  ngắt đoạn — tách theo mọi lần xuống dòng thì bài viết vỡ vụn.
 *
 *  Cố ý KHÔNG hiểu HTML hay Markdown: thân bài do người dùng gõ, đem chèn
 *  thẳng vào trang bằng dangerouslySetInnerHTML là mở cửa cho XSS. Giao diện
 *  vẽ từng đoạn bằng <p>{chữ}</p> nên React tự thoát mọi ký tự đặc biệt.
 */
export function tachDoan(noiDung) {
  return (noiDung ?? "")
    .split(/\n\s*\n/)
    .map((d) => d.trim())
    .filter(Boolean);
}

/** "2026-09-21T…" -> "21/09/2026". Không có ngày thì trả chuỗi rỗng. */
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
