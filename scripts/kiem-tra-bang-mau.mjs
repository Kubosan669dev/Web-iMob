// ============================================================
// NGUỒN SỰ THẬT của các bảng màu.
//
// Chạy:  npm run bangmau
//   1. đo tương phản WCAG cho mọi cặp chữ/nền của từng bảng
//   2. đạt hết thì ghi đè src/data/bangMau.js
//   3. hụt một phép nào là DỪNG, không ghi file — để màu không đọc được
//      không bao giờ lọt ra website
//
// Vì sao phải đo chứ không chọn bằng mắt: màu thương hiệu ở đây phải dùng
// được CẢ làm chữ trên nền trang LẪN làm nền nút. Sắc cam và hồng tươi trông
// rất đẹp nhưng chỉ đạt khoảng 2,5:1 khi làm chữ trên nền trắng — nhìn thì
// vẫn "thấy" nhưng người mắt kém đọc không nổi. Các tông đó ở đây đã bị nén
// đậm xuống cho đủ 4,5:1.
// ============================================================
import { writeFileSync } from "node:fs";

/* ---------- Đo tương phản (công thức WCAG 2.1) ---------- */
function rgb(hex) {
  const h = hex.replace("#", "");
  const d = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(d.slice(i, i + 2), 16));
}

function doSang(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function tuongPhan(a, b) {
  const [x, y] = [doSang(a), doSang(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/* ---------- Giá trị dùng chung cho mọi bảng NỀN SÁNG ---------- */
const CHUNG_SANG = {
  loi: "#b3261e",
  loiNen: "#fdecea",
  canhbao: "#955405",
  canhbaoCham: "#d97706",
  trenBrand: "#ffffff",
};

const BANG = {
  "cham-tim": {
    ten: "Chàm tím iMob", mo: "Màu trong logo, mặc định", toi: false,
    paper: "#ffffff", mist: "#f5f5f7", panel: "#ffffff",
    ink: "#1a1a2e", inkSoft: "#55556b", inkFaint: "#6f6f80", line: "#e5e5ea",
    brand: "#4b31d4", brandDeep: "#2f1d96", brandSoft: "#eeeafc", ...CHUNG_SANG,
  },
  "paper-heritage": {
    ten: "Paper Heritage", mo: "Sang, sáng, dễ đọc", toi: false,
    paper: "#fdfbf6", mist: "#f4efe2", panel: "#ffffff",
    ink: "#241f16", inkSoft: "#5a5142", inkFaint: "#6f6555", line: "#e6dcc6",
    brand: "#7a5d18", brandDeep: "#5c460f", brandSoft: "#f6efdc", ...CHUNG_SANG,
  },
  "coral-sunrise": {
    ten: "Coral Sunrise", mo: "San hô ấm, năng động", toi: false,
    paper: "#fffaf8", mist: "#ffeee7", panel: "#ffffff",
    ink: "#26160f", inkSoft: "#6a5246", inkFaint: "#82675a", line: "#f4ddd1",
    brand: "#c03d10", brandDeep: "#96300b", brandSoft: "#ffe9de", ...CHUNG_SANG,
  },
  "teal-paradise": {
    ten: "Teal Paradise", mo: "Xanh ngọc tươi", toi: false,
    paper: "#f9fefd", mist: "#e6f6f2", panel: "#ffffff",
    ink: "#10231f", inkSoft: "#475e59", inkFaint: "#566d67", line: "#cde8e2",
    brand: "#0e6f67", brandDeep: "#0a534d", brandSoft: "#d2f1eb", ...CHUNG_SANG,
  },
  "ha-long-blue": {
    ten: "Hạ Long Blue", mo: "Xanh biển vịnh Hạ Long", toi: false,
    paper: "#f9fcff", mist: "#e8f1fb", panel: "#ffffff",
    ink: "#101c28", inkSoft: "#475868", inkFaint: "#5c6f80", line: "#d2e1f0",
    brand: "#125da6", brandDeep: "#0d4881", brandSoft: "#dbe9fb", ...CHUNG_SANG,
  },
  "forest-zen": {
    ten: "Forest Zen", mo: "Ngọc lục rừng thiền", toi: false,
    paper: "#fafdf9", mist: "#eaf4e8", panel: "#ffffff",
    ink: "#14210f", inkSoft: "#4c5c47", inkFaint: "#60715b", line: "#d6e5d2",
    brand: "#2b6630", brandDeep: "#204d24", brandSoft: "#dcedd9", ...CHUNG_SANG,
  },
  "rose-lotus": {
    ten: "Rose Lotus", mo: "Hồng sen mềm", toi: false,
    paper: "#fffafc", mist: "#fce9f0", panel: "#ffffff",
    ink: "#26101a", inkSoft: "#684755", inkFaint: "#805c6b", line: "#f2d5df",
    brand: "#b81a5c", brandDeep: "#93144a", brandSoft: "#fbdde9", ...CHUNG_SANG,
  },
  "zen-neutral": {
    ten: "Zen Neutral", mo: "Trung tính, tối giản", toi: false,
    paper: "#fbfbfa", mist: "#efefed", panel: "#ffffff",
    ink: "#1a1a1a", inkSoft: "#54545a", inkFaint: "#6c6c73", line: "#e1e1df",
    brand: "#465166", brandDeep: "#333c4d", brandSoft: "#e3e5ea", ...CHUNG_SANG,
  },
  // Bảng NỀN TỐI: cố ý KHÔNG dùng CHUNG_SANG. Hai chỗ phải đảo ngược so với
  // bảng sáng, quên là hỏng ngay:
  //   • brandDeep (trạng thái rê chuột) phải SÁNG HƠN brand, không phải đậm hơn
  //   • trenBrand phải là màu TỐI — chữ trắng trên nền hồng nhạt không đọc được
  "midnight-crimson": {
    ten: "Midnight Crimson", mo: "Nền tối, đỏ trầm", toi: true,
    paper: "#101017", mist: "#1a1a24", panel: "#1a1a24",
    ink: "#f2f2f7", inkSoft: "#a9a9bb", inkFaint: "#8e8ea0", line: "#2c2c3a",
    brand: "#ff6b7f", brandDeep: "#ff94a3", brandSoft: "#33161d",
    trenBrand: "#1a0409", loi: "#ff8a80", loiNen: "#33161a",
    canhbao: "#ffb74d", canhbaoCham: "#ffb74d",
  },
};

/* ---------- Các phép đo bắt buộc ---------- */
const KIEM = [
  ["ink", "paper", 7.0, "chữ thân bài trên nền trang"],
  ["ink", "mist", 7.0, "chữ thân bài trên dải nền phụ"],
  ["ink", "panel", 7.0, "chữ trong thẻ"],
  ["inkSoft", "paper", 4.5, "chữ phụ trên nền trang"],
  ["inkSoft", "mist", 4.5, "chữ phụ trên dải nền phụ"],
  ["inkFaint", "paper", 4.5, "chữ mờ nhất trên nền trang"],
  ["inkFaint", "mist", 4.5, "chữ mờ nhất trên dải nền phụ"],
  ["brand", "paper", 4.5, "chữ màu thương hiệu trên nền trang"],
  ["brand", "mist", 4.5, "chữ màu thương hiệu trên dải nền phụ"],
  ["brand", "brandSoft", 4.5, "chữ thương hiệu trong ô nhãn"],
  ["trenBrand", "brand", 4.5, "chữ trên nút chính"],
  ["trenBrand", "brandDeep", 4.5, "chữ trên nút chính lúc rê chuột"],
  ["loi", "loiNen", 4.5, "chữ lỗi trong khối lỗi"],
  ["loi", "paper", 4.5, "chữ lỗi trên nền trang"],
  ["canhbao", "mist", 4.5, "chữ cảnh báo trên nền phụ"],
];

let hong = 0;
for (const [khoa, p] of Object.entries(BANG)) {
  const loi = [];
  for (const [chu, nen, nguong, nhan] of KIEM) {
    const r = tuongPhan(p[chu], p[nen]);
    if (r < nguong) {
      loi.push(
        `    x ${nhan.padEnd(40)} ${r.toFixed(2)}  (cần >= ${nguong.toFixed(1)})  ${p[chu]} trên ${p[nen]}`
      );
    }
  }
  if (loi.length) {
    hong++;
    console.log(`[${khoa}] ${p.ten}`);
    console.log(loi.join("\n"));
  }
}

const soBang = Object.keys(BANG).length;
console.log(
  `\n${"=".repeat(60)}\nKET QUA: ${soBang - hong}/${soBang} bang mau DAT toan bo ${KIEM.length} phep do.`
);

if (hong > 0) {
  console.error("\nCO BANG KHONG DAT — KHONG ghi file. Sua mau roi chay lai.");
  process.exit(1);
}

/* ---------- Sinh file dữ liệu ---------- */
const TEN_BIEN = [
  ["paper", "--color-paper"], ["mist", "--color-mist"], ["panel", "--color-panel"],
  ["ink", "--color-ink"], ["inkSoft", "--color-ink-soft"],
  ["inkFaint", "--color-ink-faint"], ["line", "--color-line"],
  ["brand", "--color-brand"], ["brandDeep", "--color-brand-deep"],
  ["brandSoft", "--color-brand-soft"], ["trenBrand", "--color-tren-brand"],
  ["loi", "--color-loi"], ["loiNen", "--color-loi-nen"],
  ["canhbao", "--color-canhbao"], ["canhbaoCham", "--color-canhbao-cham"],
];

const dau = [
  "// ============================================================",
  "// BẢNG MÀU — sinh tự động, ĐỪNG sửa tay.",
  "//",
  "// Nguồn: scripts/kiem-tra-bang-mau.mjs. Sửa màu thì sửa ở đó rồi chạy lại",
  "// `npm run bangmau`, nó vừa đo tương phản vừa ghi đè file này. Hụt một phép",
  "// đo là script dừng, không ghi — màu không đọc được không lọt ra website.",
  "//",
  "// Mỗi bảng màu chỉ là một tập biến CSS. Đổi bảng màu = gán lại biến trên thẻ",
  "// <html>, KHÔNG phải build lại: Tailwind v4 biên dịch mọi utility thành",
  "// var(--color-*), nên đổi biến là cả trang đổi theo ngay lập tức.",
  "//",
  `// Mọi bảng đã qua ${KIEM.length} phép đo tương phản WCAG.`,
  "// ============================================================",
  "",
  "/** Bảng màu dùng khi chưa ai chọn gì. Là màu trong logo iMob. */",
  'export const KHOA_MAC_DINH = "cham-tim";',
  "",
  "export const BANG_MAU = [",
];

const ra = [...dau];
for (const [khoa, p] of Object.entries(BANG)) {
  ra.push("  {");
  ra.push(`    khoa: ${JSON.stringify(khoa)},`);
  ra.push(`    ten: ${JSON.stringify(p.ten)},`);
  ra.push(`    moTa: ${JSON.stringify(p.mo)},`);
  ra.push(`    toi: ${p.toi},`);
  ra.push("    bien: {");
  for (const [k, css] of TEN_BIEN) {
    ra.push(`      ${JSON.stringify(css)}: ${JSON.stringify(p[k])},`);
  }
  ra.push("    },");
  ra.push("  },");
}
ra.push("];");
ra.push("");
ra.push("/** Tra bảng màu theo khóa; khóa lạ thì trả bảng mặc định. */");
ra.push("export function timBangMau(khoa) {");
ra.push("  return (");
ra.push("    BANG_MAU.find((b) => b.khoa === khoa) ??");
ra.push("    BANG_MAU.find((b) => b.khoa === KHOA_MAC_DINH)");
ra.push("  );");
ra.push("}");
ra.push("");

writeFileSync("src/data/bangMau.js", ra.join("\n"), "utf8");

/* ---------- Sinh file CSS ----------
   Vì sao đổi bảng màu bằng THUỘC TÍNH trên <html> chứ không gán style bằng JS:
   JS chỉ chạy được sau khi React gắn xong, nên nếu bảng màu chính thức là nền
   tối thì người xem thấy một nháy trắng rồi mới tối — rất chói mắt. Với cách
   này, một đoạn script ngắn trong index.html gán được thuộc tính TRƯỚC khi
   trình duyệt vẽ khung hình đầu tiên, mà không cần biết mã màu nào cả.

   Bộ chọn viết là `html[data-bang-mau="..."]` chứ không phải `[data-bang-mau]`:
   `:root` do Tailwind sinh ra có độ ưu tiên (0,1,0), bằng đúng một bộ chọn
   thuộc tính trần — khi bằng nhau thì thứ tự trong file quyết định, mà thứ tự
   đó lại phụ thuộc cách Tailwind ghép file. Thêm `html` thành (0,1,1) là luôn
   thắng, không phải phụ thuộc may rủi. */
const css = [
  "/* ============================================================",
  "   BẢNG MÀU — sinh tự động, ĐỪNG sửa tay.",
  "   Nguồn: scripts/kiem-tra-bang-mau.mjs  ·  chạy lại: npm run bangmau",
  "   ============================================================ */",
  "",
];
for (const [khoa, p] of Object.entries(BANG)) {
  css.push(`/* ${p.ten} — ${p.mo} */`);
  css.push(`html[data-bang-mau="${khoa}"] {`);
  css.push(`  color-scheme: ${p.toi ? "dark" : "light"};`);
  for (const [k, bien] of TEN_BIEN) css.push(`  ${bien}: ${p[k]};`);
  css.push("}");
  css.push("");
}
writeFileSync("src/styles/bangMau.css", css.join("\n"), "utf8");

console.log(`Da ghi src/data/bangMau.js va src/styles/bangMau.css — ${soBang} bang mau.`);
