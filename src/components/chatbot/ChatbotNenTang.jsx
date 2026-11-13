import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { GOC_BOT, KHOA_BOT, PHIEN_BAN_BOT } from "./botNenTang.js";
import { onOpenChat } from "../../utils/chatBus.js";
import { useGiaoDien } from "../../context/NoiDungContext.jsx";
import { daTungDong, ghiDaDong } from "./chatDaDong.js";
import { LoiChao } from "./ChatWidget.jsx";

// ============================================================
// Khung chat của nền tảng iMob CMS. Xem cấu hình và công tắc ở botNenTang.js.
//
// Việc của component: chèn 2 file của nền tảng vào trang MỘT LẦN, và giấu khung
// chat khi rời khỏi các trang dùng Layout (vd sang /admin).
//
// VÌ SAO GIẤU BẰNG THUỘC TÍNH TRÊN <html> CHỨ KHÔNG ĐỤNG THẲNG VÀO KHUNG CHAT:
// khung chat do script của nền tảng tự gắn vào <body>, nằm ngoài React, và gắn
// vào LÚC NÀO thì mình không biết — script tải bất đồng bộ. Nếu khách rời trang
// trước khi script tải xong mà mình đi tìm khung chat để giấu, sẽ không thấy gì
// để giấu, rồi khung chat hiện ra ở /admin. Một thuộc tính trên <html> cộng một
// quy tắc CSS (index.css) thì đúng bất kể khung chat xuất hiện trước hay sau.
//
// Không gỡ script khi rời trang: script đã chạy thì không "chạy ngược" được,
// và tải lại mỗi lần quay về chỉ làm khung chat mất lịch sử đang nói dở.
// ============================================================
const ID_CSS = "imob-bot-nen-tang-css";
const ID_JS = "imob-bot-nen-tang-js";

function chenMotLan() {
  if (!document.getElementById(ID_CSS)) {
    const css = document.createElement("link");
    css.id = ID_CSS;
    css.rel = "stylesheet";
    // ⚠️ PHẢI có /widget/. Thiếu nó, máy chủ vẫn trả mã 200 nhưng là trang HTML
    // của dashboard chứ không phải CSS — khung chat vỡ mà không báo lỗi gì
    // (đã kiểm tra 30/09/2026).
    css.href = `${GOC_BOT}/widget/widget.css?v=${PHIEN_BAN_BOT}`;
    document.head.appendChild(css);
  }
  if (!document.getElementById(ID_JS)) {
    const js = document.createElement("script");
    js.id = ID_JS;
    js.src = `${GOC_BOT}/widget/widget.min.js?v=${PHIEN_BAN_BOT}`;
    js.async = true;
    js.dataset.apiKey = KHOA_BOT; // -> data-api-key
    // Ghi rõ địa chỉ hệ thống chatbot. Khung chat có đọc thuộc tính này; để
    // trống thì nó tự đoán, và đoán sai là gọi nhầm sang API của imob.vn.
    js.dataset.apiBase = GOC_BOT; // -> data-api-base
    document.body.appendChild(js);
  }
}

// Các nút "Chat với AI" trên trang (Hero, About, ServiceHero…) gọi openChat()
// trong chatBus.js. Bot cũ tự nghe sự kiện đó; khung chat của nền tảng thì
// không biết gì về nó, nên mình mở hộ bằng cách bấm nút tròn của nó. Khách bấm
// lúc script còn đang tải thì chờ thêm tối đa ~5 giây.
function moKhungChat(conLan = 25) {
  const nut = document.getElementById("imob-toggle-btn");
  if (nut) {
    if (!document.querySelector(".imob-chatbox.open")) nut.click();
    return;
  }
  if (conLan > 0) setTimeout(() => moKhungChat(conLan - 1), 200);
}

// Gửi một câu hỏi vào khung chat của nền tảng (ô "Hỏi ngay" ở trang Hỏi đáp
// AI). Khung chat nằm ngoài React và mã của nó bị làm rối, nên làm đúng như
// người thật: điền chữ vào ô nhập rồi bấm nút gửi. Id ô nhập và nút gửi đo trên
// khung chat thật ngày 13/11/2026: #imob-chat-input (textarea), #imob-send-btn.
//
// ⚠️ PHẢI gán giá trị qua "setter gốc" của textarea rồi phát sự kiện input.
// Gán thẳng `o.value = ...` thì chữ hiện lên nhưng nếu khung chat theo dõi ô
// nhập bằng sự kiện input, nó vẫn tưởng ô trống và nút gửi không làm gì.
// Nền tảng đổi id thì hàm này lặng lẽ chỉ còn MỞ khung chat (không gửi được) —
// khách vẫn tự gõ lại được, không hỏng trang.
function guiCauHoi(cauHoi, conLan = 25) {
  const o = document.getElementById("imob-chat-input");
  const nutGui = document.getElementById("imob-send-btn");
  const khungMo = document.querySelector(".imob-chatbox.open");
  if (!o || !nutGui || !khungMo) {
    if (conLan > 0) setTimeout(() => guiCauHoi(cauHoi, conLan - 1), 200);
    return;
  }
  const ganGoc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
  ganGoc.call(o, cauHoi);
  o.dispatchEvent(new Event("input", { bubbles: true }));
  nutGui.click();
}

