import { useEffect, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import useChat from "../../hooks/useChat.js";
import Logo from "../ui/Logo.jsx";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ChatInput from "./ChatInput.jsx";
import ChatIntro from "./ChatIntro.jsx";
import GoiY from "./GoiY.jsx";

// ChatWindow: toàn bộ nội dung khung chat — tiêu đề, màn hình mở đầu hoặc danh
// sách tin nhắn (tự cuộn xuống cuối mỗi khi có gì mới), bảng gợi ý gọi ra được
// bất cứ lúc nào, và ô nhập liệu.
export default function ChatWindow({ onClose }) {
  const { messages, isTyping, isWaiting, send, clearChat } = useChat();
  const bottomRef = useRef(null);

  // Đã cuộn khỏi đỉnh chưa — dùng để hiện/ẩn đường kẻ dưới tiêu đề.
  const [daCuon, setDaCuon] = useState(false);
  const [hienGoiY, setHienGoiY] = useState(false);

  // Chỉ có đúng lời chào, khách chưa hỏi gì. Cũng là trạng thái sau khi bấm
  // "làm mới hội thoại".
  const batDau = messages.length === 1;

  // Tự cuộn xuống cuối mỗi khi có tin mới hoặc trong lúc gõ chữ.
  // Dùng behavior: "auto" / "instant" trong lúc chữ đang chạy để tránh đơ luồng smooth-scroll của trình duyệt.
  //
  // TRỪ màn hình mở đầu: ở đó phần đáng đọc nhất (logo + câu hỏi lớn) nằm trên
  // cùng, cuộn xuống đáy là đẩy nó ra khỏi tầm mắt ngay giây đầu tiên — mà
  // trên máy tính khung chat lại TỰ MỞ, nên khách sẽ thấy một màn hình đã bị
  // cuộn sẵn mà không hiểu vì sao.
  useEffect(() => {
    if (batDau) return;
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: isTyping ? "auto" : "smooth" });
    }
  }, [messages, isWaiting, isTyping, batDau]);

  // Dòng chữ dưới tên: nói đúng việc đang xảy ra, thay cho chấm tròn "Đang
  // hoạt động" của bản trước. Chấm đó luôn sáng dù bot có bận hay không, tức
  // là không mang thông tin gì. Lúc rảnh thì dòng này làm việc khác: kể ra
  // đúng ba thứ bot trả lời tốt nhất, để khách biết hỏi gì.
  //
  // Cố ý KHÔNG hứa "trả lời ngay": câu nào bộ não trong máy không khớp thì
  // rơi xuống bot Python trên Render, mà máy chủ đó ngủ sau 15 phút không ai
  // dùng và mất 30–50 giây để dậy.
  const trangThai = isWaiting
    ? "Đang tìm câu trả lời…"
    : isTyping
      ? "Đang trả lời…"
      : "Sản phẩm · Báo giá · An ninh mạng";

  function chonGoiY(cau) {
    setHienGoiY(false);
    send(cau);
  }

  function lamMoi() {
    setHienGoiY(false);
    // Nội dung ngắn lại về đúng một màn hình nên trình duyệt tự đưa scrollTop
    // về 0 mà KHÔNG bắn sự kiện scroll — không tự đặt lại thì đường kẻ dưới
    // tiêu đề kẹt lại vĩnh viễn trên màn hình mở đầu.
    setDaCuon(false);
    clearChat();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-panel shadow-lift sm:rounded-block">
      {/* ---------- Tiêu đề ----------
          Đường kẻ chỉ hiện khi nội dung đã cuộn khỏi đỉnh: lúc mới mở, màn
          hình mở đầu liền một mạch từ logo trên tiêu đề xuống logo lớn bên
          dưới, không bị một vạch cắt ngang. Giữ `border-transparent` thay vì
          bỏ hẳn border để chiều cao không đổi khi kẻ xuất hiện. */}
      <header
        className={
          "flex shrink-0 items-center gap-3 border-b px-4 py-3 transition-colors " +
          (daCuon ? "border-line" : "border-transparent")
        }
      >
        <Logo className="h-9 w-9" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold tracking-tight text-ink">Trợ lý AI iMob</p>
          <p className="truncate text-[11px] text-ink-soft">{trangThai}</p>
        </div>

        {/* Chưa hỏi gì thì không có gì để xoá — ẩn nút đi cho tiêu đề gọn. */}
        {!batDau && (
          <button
            type="button"
            onClick={lamMoi}
            disabled={isTyping}
            title="Làm mới hội thoại"
            aria-label="Xóa lịch sử trò chuyện"
            className="rounded-[0.7rem] p-1.5 text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-40"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng khung chat"
          className="rounded-[0.7rem] p-1.5 text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* ---------- Nội dung ---------- */}
      <div
        onScroll={(e) => setDaCuon(e.currentTarget.scrollTop > 4)}
        className="flex-1 overflow-y-auto px-4 pb-4 pt-3"
      >
        {batDau ? (
          <ChatIntro onSelect={chonGoiY} disabled={isTyping} />
        ) : (
          <div className="space-y-5">
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} text={m.text} done={m.done} />
            ))}
            {isWaiting && <TypingIndicator />}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ---------- Gợi ý + ô nhập ----------
          Một đường kẻ duy nhất bao cả hai. Bảng gợi ý mở ra thì nằm gọn bên
          trong, không sinh thêm vạch ngăn thứ hai. */}
      <div className="shrink-0 border-t border-line">
        {hienGoiY && !batDau && (
          <div className="px-3 pt-3">
            <GoiY gon onSelect={chonGoiY} disabled={isTyping} />
          </div>
        )}

        <ChatInput
          onSend={send}
          disabled={isTyping}
          // Màn hình mở đầu đã bày sẵn cả sáu gợi ý ở dạng đầy đủ — thêm nút
          // mở lại đúng danh sách đó ngay bên dưới là thừa.
          onToggleGoiY={batDau ? undefined : () => setHienGoiY((v) => !v)}
          goiYMo={hienGoiY}
        />
      </div>
    </div>
  );
}
