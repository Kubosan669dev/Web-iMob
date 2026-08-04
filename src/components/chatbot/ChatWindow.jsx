import { useEffect, useRef } from "react";
import { Bot, RotateCcw, X } from "lucide-react";
import useChat from "../../hooks/useChat.js";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ChatInput from "./ChatInput.jsx";
import QuickChips from "./QuickChips.jsx";

// ChatWindow: toàn bộ nội dung khung chat — header, danh sách tin nhắn
// (tự cuộn xuống cuối mỗi khi có gì mới), gợi ý câu hỏi nhanh, và ô nhập liệu.
export default function ChatWindow({ onClose }) {
  const { messages, isTyping, isWaiting, send, clearChat } = useChat();
  const bottomRef = useRef(null);

  // Tự cuộn xuống cuối mỗi khi có tin mới hoặc trong lúc gõ chữ.
  // Dùng behavior: "auto" / "instant" trong lúc chữ đang chạy để tránh đơ luồng smooth-scroll của trình duyệt.
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: isTyping ? "auto" : "smooth" });
    }
  }, [messages, isWaiting, isTyping]);

  return (
    <div className="glass flex h-full flex-col overflow-hidden shadow-2xl shadow-black/50 sm:rounded-2xl">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
            <Bot className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">iMob Assistant</p>
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Đang hoạt động
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearChat}
            disabled={isTyping}
            title="Làm mới hội thoại"
            aria-label="Xóa lịch sử trò chuyện"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng khung chat"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ---------- Danh sách tin nhắn ---------- */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} text={m.text} done={m.done} />
        ))}
        {messages.length === 1 && (
          <QuickChips onSelect={send} disabled={isTyping} />
        )}
        {isWaiting && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ---------- Ô nhập liệu ---------- */}
      <ChatInput onSend={send} disabled={isTyping} />
    </div>
  );
}
