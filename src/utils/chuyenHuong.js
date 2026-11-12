// ============================================================
// Tìm trang đích cho một link cũ, theo bảng data/chuyenHuong.json.
//
// Hàm thuần (nhận bảng qua tham số, không tự import JSON) để script
// scripts/chuyen-huong.mjs chạy thử được bằng node, không cần trình duyệt.
// ============================================================

// "/robot/" và "/robot" là một. Riêng "/" giữ nguyên.
const boGachCuoi = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/**
 * @param {object} bang      nội dung data/chuyenHuong.json
 * @param {string} pathname  vd "/tin-tuc/ten-bai"
 * @param {string} hash      vd "#about" hoặc ""
 * @returns {string|null} đường dẫn đích, hoặc null nếu không phải link cũ
 */
export function timDichChuyenHuong(bang, pathname, hash = "") {
  const duong = boGachCuoi(pathname);

  // Link cũ dạng imob.vn/#about — chỉ tính ở trang chủ, nơi các mục đó từng nằm.
  if (duong === "/") return bang.neo[hash.replace(/^#/, "")] ?? null;

  const luat = bang.duongDan.find(
    (l) => duong === l.tu || (l.caTrangCon && duong.startsWith(l.tu + "/")),
  );
  return luat ? luat.den : null;
}
