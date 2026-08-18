// ============================================================
// Script KIỂM TRA chatbot — chạy toàn bộ câu hỏi thử nghiệm qua "bộ não"
// và in báo cáo: câu nào khớp đúng, câu nào sai, tỉ lệ chính xác.
//
// Chạy:  node scripts/test-chatbot.mjs      (hoặc: npm run test:chat)
//
// Không cần internet, không cần server — chỉ kiểm tra logic khớp từ khóa.
//
// Kiểm 5 thứ:
//   1. KHỚP ĐÚNG INTENT    — câu hỏi có về đúng mục kiến thức không
//   2. NỘI DUNG (phai_co)  — câu trả lời có nhắc tới điều đáng lẽ phải nhắc
//                             không (bắt lỗi "đúng intent nhưng đáp lạc đề")
//   3. TỪ KHÓA TRÙNG       — cùng một từ khóa ở 2 intent → chúng tranh nhau
//   4. INTENT CHƯA CÓ TEST — kiến thức thêm vào mà chưa ai kiểm
//   5. {{cong_ty.*}} SAI TÊN — placeholder không điền được, lộ ra cho khách
// ============================================================
import { readFileSync } from "node:fs";
import {
  findAnswer,
  gomIntents,
  dienThongTin,
  normalize,
} from "../src/services/chatBrain.js";
import { demSoLieu, danhSachMarkdown } from "../src/utils/soLieu.js";

// Đọc dữ liệu (đọc bằng fs để chạy được trên Node không cần cấu hình JSON import)
function docJson(duongDan) {
  return JSON.parse(readFileSync(new URL(duongDan, import.meta.url)));
}

const knowledge = docJson("../src/data/kienThuc.json");
const company = docJson("../src/data/company.json");
const { cases } = docJson("../src/data/chatTestQuestions.json");
const projects = docJson("../src/data/projects.json");

// Số liệu bot đọc cho khách nghe được ĐẾM từ danh sách sản phẩm, y như lúc
// chạy thật (xem src/utils/soLieu.js) — test phải dùng cùng một nguồn, không
// thì phép kiểm 5 bên dưới sẽ báo {{so_lieu.*}} chưa điền được.
const soLieu = {
  ...demSoLieu(projects.danhSach),
  danhSach: danhSachMarkdown(projects.danhSach),
};

const intents = gomIntents(knowledge);

// ============================================================
// 1 + 2. Chạy từng câu hỏi thử nghiệm
// ============================================================
let pass = 0;
const fails = [];
const lacDe = [];

for (const c of cases) {
  const { intentId, answer } = findAnswer(c.q, knowledge, company, soLieu);

  if (intentId !== c.expect) {
    fails.push({ q: c.q, expect: c.expect, got: intentId });
    continue;
  }

  // Đúng intent rồi vẫn phải kiểm nội dung: "phai_co" liệt kê vài từ mà câu
  // trả lời ĐÚNG chắc chắn phải chứa ít nhất một (vd hỏi địa chỉ → "Hạ Long").
  const thap = answer.toLowerCase();
  if (c.phai_co && !c.phai_co.some((tu) => thap.includes(tu.toLowerCase()))) {
    lacDe.push({ q: c.q, expect: c.expect, phai_co: c.phai_co });
    continue;
  }

  pass += 1;
}

const total = cases.length;
const rate = ((pass / total) * 100).toFixed(1);

console.log("\n=== KIỂM TRA CHATBOT ===");
console.log(`Kho kiến thức: ${knowledge.muc.length} mục · ${intents.length} intent`);
console.log(`Tổng câu hỏi:  ${total}`);
console.log(`Khớp đúng:     ${pass}`);
console.log(`Khớp sai:      ${fails.length}`);
console.log(`Lạc nội dung:  ${lacDe.length}`);
console.log(`Độ chính xác:  ${rate}%\n`);

if (fails.length > 0) {
  console.log("--- CÁC CÂU KHỚP SAI (cần xem lại từ khóa) ---");
  for (const f of fails) {
    console.log(`  ✗ "${f.q}"`);
    console.log(`      mong đợi: ${f.expect}  →  bot khớp: ${f.got}`);
  }
  console.log("");
}

if (lacDe.length > 0) {
  console.log("--- ĐÚNG INTENT NHƯNG CÂU TRẢ LỜI THIẾU Ý ---");
  for (const f of lacDe) {
    console.log(`  ✗ "${f.q}"  (${f.expect})`);
    console.log(`      câu trả lời không nhắc tới: ${f.phai_co.join(" / ")}`);
  }
  console.log("");
}

// ============================================================
// 3. Từ khóa trùng giữa 2 intent.
//    Lỗi số 1 khi kho kiến thức phình to: hai intent cùng nhận một từ khóa
//    thì cái đứng sau gần như không bao giờ thắng.
// ============================================================
const chuSoHuu = new Map(); // từ khóa đã chuẩn hóa → intent đầu tiên dùng nó
const trung = [];

for (const intent of intents) {
  for (const keyword of intent.keywords) {
    const k = normalize(keyword);
    if (chuSoHuu.has(k)) {
      trung.push({ k, truoc: chuSoHuu.get(k), sau: intent.id });
    } else {
      chuSoHuu.set(k, intent.id);
    }
  }
}

if (trung.length > 0) {
  console.log("--- ⚠️  TỪ KHÓA BỊ TRÙNG (nên đổi cho khác nhau) ---");
  for (const t of trung) {
    console.log(`  "${t.k}"  →  ${t.truoc}  vs  ${t.sau}`);
  }
  console.log("");
}

// ============================================================
// 4. Intent chưa có câu hỏi kiểm tra
// ============================================================
const daKiem = new Set(cases.map((c) => c.expect));
const thieuTest = intents.filter((i) => !daKiem.has(i.id)).map((i) => i.id);

if (thieuTest.length > 0) {
  console.log("--- ⚠️  INTENT CHƯA CÓ CÂU HỎI KIỂM TRA ---");
  console.log(`  ${thieuTest.join(", ")}\n`);
}

// ============================================================
// 5. Placeholder viết sai tên sẽ còn nguyên {{...}} trong câu trả lời
//    → khách nhìn thấy chuỗi kỹ thuật. Bắt ngay ở đây.
// ============================================================
const conPlaceholder = intents
  .filter((i) => dienThongTin(i.answer, company, soLieu).includes("{{"))
  .map((i) => i.id);

if (conPlaceholder.length > 0) {
  console.log("--- ⚠️  CÒN {{...}} CHƯA ĐIỀN ĐƯỢC (sai tên biến?) ---");
  console.log(`  ${conPlaceholder.join(", ")}\n`);
}

// Thoát mã lỗi nếu có vấn đề — tiện cho việc kiểm tra tự động sau này
const tongLoi =
  fails.length + lacDe.length + trung.length + conPlaceholder.length;
process.exit(tongLoi > 0 ? 1 : 0);
