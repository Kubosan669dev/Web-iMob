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

// ---------- Công khai ----------

/** Danh sách bài đã đăng, mới nhất trước. Không kèm thân bài. */
export function danhSachBaiViet() {
  return goiApi("/api/bai-viet", { canVe: false });
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
