import knowledge from "../data/chatKnowledge.json";
import { findAnswer } from "./chatBrain.js";
import { API_BASE_URL } from "../utils/constants.js";

// ============================================================
// chatService: "tổng đài" — nơi DUY NHẤT giao diện gọi để lấy câu trả lời.
//
// Có 2 tầng, tự động chuyển:
//   1. AI THẬT  — gọi backend Python (FastAPI + Ollama chạy local).
//                 Hiểu được cả câu hỏi lạ chưa soạn trước.
//   2. DỰ PHÒNG — nếu backend chưa bật/lỗi mạng: dùng bot khớp từ khóa
//                 chạy ngay trong trình duyệt (chatBrain.js).
//                 Nhờ vậy website KHÔNG BAO GIỜ "chết chat".
//
// Chữ ký cố định (hợp đồng giữa UI và bộ não):
//   sendMessage(message, history) → Promise<{ response: string }>
// ============================================================

// Chờ tối đa 60s: model chạy trên GPU nhà nên câu đầu tiên có thể chậm
// (phải nạp model vào VRAM).
const TIMEOUT_MS = 60000;

export async function sendMessage(message, history = []) {
  try {
    // AbortController = cách hủy request khi chờ quá lâu
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) throw new Error(`Backend trả về lỗi ${res.status}`);

    const data = await res.json();
    return { response: data.response };
  } catch (err) {
    // Backend chưa chạy → quay về bot dự phòng, website vẫn chat được
    console.warn("[chatService] Không gọi được AI, dùng bot dự phòng:", err.message);
    const { answer } = findAnswer(message, knowledge);
    return { response: answer };
  }
}
