import { Sparkles, MessageCircle } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Button from "../components/ui/Button.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import MessageBubble from "../components/chatbot/MessageBubble.jsx";
import TypingIndicator from "../components/chatbot/TypingIndicator.jsx";
import { openChat } from "../utils/chatBus.js";

// Đoạn hội thoại mẫu — TĨNH, chỉ để minh hoạ giao diện thật trông thế nào.
// Tái dùng MessageBubble thật (Bước 6 vừa xây) thay vì vẽ lại UI lần 2.
//
// QUAN TRỌNG: câu trả lời mẫu phải KHỚP với hành vi thật của bot.
// Bản trước ghi "bắt đầu từ 30 triệu" — một con số KHÔNG có trong dữ liệu,
// trong khi bot được thiết kế để tuyệt đối không báo giá (xem mục
// "chi-phi-thoi-gian" trong data/kienThuc.json).
// Quảng cáo một đằng, bot trả lời một nẻo là mất lòng tin của khách.
const PREVIEW_MESSAGES = [
  { id: 1, role: "bot", text: "Xin chào! Mình có thể giúp gì cho bạn? 👋" },
  { id: 2, role: "user", text: "Cho mình hỏi giá làm Zalo MiniApp" },
  {
    id: 3,
    role: "bot",
    text: "Chi phí tuỳ theo quy mô và tính năng bạn cần ạ. Bạn để lại số điện thoại, bên mình tư vấn và báo giá chi tiết miễn phí trong 24h nhé!",
  },
];

const HIGHLIGHTS = [
  "Trả lời tức thì, hoạt động 24/7",
  "Hiểu tiếng Việt tự nhiên, không cần gõ đúng cú pháp",
  "Sẵn sàng kết nối dữ liệu thật của doanh nghiệp bạn",
];

export default function ChatbotIntro() {
  return (
    <section id="chatbot" className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl"
      />

      <Container className="relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* ---------- Cột trái: giới thiệu ---------- */}
        <div className="space-y-7">
          <Reveal>
            <SectionTitle
              align="left"
              badge="Trợ lý AI"
              icon={Sparkles}
              title="TRÒ CHUYỆN VỚI"
              highlight="AI CỦA CHÚNG TÔI"
              description="Không cần chờ giờ hành chính — trợ lý ảo trả lời ngay câu hỏi về dịch vụ, báo giá và cách liên hệ, mọi lúc bạn cần."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="space-y-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <Button onClick={openChat} size="lg">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Bắt đầu
              trò chuyện
            </Button>
          </Reveal>
        </div>

        {/* ---------- Cột phải: mockup khung chat (tĩnh) ---------- */}
        <Reveal delay={0.15}>
          <div className="glass mx-auto w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-3.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <p className="ml-2 text-xs font-semibold text-gray-400">
                iMob Assistant
              </p>
            </div>
            <div className="space-y-4 px-4 py-5">
              {PREVIEW_MESSAGES.map((m) => (
                <MessageBubble key={m.id} role={m.role} text={m.text} plain />
              ))}
              <TypingIndicator />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
