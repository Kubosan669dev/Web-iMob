import knowledge from "../data/kienThuc.json";
import company from "../data/company.json";
import { findAnswer, chongLap } from "./chatBrain.js";

// ============================================================
// chatService: "tổng đài" — nơi DUY NHẤT giao diện gọi để lấy câu trả lời.
//
// Bot chạy HOÀN TOÀN TRONG TRÌNH DUYỆT: đọc kho kiến thức (kienThuc.json)
// rồi khớp từ khóa (chatBrain.js). Không gọi mạng, không cần server.
//
// Vì sao bỏ tầng AI (dự án từng chạy FastAPI + Ollama + qwen2.5:3b)?
//   - Model 3B chạy local từng BỊA thông tin thật (nói địa chỉ ở "Đống Đa,
//     Hà Nội" trong khi dữ liệu ghi Hạ Long).
//   - Nó đọc sai tiếng Việt không dấu và không tự chống được câu đánh lừa,
//     nên phải dựng thêm một lớp luật cứng chặn các câu quan trọng nhất.
//   - Ollama bắt người dùng cài đặt, ăn GPU, và không deploy được lên
//     hosting tĩnh.
// Chi tiết đầy đủ ở CHATBOT.md mục 9.
//
// Đổi lại, kho kiến thức phải giàu và có tổ chức — đó là việc của
// src/data/kienThuc.json (muốn bot thông minh hơn thì thêm vào file đó).
//
// Chữ ký cố định (hợp đồng giữa UI và bộ não):
//   sendMessage(message, history) → Promise<{ response: string }>
// ============================================================

// Nghỉ một nhịp trước khi trả lời. Bot trả lời tức thì (0ms) trông giật cục
// và làm hiệu ứng "đang gõ" chỉ loé lên rồi tắt — chờ chút cho tự nhiên.
const DO_TRE_MS = 350;

// Tổng thời gian tối đa dành cho bước gọi Gemini. Hết ngân sách này là dừng
// hẳn và trả câu trả lời địa phương, KHÔNG để khách chờ mãi.
const AI_BUDGET_MS = 8000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Lấy Gemini API Key từ biến môi trường (nếu có)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Gọi Google Gemini API (0đ Free Tier) với danh sách mô hình dự phòng
 */
async function callGeminiAI(message, history = []) {
  if (!GEMINI_API_KEY) return null;

  const systemContext = `
Bạn là trợ lý ảo AI thông minh của công ty công nghệ iMob (${company.fullName}).
Thông tin chính thức của iMob:
- Hotline / Zalo: ${company.phone} | Email: ${company.email}
- Địa chỉ: ${company.address} | Giờ làm việc: ${company.workingHours}
- Các dịch vụ chính: Zalo Mini App trọn gói, Web thương mại điện tử / Bán máy tính / SEO, Phần mềm & Phần cứng IoT quản lý kho / F&B / Spa / Dịch vụ công, Đào tạo Chuyển đổi số.

Nhiệm vụ của bạn:
- Trả lời thân thiện, lịch sự, chuyên nghiệp bằng tiếng Việt.
- Giải thích sâu và chính xác theo bối cảnh câu hỏi của khách hàng.
- QUY TẮC BẤT BIẾN: Tuyệt đối KHÔNG tự bịa ra con số giá cụ thể hoặc thời gian cụ thể. Nếu khách hỏi giá hoặc quy trình chi tiết, hãy tư vấn khái quát và khuyên khách để lại SĐT hoặc gọi hotline ${company.phone} để được báo giá miễn phí.
`;

  // Chỉ giữ vài model ĐÃ XÁC NHẬN chạy với key hiện tại, xếp NHANH NHẤT lên
  // đầu (bản "lite" phản hồi nhanh hơn hẳn bản flash đầy đủ). Đã bỏ
  // "gemini-3.5-flash" vì key này không có quyền dùng → gọi xong mới 404, phí giờ.
  const CANDIDATE_MODELS = [
    "gemini-flash-lite-latest", // nhanh nhất
    "gemini-flash-latest",      // dự phòng, trả lời sâu hơn
    "gemini-3.6-flash",         // dự phòng 2
  ];

  const formattedHistory = history.map((h) => ({
    role: h.role === "assistant" ? "model" : "user",
    parts: [{ text: h.content }],
  }));

  // Mốc hết giờ chung cho cả vòng lặp: 5 model × 15s (cũ) = tối đa ~75 giây
  // "khựng". Giờ tổng cộng không vượt AI_BUDGET_MS.
  const deadline = Date.now() + AI_BUDGET_MS;

  for (const model of CANDIDATE_MODELS) {
    const conLaiMs = deadline - Date.now();
    if (conLaiMs <= 500) break; // gần hết ngân sách → khỏi thử model tiếp theo
    try {
      // Timeout mỗi lần gọi = phần ngân sách còn lại (tối đa 6s/lần)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Math.min(6000, conLaiMs));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: systemContext }] },
              { role: "model", parts: [{ text: "Tôi đã hiểu rõ nhiệm vụ và thông tin của iMob. Tôi sẵn sàng hỗ trợ khách hàng!" }] },
              ...formattedHistory,
              { role: "user", parts: [{ text: message }] },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500, // câu ngắn hơn → sinh nhanh hơn
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn(`Gemini model ${model}: ${err.name === "AbortError" ? "hết giờ" : err.message}`);
    }
  }

  return null;
}

export async function sendMessage(message, history = []) {
  // Bước 1: Khớp kho kiến thức local trước (Tốc độ 0ms, 100% chuẩn xác, 0đ token)
  const result = findAnswer(message, knowledge, company);

  // Nếu khớp trúng intent cụ thể (Score > 0) -> dùng ngay câu trả lời local
  if (result.intentId !== "fallback") {
    await sleep(DO_TRE_MS); // câu local ra tức thì → nghỉ một nhịp cho tự nhiên
    // Chống lặp: khách trả lời câu hỏi ngược bằng đúng từ khóa của intent →
    // findAnswer trả về lại đúng intent cũ. Nếu câu này trùng y hệt câu bot
    // vừa nói ngay trước, đẩy hội thoại tiến lên thay vì lặp lại.
    const cauBotTruoc = [...history]
      .reverse()
      .find((h) => h.role === "assistant")?.content;
    const { response } = chongLap(result.answer, cauBotTruoc, company);
    return { response };
  }

  // Bước 2: Rơi vào fallback -> Thử gọi Gemini AI (nếu có cấu hình VITE_GEMINI_API_KEY)
  //         (đã giới hạn tổng thời gian, không để "khựng" chờ mãi)
  const aiAnswer = await callGeminiAI(message, history);
  if (aiAnswer) {
    return { response: aiAnswer };
  }

  // Nếu không có API Key hoặc Gemini bị lỗi -> Trả về câu fallback mặc định
  return { response: result.answer };
}
