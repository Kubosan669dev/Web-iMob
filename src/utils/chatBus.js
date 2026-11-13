// chatBus: cầu nối tối giản để MỞ khung chat từ bất kỳ đâu trong cây
// component (vd nút "Chat AI" ở Hero) mà không cần Redux/Context —
// chỉ 1 sự kiện DOM tuỳ biến, khung chat lắng nghe rồi tự mở.
//
// Từ 13/11/2026 có thể gửi kèm CÂU HỎI (ô "Hỏi ngay" ở trang Hỏi đáp AI):
// khung chat nền tảng (ChatbotNenTang.jsx) mở ra rồi tự gửi câu đó đi.
// Bot cũ (ChatWidget) bỏ qua câu hỏi, chỉ mở.

const OPEN_CHAT_EVENT = "imob:open-chat";

export function openChat(cauHoi = "") {
  window.dispatchEvent(
    new CustomEvent(OPEN_CHAT_EVENT, { detail: { cauHoi: String(cauHoi).trim() } }),
  );
}

export function onOpenChat(handler) {
  const nghe = (e) => handler(e.detail?.cauHoi ?? "");
  window.addEventListener(OPEN_CHAT_EVENT, nghe);
  return () => window.removeEventListener(OPEN_CHAT_EVENT, nghe);
}
