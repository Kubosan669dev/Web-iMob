import { ArrowUpRight, Clock, FileCheck2, MessageCircle, Sparkles, UserRoundCheck } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import MaQR from "../components/ui/MaQR.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { TRANG_CHATBOT } from "../components/chatbot/botNenTang.js";

// ============================================================
// Trang giới thiệu trợ lý ảo du lịch Quảng Ninh (/tro-ly-ao) — 02/10/2026.
//
// Trợ lý ảo chạy ở trang riêng chatbot.imob.vn (thư mục trang-chatbot/), tách
// khỏi website công ty theo yêu cầu lãnh đạo: khách hỏi đáp không bị khó chịu
// vì quảng cáo. Trang này chỉ là CỬA VÀO: nói trợ lý làm được gì, rồi một nút
// mở trang chatbot. Khi imob.vn tạm ẩn khung chat (CHE_DO_BOT = "an" trong
// botNenTang.js), mọi nút "Chat với AI" trên website dẫn về đây.
//
// ⚠️ Không hứa điều trợ lý chưa chắc làm được. Nó chỉ biết những gì đã nạp vào
// kho tri thức trên nền tảng; câu hỏi mẫu dưới đây là KIỂU câu nên hỏi, không
// phải lời cam kết là câu nào cũng có đáp án.
// ============================================================

const CAU_HOI_MAU = [
  "Đi Hạ Long 2 ngày nên chơi những đâu?",
  "Lên Yên Tử cần chuẩn bị gì?",
  "Quảng Ninh có món đặc sản gì nên thử?",
  "Mùa nào đi Quảng Ninh đẹp nhất?",
];

const DIEM = [
  {
    Icon: Clock,
    tieuDe: "Trả lời sau vài giây",
    moTa: "Nhắn như nhắn tin cho bạn bè, cả ngày lẫn đêm, không phải chờ người trực.",
  },
  {
    Icon: FileCheck2,
    tieuDe: "Từ tài liệu đã duyệt",
    moTa: "Trợ lý trả lời dựa trên tài liệu về Quảng Ninh đã được nạp và kiểm tra. Câu nào chưa có thông tin, nó nói rõ thay vì đoán.",
  },
  {
    Icon: UserRoundCheck,
    tieuDe: "Miễn phí, không cần đăng ký",
    moTa: "Mở là hỏi được ngay, trên điện thoại hay máy tính đều được.",
  },
];

/** Khung chat minh hoạ — chỉ để khách hình dung, không phải câu trả lời thật,
    nên câu trả lời cố ý dừng ở "đang soạn" thay vì bịa nội dung. */
function KhungChatMinhHoa() {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-block bg-panel shadow-lift" aria-hidden="true">
      <div className="flex items-center gap-3 bg-brand px-5 py-4 text-tren-brand">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tren-brand/20">
          <MessageCircle className="h-4.5 w-4.5" />
        </span>
        <span className="font-semibold">Trợ lý ảo Quảng Ninh</span>
      </div>
      <div className="space-y-3 bg-mist/60 px-5 py-6">
        <p className="max-w-[85%] rounded-card rounded-tl-md bg-panel px-4 py-3 text-[0.9375rem] leading-relaxed text-ink">
          Xin chào! Bạn muốn đi đâu, ăn gì ở Quảng Ninh? Cứ hỏi mình nhé.
        </p>
        <p className="ml-auto max-w-[85%] rounded-card rounded-tr-md bg-brand px-4 py-3 text-[0.9375rem] leading-relaxed text-tren-brand">
          {CAU_HOI_MAU[0]}
        </p>
        <div className="flex w-fit items-center gap-1.5 rounded-card rounded-tl-md bg-panel px-4 py-3.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s] motion-reduce:animate-none" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s] motion-reduce:animate-none" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint motion-reduce:animate-none" />
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        <span className="flex-1 rounded-full bg-mist px-4 py-2.5 text-sm text-ink-faint">Nhập câu hỏi…</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-tren-brand">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

export default function TroLyAoPage() {
  useDocumentTitle("Trợ lý ảo du lịch Quảng Ninh | iMob");

  return (
    <>
      {/* ---------- Đầu trang ---------- */}
      <section className="bg-gradient-to-b from-brand-soft via-paper to-paper pb-20 pt-32 lg:pb-28 lg:pt-40">
        <Container className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div className="text-center lg:text-left">
            <Badge>Trợ lý ảo du lịch Quảng Ninh</Badge>
            <h1 className="tieu-de-lon mt-5 text-balance text-[clamp(2.25rem,5vw,4rem)] text-ink">
              Đi Quảng Ninh, <span className="text-brand">hỏi trợ lý ảo trước</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-soft sm:text-[1.1875rem] lg:mx-0">
              Điểm đến, lịch trình, ăn uống, văn hoá — bạn hỏi bằng lời thường, trợ lý ảo trả lời ngay
              trong trang chat riêng, không quảng cáo.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button href={TRANG_CHATBOT} target="_blank" rel="noopener" size="lg">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Mở trợ lý ảo
              </Button>
              <span className="text-sm text-ink-faint">chatbot.imob.vn · mở trong thẻ mới</span>
            </div>

            {/* Mã QR — cho người đang xem trên máy tính chuyển sang điện thoại.
                Ẩn trên điện thoại: đang cầm điện thoại thì quét vào đâu. */}
            <div className="mt-10 hidden items-center gap-4 rounded-card bg-mist p-4 lg:inline-flex">
              <MaQR noiDung={TRANG_CHATBOT} alt="Mã QR mở chatbot.imob.vn" className="h-24 w-24 rounded-lg" />
              <p className="max-w-[14rem] text-left text-sm leading-relaxed text-ink-soft">
                <span className="block font-semibold text-ink">Dùng trên điện thoại?</span>
                Quét mã bằng camera hoặc Zalo để mở trợ lý ảo.
              </p>
            </div>
          </div>

          <KhungChatMinhHoa />
        </Container>
      </section>

      {/* ---------- Câu hỏi mẫu ---------- */}
      <section className="py-16 lg:py-20">
        <Container rong="max-w-4xl">
          <h2 className="text-center text-[clamp(1.5rem,3vw,2.125rem)] font-semibold text-ink">
            Bạn có thể hỏi những câu như
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {CAU_HOI_MAU.map((cau) => (
              <li key={cau}>
                <a
                  href={TRANG_CHATBOT}
                  target="_blank"
                  rel="noopener"
                  className="group flex h-full items-center justify-between gap-3 rounded-card bg-mist px-5 py-4 text-[0.9375rem] text-ink transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span>“{cau}”</span>
                  <ArrowUpRight
                    className="h-4 w-4 flex-none text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------- Ba điều nên biết ---------- */}
      <section className="bg-mist py-16 lg:py-20">
        <Container>
          <ul className="grid gap-5 md:grid-cols-3">
            {DIEM.map(({ Icon, tieuDe, moTa }) => (
              <li key={tieuDe} className="rounded-card bg-panel p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{tieuDe}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{moTa}</p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-ink-faint">
            Câu trả lời do trợ lý AI tổng hợp và có thể chưa chính xác. Với thông tin quan trọng như giá
            vé, giờ mở cửa, bạn nên kiểm tra lại với nguồn chính thức trước khi đi.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href={TRANG_CHATBOT} target="_blank" rel="noopener" size="lg">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Mở trợ lý ảo
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
