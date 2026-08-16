import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { sendMessage } from "../services/chatService.js";
import { useCongTy } from "../context/NoiDungContext.jsx";

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

function createMessage(role, text, done = true) {
  return { id: nextId++, role, text, done }; // done: đã gõ xong chưa?
}

const GREETING = createMessage(
  "bot",
  "Xin chào! 👋 Mình là trợ lý ảo của iMob. Bạn cần hỏi gì cứ nhắn nhé!"
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// "Gõ" fullText vào đúng tin nhắn có id tương ứng, tự động điều chỉnh tốc độ
// theo độ dài văn bản để không bị giật lag khung hình khi trả lời dài.
//
// QUAN TRỌNG: Trong lúc gõ, message.done = false → MessageBubble chỉ hiện
// text THÔ (không qua ReactMarkdown). Khi gõ xong, set done = true →
// ReactMarkdown render DUY NHẤT 1 LẦN. Đây là thủ thuật triệt tiêu lag.
async function typeOutMessage(id, fullText, setMessages) {
  const len = fullText.length;
  const CHARS_PER_TICK = len > 500 ? 12 : len > 200 ? 8 : 4;
  const TICK_MS = 20;

  for (let i = 0; i <= len; i += CHARS_PER_TICK) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: fullText.slice(0, i) } : m))
    );
    await sleep(TICK_MS);
  }
  // Gõ xong → hiện đủ 100% text VÀ bật done=true để chuyển sang Markdown
  setMessages((prev) =>
    prev.map((m) => (m.id === id ? { ...m, text: fullText, done: true } : m))
  );
}

export default function useChat() {
  const congTy = useCongTy();

  // Người dùng bật "giảm chuyển động" thì hiện nguyên câu ngay, không gõ dần.
  // Hiệu ứng này chạy bằng JavaScript nên MotionConfig/CSS không với tới được,
  // phải tự kiểm tra ở đây.
  const reduceMotion = useReducedMotion();
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

      // Truyền congTy để bot dùng SĐT/email/địa chỉ MỚI NHẤT (sửa ở /admin),
      // chứ không phải bản đóng gói lúc build.
      const { response } = await sendMessage(trimmed, history, congTy);
      setIsWaiting(false); // hết chờ mạng → chuyển sang hiện chữ dần

      if (reduceMotion) {
        setMessages((prev) => [...prev, createMessage("bot", response)]);
      } else {
        const botMessage = createMessage("bot", "", false); // done=false → hiện text thô lúc gõ
        setMessages((prev) => [...prev, botMessage]);
        await typeOutMessage(botMessage.id, response, setMessages);
      }
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

  function clearChat() {
    setMessages([createMessage("bot", "Xin chào! 👋 Mình là trợ lý ảo của iMob. Bạn cần hỏi gì cứ nhắn nhé!")]);
    setError(null);
  }

  return { messages, isTyping, isWaiting, error, send, clearChat };
}
