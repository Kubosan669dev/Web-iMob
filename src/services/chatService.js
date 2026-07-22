import knowledge from "../data/kienThuc.json";
import company from "../data/company.json";
import { findAnswer } from "./chatBrain.js";

// ============================================================
// chatService: "tổng đài" — nơi DUY NHẤT giao diện gọi để lấy câu trả lời.
//
// Bot chạy HOÀN TOÀN TRONG TRÌNH DUYỆT: đọc kho kiến thức (kienThuc.json)
// rồi khớp từ khóa (chatBrain.js). Không gọi mạng, không cần server.
//
// Vì sao bỏ backend AI (FastAPI + Ollama)?
//   - Model 3B chạy local từng BỊA thông tin thật (nói địa chỉ ở "Đống Đa,
//     Hà Nội" trong khi dữ liệu ghi Hạ Long) — xem BAO-CAO-DANH-GIA.md.
//   - Nó đọc sai tiếng Việt không dấu và không tự chống được câu đánh lừa,
//     nên phải dựng thêm guard.py chặn cứng những câu quan trọng nhất.
//   - Ollama bắt người dùng cài đặt, ăn GPU, và không deploy được lên
//     hosting tĩnh.
// Đổi lại, kho kiến thức phải giàu và có tổ chức — đó là việc của
// src/data/kienThuc.json (muốn bot thông minh hơn thì thêm vào file đó).
// Thư mục backend/ vẫn còn trong repo làm tư liệu, nhưng website KHÔNG gọi tới.
//
// Chữ ký cố định (hợp đồng giữa UI và bộ não):
//   sendMessage(message, history) → Promise<{ response: string }>
// ============================================================

// Nghỉ một nhịp trước khi trả lời. Bot trả lời tức thì (0ms) trông giật cục
// và làm hiệu ứng "đang gõ" chỉ loé lên rồi tắt — chờ chút cho tự nhiên.
const DO_TRE_MS = 350;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// history: lịch sử hội thoại UI gửi kèm. Bot khớp từ khóa chưa dùng tới,
// nhưng giữ tham số để UI không phải sửa nếu sau này bot hiểu câu nối tiếp.
// eslint-disable-next-line no-unused-vars
export async function sendMessage(message, history = []) {
  await sleep(DO_TRE_MS);

  // company: để chatBrain điền {{cong_ty.dien_thoai}}, {{cong_ty.dia_chi}}...
  const { answer } = findAnswer(message, knowledge, company);
  return { response: answer };
}
