import { Link, useLocation } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";

// ============================================================
// Ô thay cho khung chat khi CHƯA đăng nhập (18/11/2026, yêu cầu người dùng:
// "phải đăng nhập để sử dụng chatbot").
//
// Cùng kích thước với KhungChatCaTrang để trang không nhảy bố cục khi đăng
// nhập xong. Hai nút mang theo ?tiep= là địa chỉ hiện tại (kể cả ?hoi=câu hỏi),
// đăng nhập xong quay về đúng chỗ, câu hỏi được gửi luôn.
//
// ⚠️ Đây là chặn ở GIAO DIỆN: khung chat là của nền tảng chatbot.imob.vn, khoá
// bot nằm công khai trong mã trang. Muốn chặn thật phải làm phía nền tảng.
// ============================================================

export default function CanDangNhap() {
  const { pathname, search } = useLocation();
  const tiep = encodeURIComponent(pathname + search);

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[30rem] flex-col items-center justify-center rounded-2xl border border-line bg-panel px-6 text-center shadow-soft lg:h-[min(48rem,calc(100dvh-7rem))]">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-mist text-brand">
        <LockKeyhole className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-6 max-w-sm font-display text-2xl font-semibold leading-snug text-brand-deep sm:text-[1.75rem]">
        Bạn phải đăng nhập để trải nghiệm tính năng này
      </h2>
      <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-ink-soft">
        Trợ lý AI dành cho người có tài khoản iMob. Chưa có tài khoản thì đăng ký miễn phí, chưa tới một phút.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          to={`/dang-nhap?tiep=${tiep}`}
          className="group flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-semibold text-tren-brand transition-colors hover:bg-brand-deep"
        >
          Đăng nhập
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
        <Link
          to={`/dang-ky?tiep=${tiep}`}
          className="rounded-xl border border-line px-5 py-3.5 font-semibold text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
        >
          Tạo tài khoản mới
        </Link>
      </div>
    </div>
  );
}
