import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocation } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { onOpenChat } from "../../utils/chatBus.js";
import { useGiaoDien } from "../../context/NoiDungContext.jsx";
import { daTungDong, ghiDaDong } from "./chatDaDong.js";
import { TRANG_CHATBOT } from "./botNenTang.js";

// ============================================================
// POPUP GIỚI THIỆU TRỢ LÝ ẢO (02/10/2026) — dùng khi CHE_DO_BOT = "an".
//
// Kiểu popup quảng bá như Shopee: khách vào trang được vài giây thì hiện một
// thẻ giữa màn hình, bấm nút là sang trang chatbot riêng (chatbot.imob.vn).
//
// LUẬT:
//   • Thời gian chờ và bật/tắt: cùng cài đặt chat trong /admin → Giao diện
//     (tuMo, tre) — người quản trị tắt được mà không cần sửa mã.
//   • Khách đóng (✕, "Để sau", bấm ra ngoài, phím Esc) hoặc bấm sang trợ lý
//     thì cả phiên không tự hiện lại. Dùng chung "trí nhớ" với khung chat cũ
//     (chatDaDong.js).
//   • Nút "Chat với AI" trên website luôn mở popup, kể cả khi khách đã đóng —
//     lần đó là khách tự bấm.
//   • Không tự hiện ở /tro-ly-ao: trang đó đã là lời giới thiệu.
// ============================================================

export default function PopupTroLyAo() {
  const cai = useGiaoDien()?.chat ?? {};
  const tuMo = cai.tuMo !== false;
  const treMs = Math.max(0, Number(cai.tre ?? 3)) * 1000;
  const { pathname } = useLocation();
  const [mo, setMo] = useState(false);
  const nutChinh = useRef(null);
  const truocDo = useRef(null); // phần tử đang được chọn trước khi popup mở

  const hien = useCallback(() => {
    truocDo.current = document.activeElement;
    setMo(true);
  }, []);

  const dong = useCallback(() => {
    ghiDaDong();
    setMo(false);
    truocDo.current?.focus?.();
  }, []);

  useEffect(() => onOpenChat(hien), [hien]);

  /* ---------- Tự hiện sau vài giây ---------- */
  useEffect(() => {
    if (!tuMo || pathname === "/tro-ly-ao" || daTungDong()) return;
    const hen = setTimeout(() => {
      if (!daTungDong()) hien();
    }, treMs);
    return () => clearTimeout(hen);
  }, [tuMo, treMs, pathname, hien]);

  /* ---------- Khi đang mở: Esc để đóng, khoá cuộn trang, đưa con trỏ vào nút ---------- */
  useEffect(() => {
    if (!mo) return;
    const phim = (e) => {
      if (e.key === "Escape") dong();
    };
    window.addEventListener("keydown", phim);
    const cuCuon = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const hen = setTimeout(() => nutChinh.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", phim);
      document.body.style.overflow = cuCuon;
      clearTimeout(hen);
    };
  }, [mo, dong]);

  return (
    <AnimatePresence>
      {mo && (
        <motion.div
          key="nen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={dong}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/55 p-5 backdrop-blur-[2px]"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-tro-ly-tieu-de"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[25rem]"
          >
            {/* Nút đóng ở góc, nằm hẳn ra ngoài thẻ như popup Shopee */}
            <button
              type="button"
              onClick={dong}
              aria-label="Đóng"
              className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-panel text-ink shadow-lift transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tren-brand sm:-right-4 sm:-top-4"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="overflow-hidden rounded-block bg-panel shadow-lift">
              {/* ---- Phần hình ---- */}
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-brand via-brand-deep to-accent sm:h-56">
                <span className="absolute left-5 top-5 rounded-full bg-tren-brand px-3 py-1 text-xs font-semibold text-brand">
                  Mới · Miễn phí
                </span>
                {/* Hai bong bóng chat minh hoạ — không phải câu trả lời thật */}
                <div className="absolute inset-x-5 bottom-6 space-y-2.5" aria-hidden="true">
                  <p className="ml-auto w-fit max-w-[80%] rounded-card rounded-tr-md bg-tren-brand px-4 py-2.5 text-sm font-medium text-ink shadow-soft">
                    Đi Hạ Long 2 ngày nên chơi đâu?
                  </p>
                  <p className="w-fit max-w-[80%] rounded-card rounded-tl-md bg-tren-brand/20 px-4 py-2.5 text-sm text-tren-brand backdrop-blur-sm">
                    Mình gợi ý lịch trình theo từng buổi nhé…
                  </p>
                </div>
              </div>

              {/* ---- Phần chữ ---- */}
              <div className="px-6 pb-6 pt-5 text-center">
                <h2
                  id="popup-tro-ly-tieu-de"
                  className="text-balance text-[1.5rem] font-bold leading-tight text-ink"
                >
                  Trợ lý ảo <span className="whitespace-nowrap text-brand">du lịch Quảng Ninh</span>
                </h2>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                  Hỏi điểm đến, lịch trình, ăn uống — trả lời ngay, không cần đăng ký.
                </p>
                <a
                  ref={nutChinh}
                  href={TRANG_CHATBOT}
                  target="_blank"
                  rel="noopener"
                  onClick={dong}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[1.0625rem] font-semibold text-tren-brand shadow-brand transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Hỏi trợ lý ảo ngay
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={dong}
                  className="mt-2 w-full rounded-full py-2.5 text-sm text-ink-faint transition-colors hover:text-ink"
                >
                  Để sau
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
