import { useState } from "react";
import { ArrowRight, BadgeCheck, Clock, MessageCircle, MessageSquareText, Sparkles } from "lucide-react";
import Container from "../../components/ui/Container.jsx";
import { openChat } from "../../utils/chatBus.js";
import { VAI_TRO, ghepVung } from "../../utils/hoiDap.js";
import diaPhuong from "../../data/diaPhuong.json";

// ============================================================
// Khối đầu trang Hỏi đáp AI — giao diện công ty chốt 13/11/2026.
//
// Việc DUY NHẤT của khối này: đưa khách vào khung chat (popup của nền tảng).
//
// 13/11/2026 — theo ý công ty, ô hỏi lớn trong ảnh mẫu (chọn vùng + ô gõ +
// "Hỏi ngay") ĐÃ THAY bằng MỘT NÚT mở popup: "trước mắt cứ gắn cái popup lên,
// để lại nút bấm dẫn đến popup". Khách gõ câu hỏi ngay trong popup. Bản có ô
// hỏi lớn xem lịch sử git nếu sau này làm lại (đợt 2, khi có API chat).
//
// Câu gợi ý bên dưới vẫn giữ: bấm là popup mở và câu đó được gửi luôn
// (utils/chatBus.js → chatbot/ChatbotNenTang.jsx). Gợi ý lấy theo địa phương
// đầu tiên trong data/diaPhuong.json; câu chưa nhắc tên vùng thì được ghép tên
// vào đầu — lý do ở ghepVung(), utils/hoiDap.js.
//
// So với ảnh mẫu đã BỎ hai nhãn góc phải "Dữ liệu số hoá chính thống" và
// "Không hoang tưởng dữ liệu (No-Hallucination)": AI nào cũng có thể trả lời
// sai, hứa "không bao giờ sai" là hứa điều không giữ được.
// ============================================================

const DS = diaPhuong.danhSach;

const ICON_GOI_Y = [MessageSquareText, Sparkles, Clock];

export default function HeroHoiDap() {
  const [vaiTro, setVaiTro] = useState(VAI_TRO[0].khoa);

  const vung = DS[0];
  const goiY = vung.cauHoi?.[vaiTro] ?? [];

  const hoi = (cau) => openChat(ghepVung(cau, vung));

  return (
    <section id="hoi-dap" className="relative overflow-hidden bg-paper pb-16 pt-28 sm:pb-20 sm:pt-32">
      {/* Nền núi mờ: ảnh 360° Vân Tiêu – Yên Tử do iMob chụp, bạc màu và tan
          dần xuống dưới, sang trái. Thuần trang trí nên alt rỗng. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src="/anh/dia-phuong/yen-tu-nen-nui.webp"
          alt=""
          className="absolute right-0 top-0 h-[30rem] w-full object-cover object-right opacity-[0.3] sm:h-[34rem]"
          style={{
            filter: "grayscale(0.55) sepia(0.25) contrast(0.9) blur(1px)",
            maskImage: "linear-gradient(to bottom, black 25%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 95%)",
          }}
        />
        {/* Tan sang trái để phần chữ nằm trên nền kem sạch */}
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/75 to-transparent" />
      </div>

      <Container rong="max-w-6xl" className="relative">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Trợ lý AI bản địa
            <span className="hidden text-ink-faint sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="hidden font-medium normal-case tracking-normal sm:inline">
              Hỏi đáp dựa trên tài liệu địa phương
            </span>
          </p>
        </div>

        <h1 className="mt-7 max-w-3xl font-display text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-brand-deep sm:text-6xl">
          Khám phá địa phương
          <br />
          <em className="font-semibold">cùng trợ lý AI</em>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          Tìm hiểu điểm đến, văn hoá, dịch vụ và thông tin địa phương qua một cuộc trò chuyện.
        </p>

        {/* ---------- Nút mở popup chat ---------- */}
        <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={() => openChat()}
            className="inline-flex items-center gap-2.5 rounded-xl bg-brand px-7 py-4 text-[1.0625rem] font-semibold text-tren-brand shadow-brand transition-colors hover:bg-brand-deep"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Trò chuyện với trợ lý AI
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="inline-flex items-center gap-1.5 text-sm text-ink-faint">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Miễn phí, không cần đăng nhập
          </p>
        </div>

        {/* ---------- Vai trò ---------- */}
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Theo vai trò:
          </span>
          {VAI_TRO.map(({ khoa, nhan, icon: Icon }) => {
            const chon = khoa === vaiTro;
            return (
              <button
                key={khoa}
                type="button"
                onClick={() => setVaiTro(khoa)}
                aria-pressed={chon}
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors " +
                  (chon ? "bg-brand text-tren-brand" : "bg-mist text-ink-soft hover:text-ink")
                }
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {nhan}
              </button>
            );
          })}
        </div>

        {/* ---------- Câu gợi ý: bấm là hỏi luôn ---------- */}
        <ul className="mt-4 flex max-w-4xl flex-wrap gap-2.5">
          {goiY.map((cau, i) => {
            const Icon = ICON_GOI_Y[i % ICON_GOI_Y.length];
            return (
              <li key={cau}>
                <button
                  type="button"
                  onClick={() => hoi(cau)}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel px-3.5 py-2 text-left text-[0.8125rem] text-ink-soft transition-colors hover:border-brand/40 hover:text-ink"
                >
                  <Icon className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                  {cau}
                </button>
              </li>
            );
          })}
        </ul>

      </Container>
    </section>
  );
}
