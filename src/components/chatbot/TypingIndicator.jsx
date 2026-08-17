// TypingIndicator: 3 chấm nảy, hiện khi bot đang "chờ mạng" (isWaiting)
// — tương đương lúc ChatGPT hiện icon xoay trước khi chữ bắt đầu chạy ra.
export default function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm bg-mist px-4 py-3">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" />
    </div>
  );
}
