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
//   2. Gom toàn bộ intent trong các MỤC của kienThuc.json thành một danh sách.
//   3. Với mỗi intent, cộng điểm từng từ khóa trúng.
//      Điểm = SỐ TỪ của từ khóa → cụm dài, cụ thể thắng từ đơn chung chung.
//   4. Intent điểm cao nhất thắng; hòa thì intent đứng TRƯỚC trong file thắng.
//   5. Không intent nào dính → trả câu fallback.
// ============================================================

// Từ điển chuẩn hóa từ gõ tắt và thuật ngữ viết tắt phổ biến
const TUDIEN_GO_TAT = {
  miniapp: "mini app",
  zlo: "zalo",
  dvc: "dich vu cong",
  ecom: "ban hang",
  ecommerce: "ban hang",
  lh: "lien he",
  ib: "inbox",
  st: "so dien thoai",
  bds: "bat dong san",
};

// Bỏ dấu tiếng Việt + thường hóa + bỏ dấu câu + gộp khoảng trắng + chuẩn hóa từ gõ tắt.
// Ví dụ: "Giá Zalo bao NHIÊU?" → "gia zalo bao nhieu"
export function normalize(text) {
  let cleaned = text
    .toLowerCase()
    .normalize("NFD") // tách chữ và dấu thanh ra
    .replace(/\p{Diacritic}/gu, "") // xóa dấu thanh (sắc, huyền, hỏi...)
    .replace(/[đĐ]/g, "d") // đ không tách được ở bước trên → xử lý riêng
    .replace(/[^a-z0-9\s]/g, " ") // bỏ dấu câu ? , . ! - ... để khớp trọn từ
    .replace(/\s+/g, " ")
    .trim();

  // Chuẩn hóa các từ gõ tắt dạng từ đơn
  const words = cleaned.split(" ").map((w) => TUDIEN_GO_TAT[w] ?? w);
  return words.join(" ");
}

// ------------------------------------------------------------
// Điền thông tin công ty vào câu trả lời.
//
// Vì sao cần: kho kiến thức KHÔNG được chép tay số điện thoại/địa chỉ —
// bản cũ chép "+84 900 000 000" vào câu trả lời, đổi số trong company.json
// là bot nói sai ngay mà không ai biết. Giờ viết {{cong_ty.dien_thoai}},
// bot tự lấy từ company.json (đúng một nguồn duy nhất cho cả web lẫn bot).
// ------------------------------------------------------------

// Tên tiếng Việt trong kho kiến thức  →  khóa thật trong company.json
const KHOA_CONG_TY = {
  ten: "name",
  ten_day_du: "fullName",
  mo_ta: "description",
  dien_thoai: "phone",
  email: "email",
  dia_chi: "address",
  gio_lam_viec: "workingHours",
  thoi_gian_phan_hoi: "responseTime",
};

// Tên trong kho kiến thức  →  khóa trong kết quả demSoLieu() (utils/soLieu.js).
// Cùng lý do với {{cong_ty.*}}: kho kiến thức KHÔNG được chép tay con số.
// Bản cũ chép "50+ dự án, 30+ khách hàng, 99% hài lòng" vào câu trả lời —
// ba con số không ai xác minh được, mà bot thì nói ra như thể chắc chắn.
const KHOA_SO_LIEU = {
  san_pham: "sanPham",
  don_vi: "donVi",
  nhom: "nhom",
  danh_sach: "danhSach", // danh sách sản phẩm dạng markdown
};

export function dienThongTin(text, congTy, soLieu) {
  let ra = text;

  if (congTy) {
    // $1 là phần tên bên trong {{cong_ty.___}}
    ra = ra.replace(/\{\{cong_ty\.(\w+)\}\}/g, (nguyenVan, ten) => {
      const giaTri = congTy[KHOA_CONG_TY[ten]];
      // Không tìm thấy → GIỮ NGUYÊN {{...}} để lỗi hiện ra thật to,
      // thay vì âm thầm mất một dòng thông tin (script test cũng bắt được).
      return giaTri ?? nguyenVan;
    });
  }

  if (soLieu) {
    ra = ra.replace(/\{\{so_lieu\.(\w+)\}\}/g, (nguyenVan, ten) => {
      const giaTri = soLieu[KHOA_SO_LIEU[ten]];
      return giaTri == null ? nguyenVan : String(giaTri);
    });
  }

  return ra;
}

