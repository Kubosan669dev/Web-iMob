import { readFileSync, writeFileSync } from "node:fs";
import { timDichChuyenHuong } from "../src/utils/chuyenHuong.js";

// ============================================================
// Chuyển hướng link cũ: sinh file cho nginx + kiểm tra.
//
// Bảng chuyển hướng chỉ ghi MỘT nơi (src/data/chuyenHuong.json) nhưng có hai
// nơi dùng: web (components/util/ChuyenHuongCu.jsx đọc thẳng JSON) và nginx
// (trien-khai/nginx-chuyen-huong.conf — nginx không đọc được JSON). Script này
// sinh file nginx từ bảng, để hai nơi không bao giờ lệch nhau.
//
//   npm run chuyenhuong               sinh lại file nginx + kiểm tra
//   node scripts/chuyen-huong.mjs --kiem-tra
//                                     chỉ kiểm tra, không ghi (tự chạy trước
//                                     mỗi lần `npm run build` — xem "prebuild"
//                                     trong package.json)
//
// Kiểm tra bắt những lỗi sẽ làm web hỏng mà không báo gì:
//   · file nginx cũ hơn bảng (sửa JSON mà quên sinh lại);
//   · trang đích lại là một link cũ khác -> chuyển vòng tròn;
//   · bật công tắc `bat` khi trang đích chưa có trong App.jsx -> khách vào
//     link cũ sẽ rơi vào trang trắng.
// ============================================================

const FILE_BANG = "src/data/chuyenHuong.json";
const FILE_NGINX = "trien-khai/nginx-chuyen-huong.conf";
const chiKiemTra = process.argv.includes("--kiem-tra");

const bang = JSON.parse(readFileSync(FILE_BANG, "utf8"));

function sinhNginx() {
  const dong = [
    "# ============================================================",
    "# FILE TỰ SINH — ĐỪNG SỬA TAY. Sửa src/data/chuyenHuong.json rồi chạy",
    "#     npm run chuyenhuong",
    "#",
    "# Chuyển hướng link cũ của imob.vn sang trang mới bằng mã 301 (chuyển",
    "# vĩnh viễn) — Google chuyển thứ hạng của trang cũ sang trang mới.",
    "#",
    "# CHỈ chép lên máy chủ khi trang mới đã chạy thật:",
    "#     scp trien-khai/nginx-chuyen-huong.conf chung:/etc/nginx/imob-chuyen-huong.conf",
    '#     ssh chung "nginx -t && systemctl reload nginx"',
    "# Cấu hình imob.vn đọc file này bằng dòng",
    "#     include /etc/nginx/imob-chuyen-huong*.conf;",
    "# (có dấu * nên file chưa có thì nginx vẫn chạy bình thường).",
    "# Muốn tắt: xoá file trên máy chủ rồi reload nginx.",
    "# ============================================================",
    "",
  ];
  for (const { tu, den, caTrangCon } of bang.duongDan) {
    dong.push(`location = ${tu} { return 301 ${den}; }`);
    // caTrangCon: /tin-tuc/ và mọi thứ bên dưới. Không thì chỉ thêm dạng có
    // gạch chéo cuối (/robot/).
    dong.push(
      caTrangCon
        ? `location ^~ ${tu}/ { return 301 ${den}; }`
        : `location = ${tu}/ { return 301 ${den}; }`,
    );
  }
  return dong.join("\n") + "\n";
}

const loi = [];

// ---- 1. Bảng hợp lệ ----
const duongHopLe = (p) => /^\/[a-z0-9\-/]*$/.test(p) && !p.endsWith("/");
const dich = new Set();
const daGap = new Set();
for (const l of bang.duongDan) {
  if (!duongHopLe(l.tu) || l.tu === "/")
    loi.push(`"tu" khong hop le: ${JSON.stringify(l.tu)}`);
  if (!duongHopLe(l.den) && l.den !== "/")
    loi.push(`"den" khong hop le: ${JSON.stringify(l.den)}`);
  if (daGap.has(l.tu)) loi.push(`"${l.tu}" ghi hai lan`);
  daGap.add(l.tu);
  dich.add(l.den);
}
// Đích của neo được phép kèm #khối (vd "/ve-chung-toi#contact"): kiểm phần
// đường dẫn như mọi đích khác, phần #khối chỉ cần đúng dạng.
for (const den of Object.values(bang.neo)) {
  const [duong, khoi] = den.split("#");
  if (!duongHopLe(duong) && duong !== "/")
    loi.push(`"neo" co dich khong hop le: ${JSON.stringify(den)}`);
  if (khoi !== undefined && !/^[a-z0-9-]+$/.test(khoi))
    loi.push(`"neo" co #khoi khong hop le: ${JSON.stringify(den)}`);
  dich.add(duong);
}

// ---- 2. Không chuyển vòng tròn: trang đích không được là link cũ ----
for (const den of dich) {
  const tiep = timDichChuyenHuong(bang, den, "");
  if (tiep) loi.push(`trang dich "${den}" lai bi chuyen tiep sang "${tiep}"`);
}

// ---- 3. Hàm tìm đích chạy đúng với các dạng link thật ----
const mau = [
  ...bang.duongDan.flatMap((l) => [
    [l.tu, "", l.den],
    [l.tu + "/", "", l.den],
    [l.tu + "/bai-nao-do", "", l.caTrangCon ? l.den : null],
    [l.tu + "-khac", "", null],
  ]),
  ...Object.entries(bang.neo).map(([neo, den]) => ["/", "#" + neo, den]),
  ["/", "", null],
  ["/", "#home", null],
  ["/tour-360", "", null],
  ["/tour-360", "#about", null],
  ["/admin", "", null],
];
for (const [duong, hash, mongDoi] of mau) {
  const ra = timDichChuyenHuong(bang, duong, hash);
  if (ra !== mongDoi)
    loi.push(`${duong}${hash} -> ${ra}, dang le phai la ${mongDoi}`);
}

// ---- 4. Bật công tắc thì trang đích phải có trong App.jsx ----
const app = readFileSync("src/App.jsx", "utf8");
const coTrang = (p) => app.includes(`path="${p}"`);
const thieu = [...dich].filter((p) => !coTrang(p));
if (bang.bat && thieu.length)
  loi.push(
    `cong tac "bat" dang BAT nhung App.jsx chua co trang: ${thieu.join(", ")}`,
  );

// ---- 5. File nginx khớp với bảng ----
const nginxMoi = sinhNginx();
if (chiKiemTra) {
  let nginxCu = "";
  try {
    nginxCu = readFileSync(FILE_NGINX, "utf8").replace(/\r\n/g, "\n");
  } catch {
    // chưa có file -> coi như lệch
  }
  if (nginxCu !== nginxMoi)
    loi.push(`${FILE_NGINX} khong khop voi bang — chay: npm run chuyenhuong`);
} else if (!loi.length) {
  writeFileSync(FILE_NGINX, nginxMoi);
  console.log(`Da ghi ${FILE_NGINX} (${bang.duongDan.length} link cu).`);
}

if (loi.length) {
  console.error("CHUYEN HUONG: CO LOI");
  for (const l of loi) console.error("  SAI  " + l);
  process.exit(1);
}
console.log(
  `Chuyen huong: DAT (${mau.length} mau thu). Cong tac trong web: ${bang.bat ? "BAT" : "TAT"}.` +
    (thieu.length ? ` Trang dich chua co trong App.jsx: ${thieu.join(", ")}.` : ""),
);
