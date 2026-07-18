// ============================================================
// chatBrain: "bộ não" khớp câu hỏi → câu trả lời từ kho kiến thức.
//
// Đây là HÀM THUẦN (pure): vào là chuỗi + kho kiến thức, ra là kết quả.
// KHÔNG phụ thuộc React/Vite/mạng → chạy được cả trong trình duyệt LẪN
// bằng Node (nhờ vậy mới viết được script kiểm tra tự động).
//
// Cách hoạt động (khớp từ khóa có chấm điểm):
//   1. Chuẩn hóa câu hỏi: bỏ dấu, thường hóa (để "GIÁ", "gia", "giá"
//      đều như nhau — người Việt hay gõ không dấu).
//   2. Với mỗi intent, đếm xem có bao nhiêu từ khóa xuất hiện.
//   3. Intent điểm cao nhất thắng; hòa thì intent đứng TRƯỚC thắng.
//   4. Không intent nào dính → trả câu fallback.
// ============================================================

// Bỏ dấu tiếng Việt + thường hóa + bỏ dấu câu + gộp khoảng trắng.
// Ví dụ: "Giá Zalo bao NHIÊU?" → "gia zalo bao nhieu"
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // tách chữ và dấu thanh ra
    .replace(/\p{Diacritic}/gu, "") // xóa dấu thanh (sắc, huyền, hỏi...)
    .replace(/[đĐ]/g, "d") // đ không tách được ở bước trên → xử lý riêng
    .replace(/[^a-z0-9\s]/g, " ") // bỏ dấu câu ? , . ! - ... để khớp trọn từ
    .replace(/\s+/g, " ")
    .trim();
}

// Một từ khóa có "dính" câu hỏi không?
//   - Cụm nhiều từ ("bao nhiêu", "chi phí")  → khớp chuỗi con (substring)
//   - Từ đơn ("giá", "zalo")                 → khớp TRỌN TỪ, để "giai" KHÔNG
//     dính từ khóa "gia" (đây là lỗi kinh điển của khớp chuỗi con).
function keywordHits(text, tokens, keyword) {
  const k = normalize(keyword);
  if (k.includes(" ")) return text.includes(k);
  return tokens.includes(k);
}

// Tìm câu trả lời phù hợp nhất.
// Trả về: { intentId, answer, score }
export function findAnswer(message, knowledge) {
  const text = normalize(message);
  const tokens = text.split(" ");

  let best = null;
  let bestScore = 0;

  for (const intent of knowledge.intents) {
    let score = 0;
    for (const keyword of intent.keywords) {
      if (keywordHits(text, tokens, keyword)) score += 1;
    }
    // Dùng > (chặt) nên khi HÒA điểm, intent duyệt trước giữ ngôi → thứ tự
    // trong chatKnowledge.json quyết định ưu tiên.
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (!best) {
    return { intentId: "fallback", answer: knowledge.fallback, score: 0 };
  }
  return { intentId: best.id, answer: best.answer, score: bestScore };
}
