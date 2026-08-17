import { MessageCircle, Check } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Button from "../components/ui/Button.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import MessageBubble from "../components/chatbot/MessageBubble.jsx";
import TypingIndicator from "../components/chatbot/TypingIndicator.jsx";
import { openChat } from "../utils/chatBus.js";

// Đoạn hội thoại mẫu — TĨNH, chỉ để minh hoạ giao diện thật trông thế nào.
// Tái dùng MessageBubble thật thay vì vẽ lại UI lần 2.
//
// QUAN TRỌNG: câu trả lời mẫu phải KHỚP với hành vi thật của bot.
// Một bản trước từng ghi "bắt đầu từ 30 triệu" — con số KHÔNG có trong dữ liệu,
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
  "Sẵn sàng kết nối dữ liệu thật của đơn vị bạn",
];

export default function ChatbotIntro() {
  return (
    // Nền trắng — xen kẽ với dải nền xám của section Giới thiệu phía trên.
    <section id="chatbot" className="py-24 lg:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* ---------- Cột trái: giới thiệu ---------- */}
        <div className="space-y-8">
          <Reveal>
            <SectionTitle
              align="left"
              badge="Trợ lý AI"
              title="Hỏi lúc nào"
              highlight="cũng có người trả lời."
              description="Không cần chờ giờ hành chính — trợ lý ảo trả lời ngay câu hỏi về dịch vụ, sản phẩm và cách liên hệ."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="space-y-3">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[1.0625rem] text-ink-soft"
                >
                  <Check className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <Button onClick={openChat} size="lg">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Bắt đầu trò chuyện
            </Button>
          </Reveal>
        </div>

        {/* ---------- Cột phải: mockup khung chat (tĩnh) ---------- */}
        <Reveal delay={0.15}>
          {/* Khung chat là thứ DUY NHẤT trên trang được phép đổ bóng rõ: nó mô
              phỏng một cửa sổ nổi lên trên mặt trang, bóng ở đây mang nghĩa
              "nằm trên", không phải trang trí. */}
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-block bg-panel shadow-lift">
            <div className="flex items-center gap-2 border-b border-line px-5 py-4">
              <span className="h-3 w-3 rounded-full bg-line" />
              <span className="h-3 w-3 rounded-full bg-line" />
              <span className="h-3 w-3 rounded-full bg-line" />
              <p className="ml-2 text-sm font-medium text-ink-soft">
                iMob Assistant
              </p>
            </div>
            <div className="space-y-4 px-5 py-6">
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
