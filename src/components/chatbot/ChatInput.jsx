import { useRef, useState } from "react";
import { Send } from "lucide-react";

// ChatInput: textarea tự giãn theo số dòng, Enter gửi (Shift+Enter xuống
// dòng — quy ước giống mọi app chat), khoá lại khi bot đang bận trả lời.
export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  function resize(el) {
    el.style.height = "auto"; // reset trước để đo lại chiều cao thật
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`; // tối đa ~5 dòng
  }

  function handleChange(e) {
    setValue(e.target.value);
    resize(e.target);
  }

  function submit() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
    if (textareaRef.current) resize(textareaRef.current); // co lại về 1 dòng
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // chặn xuống dòng mặc định của textarea
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-line p-3">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Nhập câu hỏi của bạn..."
        className="max-h-[120px] flex-1 resize-none rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors focus:border-brand disabled:opacity-50"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Gửi tin nhắn"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-all duration-300 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
