import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Palette, RotateCcw, X } from "lucide-react";
import { BANG_MAU } from "../../data/bangMau.js";
import { useBangMau } from "../../context/BangMauContext.jsx";

// ============================================================
// Nút chọn bảng màu — góc dưới bên TRÁI trang chủ.
//
// Bên phải đã có nút chat (bottom-5 right-5), nên nút này phải sang trái, không
// thì hai nút chồng lên nhau trên điện thoại.
//
// ĐÂY LÀ CHỖ XEM THỬ, KHÔNG PHẢI CÔNG TẮC CHUNG. Lựa chọn ở đây chỉ nằm trong
// máy người bấm, khách khác vẫn thấy bảng màu chính thức bạn chốt trong /admin.
// Bảng nói rõ điều đó ngay trên giao diện, để không ai tưởng mình vừa đổi màu
// cả website.
// ============================================================

/** Mẫu màu hai nửa, giống viên thuốc trong bản tham chiếu. */
function Mau({ bang }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-6 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-line"
    >
      <span className="w-1/2" style={{ backgroundColor: bang.bien["--color-brand"] }} />
      <span className="w-1/2" style={{ backgroundColor: bang.bien["--color-brand-soft"] }} />
    </span>
  );
}

export default function ChonBangMau() {
  const { dangDung, chinhThuc, dangThu, chon, thoiThu } = useBangMau();
  const [mo, setMo] = useState(false);
  const bangRef = useRef(null);
  const nutRef = useRef(null);

  // Esc để đóng, và trả con trỏ về đúng cái nút vừa mở — người dùng bàn phím
  // không bị "rơi" về đầu trang sau khi đóng bảng.
  useEffect(() => {
    if (!mo) return;
    const phim = (e) => {
      if (e.key === "Escape") {
        setMo(false);
        nutRef.current?.focus();
      }
    };
    window.addEventListener("keydown", phim);
    return () => window.removeEventListener("keydown", phim);
  }, [mo]);

  useEffect(() => {
    if (mo) bangRef.current?.focus();
  }, [mo]);

  return (
    <>
      <button
        ref={nutRef}
        type="button"
        onClick={() => setMo((v) => !v)}
        aria-expanded={mo}
        aria-label="Đổi bảng màu để xem thử"
        title="Đổi bảng màu để xem thử"
        className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-panel text-ink-soft shadow-lift ring-1 ring-line transition-colors hover:text-brand sm:bottom-6 sm:left-6"
      >
        <Palette className="h-5 w-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {mo && (
          <>
            {/* Nền mờ: bấm ra ngoài là đóng. aria-hidden vì đã có nút X và Esc. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMo(false)}
              aria-hidden="true"
              className="fixed inset-0 z-[55] bg-ink/20 backdrop-blur-[2px]"
            />

            <motion.div
              ref={bangRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Bảng màu"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed bottom-20 left-4 right-4 z-[60] max-h-[70vh] overflow-y-auto rounded-block bg-panel p-5 shadow-lift outline-none ring-1 ring-line sm:bottom-24 sm:left-6 sm:right-auto sm:w-[30rem] sm:p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="tieu-de-lon text-lg text-ink">Bảng màu</h2>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-soft">
                    Chỉ đổi màu trên máy bạn để xem thử. Khách vẫn thấy bảng màu
                    chính thức.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMo(false)}
                  aria-label="Đóng bảng màu"
                  className="-mr-1 -mt-1 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-mist hover:text-ink"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {BANG_MAU.map((b) => {
                  const dangChon = b.khoa === dangDung;
                  return (
                    <button
                      key={b.khoa}
                      type="button"
                      onClick={() => chon(b.khoa)}
                      aria-pressed={dangChon}
                      className={
                        "flex items-center gap-3 rounded-card p-3 text-left transition-colors " +
                        (dangChon
                          ? "bg-brand-soft ring-1 ring-brand"
                          : "bg-mist hover:bg-line/60")
                      }
                    >
                      <Mau bang={b} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={
                            "block truncate text-sm font-medium " +
                            (dangChon ? "text-brand" : "text-ink")
                          }
                        >
                          {b.ten}
                        </span>
                        <span className="block truncate text-xs text-ink-soft">
                          {b.moTa}
                        </span>
                      </span>
                      {dangChon && (
                        <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {dangThu && (
                <button
                  type="button"
                  onClick={thoiThu}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-ink"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Về bảng màu chính thức
                  <span className="text-ink-faint">
                    ({BANG_MAU.find((b) => b.khoa === chinhThuc)?.ten})
                  </span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
