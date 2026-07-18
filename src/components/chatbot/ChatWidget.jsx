import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import ChatWindow from "./ChatWindow.jsx";
import { onOpenChat } from "../../utils/chatBus.js";

// ChatWidget: nút nổi góc phải màn hình, xuất hiện trên MỌI trang
// (gắn ở Layout.jsx, không phải trong 1 section) — bấm để mở/đóng
// ChatWindow. Cũng lắng nghe sự kiện "mở từ xa" do nút Chat AI ở
// Hero phát ra (xem utils/chatBus.js).
export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => onOpenChat(() => setOpen(true)), []);

  return (
    <>
      {/* ---------- Nút nổi ---------- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng khung chat" : "Mở khung chat với AI"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-900/40 transition-transform duration-300 hover:scale-110 hover:shadow-glow-purple sm:bottom-6 sm:right-6"
      >
        {/* Vòng pulse mời gọi — chỉ hiện khi đang ĐÓNG, tránh rối mắt lúc chat */}
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-purple-500 opacity-40" />
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
            <ChatWindow onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
