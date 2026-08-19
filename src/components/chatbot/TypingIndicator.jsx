// TypingIndicator: 3 chấm nảy, hiện khi bot đang "chờ mạng" (isWaiting)
// — tương đương lúc ChatGPT hiện icon xoay trước khi chữ bắt đầu chạy ra.
//
// Nền và bo góc phải khớp đúng khối trả lời của bot trong MessageBubble
// (`bg-ink/5`, `rounded-card`), vì khối này chính là chỗ câu trả lời sắp hiện
// ra — lệch nền một chút là lúc chữ xuất hiện sẽ thấy giật.
export default function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-card bg-ink/5 px-4 py-3.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" />
      <span className="sr-only">Trợ lý đang soạn câu trả lời</span>
    </div>
  );
}
