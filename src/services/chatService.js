import knowledge from "../data/kienThuc.json";
import company from "../data/company.json";
import { API_BASE_URL } from "../utils/constants.js";
import { findAnswer, chongLap } from "./chatBrain.js";

function buildGeminiSystemPrompt() {
  const serviceList = [
    "Zalo Mini App",
    "Website",
    "Phần mềm & Phần cứng IoT",
    "Chatbot AI",
    "Đào tạo Chuyển đổi số",
  ].join(", ");

  return `Bạn là trợ lý ảo AI của công ty ${company.fullName}.
Bạn chỉ hỗ trợ thông tin về **dịch vụ công nghệ** của iMob.

Thông tin quan trọng:
- Hotline / Zalo: ${company.phone}
- Email: ${company.email}
- Địa chỉ: ${company.address}
- Giờ làm việc: ${company.workingHours}
- Dịch vụ chính: ${serviceList}

Quy tắc khi trả lời:
- Chỉ dùng tiếng Việt.
- Trả lời khách hàng một cách lịch sự, rõ ràng và ngắn gọn.
- Nếu câu hỏi không liên quan đến dịch vụ iMob, trả lời: "Xin lỗi bạn, phần này ngoài phạm vi hỗ trợ của mình. Mình chỉ tư vấn về dịch vụ, báo giá và liên hệ của iMob."
- Tuyệt đối KHÔNG bịa giá, KHÔNG bịa thời gian, KHÔNG nêu mốc cụ thể.
- Nếu khách hỏi giá hoặc quy trình chi tiết, mời khách liên hệ hotline ${company.phone} hoặc email ${company.email} để được tư vấn miễn phí.
- Nếu cần, nhắc khách để lại số điện thoại để iMob liên hệ.

Thông tin dưới đây là phần tóm tắt kho kiến thức của iMob. Hãy trả lời dựa trên các nội dung này, ưu tiên thông tin chính xác nhất:
${knowledge.fallback}
`;
}

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
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "true";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Lấy Gemini API Key từ biến môi trường (nếu có)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

async function callBackendChat(message, history = []) {
  if (!API_BASE_URL) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.response || null;
  } catch (err) {
    console.warn("Backend chat lỗi:", err.message);
    return null;
  }
}

/**
 * Gọi Google Gemini API (0đ Free Tier) với danh sách mô hình dự phòng
 */
async function callGeminiAI(message, history = []) {
  if (!GEMINI_API_KEY) return null;

  const systemContext = buildGeminiSystemPrompt();

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
            // Câu lệnh dẫn (system prompt) để ở TRƯỜNG RIÊNG systemInstruction.
            // Gemini KHÔNG nhận role "system"/"assistant" trong contents — chỉ
            // "user"/"model". Để sai (như trước) là dính HTTP 400 mỗi lần gọi,
            // khiến tầng AI âm thầm chết và luôn rơi về câu fallback local.
            systemInstruction: { parts: [{ text: systemContext }] },
            contents: [
              ...formattedHistory,
              { role: "user", parts: [{ text: message }] },
            ],
            generationConfig: {
              temperature: 0.2,
              topP: 0.95,
              maxOutputTokens: 300,
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

  if (USE_BACKEND) {
    const backendAnswer = await callBackendChat(message, history);
    if (backendAnswer) {
      return { response: backendAnswer };
    }
  }

  // Bước 2: Rơi vào fallback -> Thử gọi Gemini AI (nếu có cấu hình VITE_GEMINI_API_KEY)
  //         (đã giới hạn tổng thời gian, không để "khựng" chờ mãi)
  const aiAnswer = await callGeminiAI(message, history);
  if (aiAnswer) {
    return { response: aiAnswer };
  }

  // Nếu không có API Key hoặc Gemini bị lỗi -> trả về câu fallback mặc định
  return { response: result.answer };
}
