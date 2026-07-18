import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

// MessageBubble: 1 dòng chat — bot bên trái (avatar Bot, nền kính mờ,
// render markdown), user bên phải (avatar người, nền gradient đặc).
// Tin của user luôn là text người tự gõ nên hiển thị THÔ (không qua
// markdown) — vừa an toàn vừa đúng ý người gõ (không lo lỡ tay gõ
// ký tự * _ # làm lệch định dạng).
export default function MessageBubble({ role, text }) {
  const isBot = role === "bot";

  return (
    <div className={`flex items-end gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
          (isBot
            ? "bg-gradient-to-br from-purple-500 to-blue-500"
            : "bg-white/10")
        }
      >
        {isBot ? (
          <Bot className="h-4 w-4 text-white" aria-hidden="true" />
        ) : (
          <User className="h-4 w-4 text-gray-300" aria-hidden="true" />
        )}
      </div>

      <div
        className={
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed " +
          (isBot
            ? "rounded-bl-sm bg-white/[0.06] text-gray-200"
            : "rounded-br-sm bg-gradient-to-br from-purple-500 to-blue-500 text-white")
        }
      >
        {isBot ? (
          <div className="chat-markdown">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
}
