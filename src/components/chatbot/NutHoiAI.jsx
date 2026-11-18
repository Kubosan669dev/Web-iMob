import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

// ============================================================
// Nút nổi góc phải dưới — thay cho khung chat popup (18/11/2026).
//
// Người dùng muốn bỏ popup, chỉ để một nút dẫn tới trang chat cả màn hình
// (/hoi-dap/...). Trang đó tự kiểm tra đăng nhập.
// ============================================================

export default function NutHoiAI() {
  return (
    <Link
      to="/hoi-dap/yen-tu"
      aria-label="Hỏi trợ lý AI"
      className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand py-3 pl-3.5 pr-5 text-sm font-semibold text-tren-brand shadow-[0_10px_30px_-8px_rgb(0_0_0/0.35)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand-deep sm:bottom-6 sm:right-6"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
        <MessageCircle className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
      </span>
      Hỏi trợ lý AI
    </Link>
  );
}
