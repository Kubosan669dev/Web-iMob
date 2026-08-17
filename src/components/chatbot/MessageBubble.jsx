import { lazy, Suspense, memo } from "react";
import { Bot, User } from "lucide-react";

// react-markdown nặng (~150kB) mà chỉ tin nhắn của BOT mới cần.
// lazy() đẩy nó ra file riêng, trình duyệt chỉ tải khi thật sự có bong bóng
// bot xuất hiện → trang chủ nhẹ đi đáng kể.
const ReactMarkdown = lazy(() => import("react-markdown"));

// done = true  → tin nhắn đã gõ xong, render Markdown đầy đủ
// done = false → đang gõ chữ ra dần, hiện TEXT THÔ để tránh lag
//                (ReactMarkdown parse liên tục mỗi nhịp 20ms → nghẹt UI)
function MessageBubble({ role, text, done = true, plain = false }) {
  const isBot = role === "bot";
  // Chỉ dùng Markdown cho tin bot ĐÃ GÕ XONG và không phải plain mode
  const dungMarkdown = isBot && done && !plain;

  return (
    <div className={`flex items-end gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
          (isBot ? "bg-brand" : "bg-mist")
        }
      >
        {isBot ? (
          <Bot className="h-4 w-4 text-white" aria-hidden="true" />
        ) : (
          <User className="h-4 w-4 text-ink-soft" aria-hidden="true" />
        )}
      </div>

      <div
        className={
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap " +
          (isBot
            ? "rounded-bl-sm bg-mist text-ink"
            : "rounded-br-sm bg-brand text-white")
        }
      >
        {dungMarkdown ? (
          <div className="chat-markdown">
            <Suspense fallback={text}>
              <ReactMarkdown>{text}</ReactMarkdown>
            </Suspense>
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);

