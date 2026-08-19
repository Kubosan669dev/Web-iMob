import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { onOpenChat } from "../../utils/chatBus.js";
import { useGiaoDien } from "../../context/NoiDungContext.jsx";

// TẢI TRỄ khung chat: ChatWindow kéo theo react-markdown (~150kB) nhưng
// khách chỉ cần khi thực sự bấm mở chat. lazy() tách nó thành file riêng,
// trình duyệt chỉ tải lúc mở lần đầu → trang chủ nhẹ hơn hẳn.
const ChatWindow = lazy(() => import("./ChatWindow.jsx"));

// ============================================================
// TỰ CHÀO KHÁCH KHI VỪA VÀO TRANG
//
// Chatbot là sản phẩm iMob bỏ nhiều công nhất, nên nó không nên nằm im như một
// nút hỗ trợ mờ nhạt ở góc màn hình — khách phải gặp nó ngay.
//
// Nhưng "mở sẵn" KHÔNG được làm giống nhau ở hai cỡ màn hình:
//
//   • Máy tính: khung chat chỉ là panel rộng 384px bên phải, mở sẵn vẫn còn
//     nhìn thấy gần hết trang → mở thẳng.
//   • Điện thoại: khung chat chiếm TRỌN màn hình. Tự mở là che sạch website
//     ngay giây đầu tiên, khách chưa kịp thấy gì đã phải đi tìm nút đóng —
//     đúng kiểu quảng cáo chen ngang mà ai cũng bực. Thay bằng một lời chào
//     nhỏ cạnh nút: vẫn mời, mà không chặn đường.
//
// ĐÓNG RỒI THÌ THÔI. Khách tự tay đóng tức là đã trả lời "chưa cần"; chào lại
// ở trang sau nữa là phiền. Ghi nhớ trong sessionStorage — hết phiên duyệt web
// là quên, hôm sau khách quay lại vẫn được chào như thường.
// ============================================================
const KHOA_DA_DONG = "imob_chat_da_dong";

function daTungDong() {
  try {
    return sessionStorage.getItem(KHOA_DA_DONG) === "1";
  } catch {
    return false; // chế độ riêng tư chặn storage — coi như chưa đóng lần nào
  }
}

function ghiDaDong() {
  try {
    sessionStorage.setItem(KHOA_DA_DONG, "1");
  } catch {
    /* không ghi được cũng không sao, chỉ mất trí nhớ giữa các trang */
  }
}

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

/** Lời chào cạnh nút — bản dành cho điện thoại của việc "mở sẵn".
    Cả thẻ bấm được để mở chat; dấu X ở góc là bỏ qua. X đặt NGOÀI nút lớn
    (absolute) chứ không lồng vào trong: nút trong nút là HTML sai và trình đọc
    màn hình đọc ra lộn xộn. */
function LoiChao({ chu, mo, bo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="fixed bottom-24 right-5 z-40 w-64 rounded-card bg-panel p-4 shadow-lift sm:bottom-[6.5rem] sm:right-6"
    >
      <button
        type="button"
        onClick={bo}
        aria-label="Bỏ qua lời chào"
        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-mist text-ink-soft shadow-lift transition-colors hover:text-ink"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <button type="button" onClick={mo} className="block w-full text-left">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          Trợ lý AI iMob
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-ink">{chu}</span>
      </button>
    </motion.div>
  );
}

