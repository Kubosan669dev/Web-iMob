import { useRef, useState } from "react";
import { Lightbulb, Send } from "lucide-react";

// ============================================================
// Ô NHẬP
//
// Bản trước là ba hình rời nhau: đường kẻ ngang, ô textarea có viền, nút gửi
// vuông riêng — ba đường viền chồng lên nhau trong một khoảng cao 60px. Giờ
// gộp lại thành MỘT khối bo tròn: nút gợi ý, ô gõ và nút gửi nằm chung trong
// đó. Ít hình, ít viền — đúng ngôn ngữ của cả trang.
//
// Viền sáng khi gõ đặt ở KHỐI BAO (`focus-within`), không đặt ở textarea. Nhờ
// vậy textarea tự tắt được outline mặc định mà người dùng bàn phím vẫn thấy rõ
// mình đang ở đâu.
//
// Đệm dưới dùng env(safe-area-inset-bottom): trên iPhone khung chat mở tràn
// màn hình, không có đệm này thì nút Gửi nằm ngay dưới thanh Home, bấm rất dễ
// trượt thành vuốt thoát ứng dụng. Trên máy tính giá trị đó bằng 0 nên
// max() giữ nguyên 0.75rem.
// ============================================================
export default function ChatInput({ onSend, disabled, onToggleGoiY, goiYMo }) {
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
    <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-end gap-1.5 rounded-card bg-ink/5 p-1.5 transition-shadow focus-within:ring-2 focus-within:ring-brand/35">
        {onToggleGoiY && (
          <button
            type="button"
            onClick={onToggleGoiY}
            aria-pressed={goiYMo}
            aria-label="Gợi ý câu hỏi"
            title="Gợi ý câu hỏi"
            className={
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] transition-colors " +
              (goiYMo ? "bg-brand-soft text-brand" : "text-ink-faint hover:text-brand")
            }
          >
            <Lightbulb className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        )}

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Nhập câu hỏi của bạn…"
          className="max-h-[120px] flex-1 resize-none bg-transparent px-2 py-2 text-[14px] leading-[1.45] text-ink outline-none placeholder:text-ink-faint disabled:opacity-50"
        />

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Gửi tin nhắn"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] bg-brand text-tren-brand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
