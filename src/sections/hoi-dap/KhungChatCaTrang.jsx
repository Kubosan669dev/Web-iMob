import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { guiCauHoi, moKhungChat } from "../../components/chatbot/botNenTang.js";

// ============================================================
// Khung chat CẢ TRANG cho /hoi-dap (giai đoạn 2, 16/11/2026).
//
// CHƯA có tài liệu API của nền tảng chatbot (anh Thắng), nên KHÔNG tự vẽ khung
// chat riêng. Thay vào đó: lấy CHÍNH khung chat nổi của nền tảng (hộp
// .imob-widget-container do script widget.min.js gắn vào <body>) đặt vào ô
// giữa trang, rồi CSS (styles/index.css, mục "chat cả trang") gỡ vị trí cố
// định, ẩn nút tròn và nút đóng, đổi màu theo bảng màu của web. Trả lời, thẻ
// nguồn trích dẫn, báo sai… vẫn do mã của nền tảng lo — không gọi thẳng API.
//
// VÌ SAO CHUYỂN NGUYÊN HỘP BỌC chứ không chỉ khung chat bên trong: biến màu
// (--primary-color…) và nhiều quy tắc CSS của nền tảng viết theo
// `.imob-widget-container …`. Chỉ lấy khung bên trong ra thì mất hết màu.
//
// Rời trang: trả hộp về <body> → nó lại thành khung chat nổi, CÒN NGUYÊN cuộc
// trò chuyện đang dở (đó là cùng một khung, không tải lại).
//
// Khi có API: thay component này bằng khung chat tự vẽ; phần còn lại của
// trang (cột thực địa, gợi ý, bản đồ) giữ nguyên.
// ============================================================

export default function KhungChatCaTrang({ cauHoiDau = "", khiDaGui }) {
  const o = useRef(null);
  const [san, setSan] = useState(false);
  const daGuiRef = useRef(false);

  useEffect(() => {
    const goc = document.documentElement;
    goc.dataset.chatCaTrang = "1";
    let hop = null;
    let hen;
    let conLan = 200; // ~30 giây chờ script nền tảng tải xong

    const gan = () => {
      hop = document.querySelector(".imob-widget-container");
      if (!hop || !o.current) {
        if (conLan-- > 0) hen = setTimeout(gan, 150);
        return;
      }
      o.current.appendChild(hop);
      moKhungChat();
      setSan(true);
    };
    gan();

    return () => {
      clearTimeout(hen);
      delete goc.dataset.chatCaTrang;
      if (hop && hop.parentNode !== document.body) document.body.appendChild(hop);
    };
  }, []);

  // Câu hỏi mang theo từ trang chủ (?hoi=...): gửi đúng MỘT lần khi khung sẵn.
  useEffect(() => {
    if (!san || !cauHoiDau || daGuiRef.current) return;
    daGuiRef.current = true;
    guiCauHoi(cauHoiDau);
    khiDaGui?.();
  }, [san, cauHoiDau, khiDaGui]);

  return (
    <div className="relative h-[calc(100dvh-6rem)] min-h-[30rem] lg:h-[min(48rem,calc(100dvh-7rem))]">
      <div ref={o} className="o-chat-ca-trang h-full" />
      {!san && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-panel text-sm text-ink-soft shadow-soft">
          <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden="true" />
          Đang mở trợ lý AI…
        </div>
      )}
    </div>
  );
}
