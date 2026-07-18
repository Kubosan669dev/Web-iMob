// chatBus: cầu nối tối giản để MỞ ChatWidget từ bất kỳ đâu trong cây
// component (vd nút "Chat AI" ở Hero) mà không cần Redux/Context —
// chỉ 1 sự kiện DOM tuỳ biến, ChatWidget lắng nghe rồi tự mở panel.
const OPEN_CHAT_EVENT = "imob:open-chat";

export function openChat() {
  window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
}

export function onOpenChat(handler) {
  window.addEventListener(OPEN_CHAT_EVENT, handler);
  return () => window.removeEventListener(OPEN_CHAT_EVENT, handler);
}