// ChatWidget: nút nổi góc phải màn hình, xuất hiện trên MỌI trang
// (gắn ở Layout.jsx, không phải trong 1 section) — bấm để mở/đóng
// ChatWindow. Cũng lắng nghe sự kiện "mở từ xa" do nút Chat AI ở
// Hero phát ra (xem utils/chatBus.js).
export default function ChatWidget() {
  // Cài đặt sửa được trong /admin → Giao diện. Bật hay tắt lời chào là quyết
  // định kinh doanh chứ không phải chuyện kỹ thuật, nên để người quản trị tự
  // chỉnh — khỏi phải sửa mã rồi deploy lại mỗi lần đổi ý.
  const cai = useGiaoDien()?.chat ?? {};
  const tuMo = cai.tuMo !== false; // thiếu khoá (database seed từ trước) -> coi như bật
  const treMs = Math.max(0, Number(cai.tre ?? 3)) * 1000;
  const loiChao = (cai.loiChao ?? "").trim();

  const [open, setOpen] = useState(false);
  const [chao, setChao] = useState(false);

  // Khách đã tự tay đóng chưa. Dùng ref chứ không dùng state: hẹn giờ đọc giá
  // trị này lúc nó chạy, mà state nhìn từ trong closure của setTimeout luôn là
  // giá trị CŨ ở thời điểm đặt hẹn.
  const daDongRef = useRef(false);
  const daChaoRef = useRef(false);

  const mo = useCallback(() => {
    setChao(false);
    setOpen(true);
  }, []);

  const dong = useCallback(() => {
    daDongRef.current = true;
    ghiDaDong();
    setOpen(false);
    setChao(false);
  }, []);

  useEffect(() => onOpenChat(mo), [mo]);

  /* ---------- Hẹn giờ tự chào ---------- */
  useEffect(() => {
    if (!tuMo || daChaoRef.current || daDongRef.current || daTungDong()) return;

    let huy = false;
    const hen = setTimeout(() => {
      if (huy || daDongRef.current) return;
      daChaoRef.current = true;

      if (!window.matchMedia("(min-width: 640px)").matches) {
        if (loiChao) setChao(true); // điện thoại: chỉ chào, không mở
        return;
      }

      // Máy tính: nạp xong file ChatWindow rồi mới mở. Mở trước thì khách nhìn
      // thấy một vòng xoay chờ tải — ấn tượng đầu tiên tệ hơn hẳn so với chờ
      // thêm vài trăm mili giây để hiện ra một khung chat đã đầy đủ.
      import("./ChatWindow.jsx")
        .catch(() => {})
        .then(() => {
          if (!huy && !daDongRef.current) setOpen(true);
        });
    }, treMs);

    return () => {
      huy = true;
      clearTimeout(hen);
    };
    // Cài đặt từ database về muộn hơn lần vẽ đầu -> hẹn giờ đặt lại theo giá
    // trị mới. Tắt trong /admin thì hàm dọn dẹp huỷ luôn lần hẹn đang chờ.
  }, [tuMo, treMs, loiChao]);

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
      {/* ---------- Lời chào (điện thoại) ---------- */}
      <AnimatePresence>
        {chao && !open && <LoiChao chu={loiChao} mo={mo} bo={dong} />}
      </AnimatePresence>

      {/* ---------- Nút nổi ---------- */}
      <button
        type="button"
        onClick={() => (open ? dong() : mo())}
        aria-label={open ? "Đóng khung chat" : "Mở khung chat với AI"}
        // Khi ĐANG MỞ trên điện thoại: ẩn nút này đi.
        // Lý do: khung chat mở full màn hình, nút nổi (56px, cách mép 20px)
        // đè trúng nút Gửi của ô nhập (40px, cách mép 12px) — khách bấm Gửi
        // lại hoá ra bấm đóng chat. Đóng chat đã có dấu X trên header rồi.
        className={
          "fixed bottom-5 right-5 z-50 h-14 w-14 items-center justify-center rounded-full bg-brand text-tren-brand shadow-brand transition-transform duration-300 hover:scale-110 hover:shadow-lift sm:bottom-6 sm:right-6 sm:flex " +
          (open ? "hidden sm:flex" : "flex")
        }
      >
        {/* Vòng pulse mời gọi — chỉ khi đang ĐÓNG và KHÔNG có lời chào. Lời
            chào tự nó đã kéo mắt rồi, thêm vòng nhấp nháy nữa là rối. */}
        {!open && !chao && (
          <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-25" />
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
            //
            // Rộng thêm ở màn hình lớn (lg): câu trả lời của bot hầu hết là
            // danh sách nhiều gạch đầu dòng, thêm được 32px chiều ngang là bớt
            // được một lần xuống dòng ở gần như mọi dòng.
            //
            // ⚠️ 13rem TRONG max-h LÀ SỐ TÍNH RA, ĐỪNG ĐOÁN LẠI. Panel neo ở
            // ĐÁY (bottom-24) nên nó cao lên bao nhiêu thì mép trên trèo lên
            // bấy nhiêu — cao quá là chui xuống dưới navbar, mà navbar z-50 >
            // panel z-40 nên phần bị che là ĐÚNG CÁI TIÊU ĐỀ có nút đóng.
            //     lề dưới 6rem (bottom-24)
            //   + navbar   5.625rem (dải liên hệ h-8 + thanh chính h-14 + 2 viền)
            //   + khe hở   1rem
            //   ≈ 13rem
            // Ai đổi chiều cao navbar trong Navbar.jsx thì phải sửa cả số này.
            className="fixed inset-0 z-40 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-13rem)] sm:w-96 lg:w-[26rem]"
          >
            <Suspense fallback={<ChatWindowSkeleton />}>
              <ChatWindow onClose={dong} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
