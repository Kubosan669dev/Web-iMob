// ============================================================
// KIỂM TRA LUỒNG NHIỀU LƯỢT — mô phỏng khách TRẢ LỜI câu hỏi ngược của bot.
//
// Chạy:  node scripts/test-chatbot-flow.mjs   (hoặc: npm run test:chat:flow)
//
// Vì sao cần: test-chatbot.mjs chỉ kiểm câu hỏi ĐƠN LẺ. Nhưng nhiều câu trả
// lời của bot kết bằng câu hỏi ngược ("Bạn quan tâm mảng nào?"). Khi khách
// trả lời bằng một cụm ngắn ("spa", "máy tính"...), câu đó phải về ĐÚNG mục —
// KHÔNG được rơi fallback (cụt) và KHÔNG được lặp lại đúng câu vừa hỏi.
//
// Đây chính là lớp lỗi từng gây "lặp vô tận" ở câu web giới thiệu.
// ============================================================
import { readFileSync } from "node:fs";
import { findAnswer, chongLap } from "../src/services/chatBrain.js";

function docJson(p) {
  return JSON.parse(readFileSync(new URL(p, import.meta.url)));
}
const knowledge = docJson("../src/data/kienThuc.json");
const company = docJson("../src/data/company.json");

// Mỗi dòng: câu khách TRẢ LỜI sau khi bot hỏi ngược  →  intent phải về.
// (ctx = câu bot vừa hỏi trước đó, chỉ để dễ đọc.)
const flows = [
  // Khách chọn dịch vụ khi bot hỏi "quan tâm mảng nào?"
  { ctx: "company-intro / greeting", reply: "Zalo Mini App", expect: "zalo-miniapp" },
  { ctx: "company-intro / greeting", reply: "phần mềm", expect: "software-hardware" },
  { ctx: "company-intro / greeting", reply: "đào tạo", expect: "digital-training" },
  { ctx: "company-intro / greeting", reply: "website", expect: "website" },
  { ctx: "company-intro / greeting", reply: "chatbot", expect: "chatbot-ai" },

  // Khách chọn LĨNH VỰC khi bot hỏi "làm Mini App cho lĩnh vực nào?"
  { ctx: "zalo-miniapp / zma-la-gi", reply: "spa", expect: "nganh-spa-beauty" },
  { ctx: "zalo-miniapp / zma-la-gi", reply: "nhà hàng", expect: "nganh-fb-nhahang" },
  { ctx: "zalo-miniapp / zma-la-gi", reply: "y tế", expect: "zma-y-te" },
  { ctx: "zalo-miniapp / zma-la-gi", reply: "giáo dục", expect: "zma-giao-duc" },
  { ctx: "zalo-miniapp / zma-la-gi", reply: "dịch vụ công", expect: "zma-dich-vu-cong" },

  // Khách nêu rõ mô hình / mặt hàng
  { ctx: "nganh-fb-nhahang", reply: "quán cafe", expect: "nganh-fb-nhahang" },
  { ctx: "zma-y-te", reply: "phòng khám", expect: "zma-y-te" },
  { ctx: "zma-y-te", reply: "bệnh viện", expect: "zma-y-te" },
  { ctx: "zma-giao-duc", reply: "trường mầm non", expect: "zma-giao-duc" },
  { ctx: "nganh-bds-dulich", reply: "bất động sản", expect: "nganh-bds-dulich" },
  { ctx: "nganh-bds-dulich", reply: "du lịch", expect: "nganh-bds-dulich" },
  { ctx: "nganh-bds-dulich", reply: "homestay", expect: "nganh-bds-dulich" },
  { ctx: "web-ban-hang", reply: "máy tính", expect: "web-may-tinh-pc" },

  // Cổng thanh toán
  { ctx: "tich-hop-thanh-toan-qr", reply: "vietqr", expect: "tich-hop-thanh-toan-qr" },
  { ctx: "tich-hop-thanh-toan-qr", reply: "vnpay", expect: "tich-hop-thanh-toan-qr" },
];

let pass = 0;
const fails = [];
for (const f of flows) {
  const { intentId } = findAnswer(f.reply, knowledge, company);
  if (intentId === f.expect) pass += 1;
  else fails.push({ ...f, got: intentId });
}

console.log("\n=== KIỂM TRA LUỒNG NHIỀU LƯỢT ===");
console.log(`Tổng lượt trả lời: ${flows.length}`);
console.log(`Đúng hướng:        ${pass}`);
console.log(`Sai/cụt:           ${fails.length}\n`);

if (fails.length > 0) {
  console.log("--- CÁC LƯỢT TRẢ LỜI ĐI SAI (cụt fallback hoặc lạc mục) ---");
  for (const f of fails) {
    console.log(`  ✗ [sau "${f.ctx}"]  khách: "${f.reply}"`);
    console.log(`      mong đợi: ${f.expect}  →  bot về: ${f.got}`);
  }
  console.log("");
}

// ============================================================
// Phần B — CHỐNG LẶP: khi câu trả lời trùng y hệt câu bot vừa nói trước đó
// (khách gõ đúng từ khóa của intent), chongLap phải đổi sang câu đẩy tới.
// ============================================================
let lapPass = 0;
const lapFails = [];
const cauLap = ["phòng khám", "vietqr", "chuỗi spa", "web giới thiệu", "bất động sản"];
for (const reply of cauLap) {
  const { answer } = findAnswer(reply, knowledge, company);
  const g = chongLap(answer, answer, company); // giả lập: câu bot trước = chính nó
  const ok = g.lap && g.response !== answer && g.response.includes(company.phone);
  if (ok) lapPass += 1;
  else lapFails.push({ reply, response: g.response });
}
// Ngược lại: câu trước KHÁC hẳn thì KHÔNG được chặn nhầm.
const mau = findAnswer("phòng khám", knowledge, company);
const gKhac = chongLap(mau.answer, "một câu hoàn toàn khác", company);
const khongChanNham = !gKhac.lap && gKhac.response === mau.answer;

console.log("=== CHỐNG LẶP (chongLap) ===");
console.log(`Bắt đúng lặp:      ${lapPass}/${cauLap.length}`);
console.log(`Không chặn nhầm:   ${khongChanNham ? "OK" : "SAI"}\n`);
for (const f of lapFails) console.log(`  ✗ "${f.reply}" → ${f.response.slice(0, 60)}...`);

const tongLoi = fails.length + lapFails.length + (khongChanNham ? 0 : 1);
process.exit(tongLoi > 0 ? 1 : 0);