// Báo cho mình biết khi khung chat của nền tảng mở ra / đóng lại, bất kể do ai
// bấm (nút tròn, dấu X trong khung, nút "Chat với AI", hay mình tự mở). Khung
// chat nằm ngoài React nên chỉ còn cách nhìn lớp "open" của nó đổi. Script của
// nền tảng tải chậm thì chờ tối đa ~30 giây cho khung chat xuất hiện.
function theoDoiKhungChat({ khiMo, khiDong }) {
  let quanSat = null;
  let hen = null;
  let conLan = 200; // 200 × 150ms ≈ 30 giây
  const gan = () => {
    const khung = document.querySelector(".imob-chatbox");
    if (!khung) {
      if (conLan-- > 0) hen = setTimeout(gan, 150);
      return;
    }
    let dangMo = khung.classList.contains("open");
    // Khung chat bản chatbot.imob.vn tự mở ngay khi tải xong — có thể đã mở
    // trước lúc mình tìm thấy nó. Báo luôn, không thì lần mở đó bị bỏ sót.
    if (dangMo) khiMo();
    quanSat = new MutationObserver(() => {
      const mo = khung.classList.contains("open");
      if (mo && !dangMo) khiMo();
      if (!mo && dangMo) khiDong();
      dangMo = mo;
    });
    quanSat.observe(khung, { attributes: true, attributeFilter: ["class"] });
  };
  gan();
  return () => {
    clearTimeout(hen);
    quanSat?.disconnect();
  };
}

// ============================================================
// TỰ MỞ KHI KHÁCH VỪA VÀO TRANG — cùng luật với bot cũ (xem đầu ChatWidget.jsx)
// và cùng cài đặt trong /admin → Giao diện (bật/tắt, chờ mấy giây, lời chào):
//
//   • Máy tính: chờ vài giây rồi mở hẳn khung chat. Không cần chờ khách cuộn
//     như bot cũ: đã đo ở 1280–1920px (01/10/2026), khung chat của nền tảng hẹp
//     hơn, chỉ đè cột thẻ dự án bên phải, không đè tiêu đề hay các nút đầu trang.
//   • Điện thoại: khung chat gần như kín màn hình, tự mở là che sạch website.
//     Chỉ hiện lời chào nhỏ cạnh nút tròn; khách bấm vào thì mới mở.
//   • Khách tự tay đóng (hoặc bấm X ở lời chào) thì thôi, cả phiên không mở lại.
// ============================================================
export default function ChatbotNenTang() {
  const cai = useGiaoDien()?.chat ?? {};
  const tuMo = cai.tuMo !== false; // thiếu khoá (database seed từ trước) -> coi như bật
  const treMs = Math.max(0, Number(cai.tre ?? 3)) * 1000;
  const loiChao = (cai.loiChao ?? "").trim();
  const [chao, setChao] = useState(false);

  useEffect(() => {
    chenMotLan();
    delete document.documentElement.dataset.botNenTang;
    const boNghe = onOpenChat((cauHoi) => {
      moKhungChat();
      if (cauHoi) guiCauHoi(cauHoi);
    });

    // ⚠️ Khung chat bản chatbot.imob.vn (từ 03/10/2026) TỰ MỞ mỗi lần tải trang,
    // kể cả trên điện thoại, và không nhớ khách đã đóng: khách bấm ✕ rồi tải
    // lại trang là nó lại bật lên. Giữ việc tự mở (anh Thắng muốn khách thấy
    // khung chat ngay), chỉ thêm: khách ĐÃ TỰ TAY ĐÓNG trong phiên này thì đóng
    // hộ lần tự mở đó. Phân biệt "tự mở" với "khách bấm mở" bằng việc khách đã
    // chạm / bấm phím vào trang chưa — bấm "Chat với AI" hay nút tròn đều là chạm.
    let khachDaTuongTac = false;
    const ghiTuongTac = () => {
      khachDaTuongTac = true;
    };
    window.addEventListener("pointerdown", ghiTuongTac, true);
    window.addEventListener("keydown", ghiTuongTac, true);

    const boTheoDoi = theoDoiKhungChat({
      khiMo: () => {
        setChao(false);
        if (daTungDong() && !khachDaTuongTac) document.getElementById("imob-close-btn")?.click();
      },
      khiDong: ghiDaDong,
    });
    return () => {
      boNghe();
      boTheoDoi();
      window.removeEventListener("pointerdown", ghiTuongTac, true);
      window.removeEventListener("keydown", ghiTuongTac, true);
      document.documentElement.dataset.botNenTang = "an";
    };
  }, []);

  /* ---------- Hẹn giờ tự mở ---------- */
  useEffect(() => {
    if (!tuMo || daTungDong()) return;
    const hen = setTimeout(() => {
      if (daTungDong() || document.querySelector(".imob-chatbox.open")) return;
      if (window.matchMedia("(min-width: 640px)").matches) moKhungChat();
      else if (loiChao) setChao(true); // điện thoại: chỉ chào, không mở
    }, treMs);
    return () => clearTimeout(hen);
    // Cài đặt từ database về muộn hơn lần vẽ đầu -> hẹn giờ đặt lại theo giá
    // trị mới. Tắt trong /admin thì hàm dọn dẹp huỷ luôn lần hẹn đang chờ.
  }, [tuMo, treMs, loiChao]);

  return (
    <AnimatePresence>
      {chao && (
        <LoiChao
          chu={loiChao}
          mo={() => {
            setChao(false);
            moKhungChat();
          }}
          bo={() => {
            ghiDaDong();
            setChao(false);
          }}
        />
      )}
    </AnimatePresence>
  );
}
