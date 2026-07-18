// ============================================================
// Script KIỂM TRA chatbot — chạy toàn bộ câu hỏi thử nghiệm qua "bộ não"
// và in báo cáo: câu nào khớp đúng, câu nào sai, tỉ lệ chính xác.
//
// Chạy:  node scripts/test-chatbot.mjs      (hoặc: npm run test:chat)
//
// Không cần internet, không cần LLM — chỉ kiểm tra logic khớp từ khóa.
// ============================================================
import { readFileSync } from "node:fs";
import { findAnswer } from "../src/services/chatBrain.js";

// Đọc dữ liệu (đọc bằng fs để chạy được trên Node không cần cấu hình JSON import)
const knowledge = JSON.parse(
  readFileSync(new URL("../src/data/chatKnowledge.json", import.meta.url))
);
const { cases } = JSON.parse(
  readFileSync(new URL("../src/data/chatTestQuestions.json", import.meta.url))
);

let pass = 0;
const fails = [];

for (const c of cases) {
  const { intentId } = findAnswer(c.q, knowledge);
  if (intentId === c.expect) {
    pass += 1;
  } else {
    fails.push({ q: c.q, expect: c.expect, got: intentId });
  }
}

const total = cases.length;
const rate = ((pass / total) * 100).toFixed(1);

console.log("\n=== KIỂM TRA CHATBOT ===");
console.log(`Tổng câu hỏi: ${total}`);
console.log(`Khớp đúng:    ${pass}`);
console.log(`Khớp sai:     ${fails.length}`);
console.log(`Độ chính xác: ${rate}%\n`);

if (fails.length > 0) {
  console.log("--- CÁC CÂU KHỚP SAI (cần xem lại từ khóa) ---");
  for (const f of fails) {
    console.log(`  ✗ "${f.q}"`);
    console.log(`      mong đợi: ${f.expect}  →  bot khớp: ${f.got}`);
  }
  console.log("");
}

// Thoát mã lỗi nếu có câu sai — tiện cho việc kiểm tra tự động sau này
process.exit(fails.length > 0 ? 1 : 0);
