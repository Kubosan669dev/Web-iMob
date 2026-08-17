import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { onOpenChat } from "../../utils/chatBus.js";

// TẢI TRỄ khung chat: ChatWindow kéo theo react-markdown (~150kB) nhưng
// khách chỉ cần khi thực sự bấm mở chat. lazy() tách nó thành file riêng,
// trình duyệt chỉ tải lúc mở lần đầu → trang chủ nhẹ hơn hẳn.
const ChatWindow = lazy(() => import("./ChatWindow.jsx"));

// Khung chờ trong lúc tải file ChatWindow (thường chỉ chớp mắt).
// Giữ đúng hình dạng panel để không bị "giật" bố cục khi nội dung hiện ra.
function ChatWindowSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-panel shadow-lift sm:rounded-block">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
      <span className="sr-only">Đang mở khung chat…</span>
    </div>
  );
}

// ChatWidget: nút nổi góc phải màn hình, xuất hiện trên MỌI trang
// (gắn ở Layout.jsx, không phải trong 1 section) — bấm để mở/đóng
// ChatWindow. Cũng lắng nghe sự kiện "mở từ xa" do nút Chat AI ở
// Hero phát ra (xem utils/chatBus.js).
export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => onOpenChat(() => setOpen(true)), []);

  // Khoá cuộn trang khi khung chat chiếm TRỌN màn hình điện thoại —
  // không khoá thì nền phía sau vẫn trôi theo ngón tay, rất rối.
  // Chỉ áp dụng dưới 640px (sm); ở desktop khung chat chỉ là panel nhỏ,
  // khoá cuộn cả trang sẽ gây khó chịu.
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 639px)").matches) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ---------- Nút nổi ---------- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng khung chat" : "Mở khung chat với AI"}
        // Khi ĐANG MỞ trên điện thoại: ẩn nút này đi.
        // Lý do: khung chat mở full màn hình, nút nổi (56px, cách mép 20px)
        // đè trúng nút Gửi của ô nhập (40px, cách mép 12px) — khách bấm Gửi
        // lại hoá ra bấm đóng chat. Đóng chat đã có dấu X trên header rồi.
        className={
          "fixed bottom-5 right-5 z-50 h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-brand transition-transform duration-300 hover:scale-110 hover:shadow-lift sm:bottom-6 sm:right-6 sm:flex " +
          (open ? "hidden sm:flex" : "flex")
        }
      >
        {/* Vòng pulse mời gọi — chỉ hiện khi đang ĐÓNG, tránh rối mắt lúc chat */}
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-40" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative flex"
          >
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* ---------- Khung chat ---------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            // Mobile: full màn hình. Từ sm trở lên: panel nổi góc phải, bo góc.
            className="fixed inset-0 z-40 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[75vh] sm:w-96"
          >
            <Suspense fallback={<ChatWindowSkeleton />}>
              <ChatWindow onClose={() => setOpen(false)} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
