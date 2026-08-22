import { readFileSync } from "node:fs";

// ============================================================
// Kiểm tra dải ĐỐI TÁC ở trang chủ.
//
// Có hai nơi cùng quyết định biểu tượng đứng trước tên một đơn vị:
//   · src/data/doiTac.json         — trường `nhom` ghi sẵn
//   · src/pages/AdminPage.jsx      — hàm nhomTheoTen() TỰ ĐOÁN khi người dùng
//                                    gõ thêm đơn vị mới trong /admin
//
// Hai nơi này phải cho cùng một kết quả. Lệch nhau thì hậu quả rất khó thấy:
// đơn vị thêm bằng tay trong mã có biểu tượng đúng, đơn vị thêm qua /admin lại
// ra biểu tượng khác — mà không ai báo lỗi gì cả, dải vẫn chạy bình thường.
//
// Bài kiểm này ĐỌC THẲNG luật đoán từ AdminPage.jsx chứ không chép lại vào
// đây. Chép lại thì nó chỉ chứng minh được bản chép đúng, còn mã đang chạy
// thật thì không đụng tới.
//
// Chạy:  npm run test:doitac
// ============================================================

const nguon = readFileSync("src/pages/AdminPage.jsx", "utf8");

const luat = nguon.match(/const LUAT_NHOM_DOI_TAC = \[[\s\S]*?\n\];/)?.[0];
const ham = nguon.match(/function nhomTheoTen\(ten\) \{[\s\S]*?\n\}/)?.[0];

if (!luat || !ham) {
  console.error(
    "KHONG TIM THAY LUAT_NHOM_DOI_TAC hoac nhomTheoTen trong src/pages/AdminPage.jsx.\n" +
      "Doi ten hai thu do thi sua lai bieu thuc tim kiem trong file nay.",
  );
  process.exit(1);
}

const { nhomTheoTen } = await import(
  "data:text/javascript," +
    encodeURIComponent(`${luat}\n${ham}\nexport { nhomTheoTen };`)
);

const duLieu = JSON.parse(readFileSync("src/data/doiTac.json", "utf8"));
const danhSach = duLieu.danhSach ?? [];

const NHOM_HOP_LE = new Set([
  "chinh-quyen",
  "van-hoa",
  "giao-duc",
  "nang-luong",
  "doanh-nghiep",
]);

let sai = 0;

if (danhSach.length === 0) {
  console.error("doiTac.json khong co don vi nao.");
  process.exit(1);
}

for (const dv of danhSach) {
  const ten = (dv.ten ?? "").trim();
  const loi = [];

  if (!ten) loi.push("ten rong");
  if (!NHOM_HOP_LE.has(dv.nhom)) loi.push(`nhom la '${dv.nhom}' — khong co bieu tuong`);

  const doan = nhomTheoTen(ten);
  if (ten && NHOM_HOP_LE.has(dv.nhom) && doan !== dv.nhom)
    loi.push(`ghi '${dv.nhom}' nhung /admin se doan ra '${doan}'`);

  if (loi.length) {
    sai++;
    console.log(`SAI  ${ten || "(trong)"} — ${loi.join(" · ")}`);
  } else {
    console.log(`DAT  ${ten}`);
  }
}

// Trùng tên: dải chạy vẽ danh sách hai lần và dùng `ten` làm key React, nên
// hai đơn vị trùng tên là hai key trùng nhau trong cùng một <ul>.
const dem = new Map();
for (const dv of danhSach) {
  const t = (dv.ten ?? "").trim();
  dem.set(t, (dem.get(t) ?? 0) + 1);
}
for (const [ten, n] of dem) {
  if (n > 1) {
    sai++;
    console.log(`SAI  '${ten}' xuat hien ${n} lan — trung key trong danh sach`);
  }
}

console.log("\n" + "=".repeat(50));
console.log(`KET QUA: ${danhSach.length - sai}/${danhSach.length} don vi DAT.`);
process.exit(sai ? 1 : 0);
