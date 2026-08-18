// ============================================================
// Sinh mã QR cho từng sản phẩm, từ chính địa chỉ trong projects.json.
//
// Chạy:  npm run qr
//
// VÌ SAO SINH RA CHỨ KHÔNG CẮT ẢNH QR TỪ ẤN PHẨM:
//
// 1. Nét ở mọi cỡ. Mã QR sinh ra là SVG — vẽ bằng hình học chứ không phải điểm
//    ảnh. Ảnh cắt từ tờ giới thiệu là ảnh bitmap, phóng to là răng cưa, mà QR
//    răng cưa thì điện thoại quét chậm hoặc không ra.
// 2. Nhẹ hơn nhiều. Mỗi SVG khoảng 2–4 KB, ảnh PNG cắt ra thường 30–80 KB.
// 3. Không lệch nhau. Địa chỉ là một nguồn duy nhất (trường `lienKet`); đổi địa
//    chỉ thì chạy lại lệnh này là QR đổi theo. Nếu dùng ảnh cắt, đổi địa chỉ mà
//    quên thay ảnh là khách quét vào trang chết mà không ai biết.
// 4. Điện thoại cũng dùng được. Có địa chỉ thì thẻ sản phẩm bấm được luôn —
//    QUAN TRỌNG, vì người xem web bằng điện thoại KHÔNG quét được mã QR hiện
//    trên màn hình của chính máy đó. Ảnh QR cắt sẵn không cho ta cái link ấy.
//
// Mức sửa lỗi để "M" (~15%): QR in ra giấy cần mức cao hơn phòng khi bẩn hoặc
// nhàu, nhưng QR trên màn hình luôn sạch, để cao hơn chỉ làm ô dày đặc thêm và
// khó quét ở cỡ nhỏ.
// ============================================================
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import QRCode from "qrcode";

const NGUON = "src/data/projects.json";
const THU_MUC = "public/qr";

const duLieu = JSON.parse(readFileSync(NGUON, "utf8"));
const danhSach = duLieu.danhSach ?? [];

mkdirSync(THU_MUC, { recursive: true });

let daTao = 0;
const thieu = [];

for (const sp of danhSach) {
  const dc = (sp.lienKet ?? "").trim();
  if (!dc) {
    thieu.push(sp.title ?? sp.id);
    continue;
  }

  const svg = await QRCode.toString(dc, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1, // vùng trắng quanh mã, tính bằng ô. Thiếu hẳn là máy khó nhận.
    color: { dark: "#000000", light: "#ffffff" },
  });

  writeFileSync(`${THU_MUC}/${sp.id}.svg`, svg, "utf8");
  console.log(`  ✓ ${sp.id}.svg  →  ${dc}`);
  daTao++;
}

console.log(`\n${"=".repeat(60)}`);
console.log(`Da tao ${daTao}/${danhSach.length} ma QR trong ${THU_MUC}/`);

if (thieu.length) {
  console.log(`\nChua co dia chi (bo qua, phan QR cua san pham do tu an):`);
  for (const t of thieu) console.log(`  - ${t}`);
  console.log(`\nDien dia chi vao truong "lienKet" trong ${NGUON} roi chay lai.`);
}