// ------------------------------------------------------------
// Gom intent của tất cả các mục thành một danh sách phẳng,
// giữ nguyên thứ tự trong file (thứ tự = mức ưu tiên khi hòa điểm).
// ------------------------------------------------------------
export function gomIntents(knowledge) {
  return knowledge.muc.flatMap((muc) =>
    muc.intents.map((intent) => ({ ...intent, mucId: muc.id }))
  );
}

// Một từ khóa có "dính" câu hỏi không?
//   - Cụm nhiều từ ("bao nhiêu", "chi phí")  → khớp chuỗi con (substring)
//   - Từ đơn ("giá", "zalo")                 → khớp TRỌN TỪ, để "giai" KHÔNG
//     dính từ khóa "gia" (đây là lỗi kinh điển của khớp chuỗi con).
function keywordHits(text, tokens, keyword) {
  if (keyword.includes(" ")) return text.includes(keyword);
  return tokens.includes(keyword);
}

// Tìm câu trả lời phù hợp nhất.
//   message   câu khách gõ
//   knowledge nội dung kienThuc.json
//   congTy    nội dung company.json (để điền {{cong_ty.*}}) — có thể bỏ trống
//   soLieu    kết quả demSoLieu() (để điền {{so_lieu.*}}) — có thể bỏ trống
// Trả về: { intentId, mucId, answer, score }
export function findAnswer(message, knowledge, congTy, soLieu) {
  const text = normalize(message);
  const tokens = text.split(" ");

  let best = null;
  let bestScore = 0;

  for (const intent of gomIntents(knowledge)) {
    // "tru" = danh sách cụm LOẠI TRỪ. Trúng một cụm là bỏ qua intent này.
    // Vì sao cần: có những từ khóa vừa rộng vừa không thể bỏ. "bao nhiêu"
    // là của intent giá, nhưng "bao nhiêu DỰ ÁN" lại là hỏi năng lực.
    // (Dự án đã dính đúng kiểu bug này 3 lần — xem CHATBOT.md mục 9.)
    const biLoaiTru = (intent.tru ?? []).some((cum) =>
      text.includes(normalize(cum))
    );
    if (biLoaiTru) continue;

    let score = 0;
    for (const keyword of intent.keywords) {
      const k = normalize(keyword);
      // Điểm = số từ của từ khóa. "quy trinh xet duyet" (3 điểm) thắng
      // "zalo" (1 điểm) — cụm càng cụ thể càng đáng tin.
      if (keywordHits(text, tokens, k)) score += k.split(" ").length;
    }

    // Dùng > (chặt) nên khi HÒA điểm, intent duyệt trước giữ ngôi → thứ tự
    // các mục và intent trong kienThuc.json quyết định ưu tiên.
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (!best) {
    return {
      intentId: "fallback",
      mucId: null,
      answer: dienThongTin(knowledge.fallback, congTy, soLieu),
      score: 0,
    };
  }

  return {
    intentId: best.id,
    mucId: best.mucId,
    answer: dienThongTin(best.answer, congTy, soLieu),
    score: bestScore,
  };
}

// ------------------------------------------------------------
// Chống LẶP giữa hai lượt.
//
// Bot khớp từ khóa KHÔNG nhớ ngữ cảnh: khi bot hỏi ngược ("làm cho lĩnh vực
// nào?") và khách trả lời đúng bằng một từ khóa của CHÍNH intent đó, findAnswer
// sẽ trả về lại đúng intent cũ → câu trả lời y hệt lượt trước, khách thấy bot
// "lặp lại" (đúng lỗi ở câu web giới thiệu).
//
// Cách chặn tận gốc, không phụ thuộc intent: so câu trả lời với câu bot NÓI
// NGAY TRƯỚC. Trùng khít thì thay bằng một câu ĐẨY TỚI (mời để lại liên hệ).
// Đặt ở đây (hàm thuần) để chatService dùng và script test kiểm được.
// ------------------------------------------------------------
export const CAU_DAY_TOI =
  "Dạ đúng mảng đó rồi ạ! 🙌 Để tư vấn sát nhất, bạn mô tả thêm một chút về nhu cầu và để lại **số điện thoại** (hoặc gọi **{{cong_ty.dien_thoai}}**), bên mình sẽ liên hệ ngay nhé!";

export function chongLap(answer, cauBotTruoc, congTy) {
  const lap = Boolean(cauBotTruoc) && cauBotTruoc.trim() === answer.trim();
  return {
    lap,
    response: lap ? dienThongTin(CAU_DAY_TOI, congTy) : answer,
  };
}
