import { useState } from "react";
import { sendMessage } from "../services/chatService.js";

// ============================================================
// useChat: "bộ nhớ hội thoại" của chatbot.
// Giống hệt list `lich_su` trong bot Kubo (mỗi tin nhắn append vào
// mảng) — chỉ khác: đây là useState nên MỖI LẦN mảng đổi, React tự
// vẽ lại UI ngay (Python print() không tự "vẽ lại" màn hình được).
//
// Một lượt trả lời có 2 GIAI ĐOẠN, y hệt ChatGPT:
//   1. isWaiting = true  → hiện 3 chấm nhảy (đang chờ "tổng đài" trả lời)
//   2. isWaiting = false → bắt đầu HIỆN CHỮ DẦN (typeOutMessage bên dưới)
//   isTyping = true suốt CẢ 2 giai đoạn, dùng để khoá ô nhập liệu.
// ============================================================

let nextId = 1; // id tăng dần để React phân biệt từng bong bóng chat

function createMessage(role, text) {
  return { id: nextId++, role, text }; // role: "bot" | "user"
}

const GREETING = createMessage(
  "bot",
  "Xin chào! 👋 Mình là trợ lý ảo của iMob. Bạn cần hỏi gì cứ nhắn nhé!"
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// "Gõ" fullText vào đúng tin nhắn có id tương ứng, vài ký tự mỗi nhịp —
// mỗi lần setMessages là một lần React vẽ lại → tạo hiệu ứng chữ chạy ra.
async function typeOutMessage(id, fullText, setMessages) {
  const CHARS_PER_TICK = 2;
  const TICK_MS = 16;

  for (let i = 0; i <= fullText.length; i += CHARS_PER_TICK) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: fullText.slice(0, i) } : m))
    );
    await sleep(TICK_MS);
  }
  // đảm bảo hiện đủ 100% (vòng lặp có thể dừng hụt vài ký tự cuối)
  setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: fullText } : m)));
}

export default function useChat() {
  const [messages, setMessages] = useState([GREETING]);
  const [isWaiting, setIsWaiting] = useState(false); // giai đoạn 1: 3 chấm
  const [isTyping, setIsTyping] = useState(false); // bận suốt 2 giai đoạn
  const [error, setError] = useState(null);

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return; // không gửi tin rỗng / khi đang bận

    setMessages((prev) => [...prev, createMessage("user", trimmed)]);
    setIsTyping(true);
    setIsWaiting(true);
    setError(null);

    try {
      // Gửi kèm LỊCH SỬ hội thoại để AI hiểu câu hỏi nối tiếp
      // (vd: "cái đó làm mất bao lâu?" — "cái đó" ám chỉ câu trước).
      // Đổi tên vai trò "bot" → "assistant" cho đúng chuẩn của AI.
      const history = messages.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      }));

      const { response } = await sendMessage(trimmed, history);
      setIsWaiting(false); // hết chờ mạng → chuyển sang hiện chữ dần

      const botMessage = createMessage("bot", "");
      setMessages((prev) => [...prev, botMessage]);
      await typeOutMessage(botMessage.id, response, setMessages);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        createMessage("bot", "Xin lỗi, mình đang gặp sự cố kết nối 😥"),
      ]);
    } finally {
      setIsWaiting(false);
      setIsTyping(false);
    }
  }

  return { messages, isTyping, isWaiting, error, send };
}
