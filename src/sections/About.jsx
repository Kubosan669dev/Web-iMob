import { Handshake, Users, Shield, Brain, Star, Check, MessageCircle } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Button from "../components/ui/Button.jsx";
import ChuyenDoiCard from "../components/ui/ChuyenDoiCard.jsx";
import MessageBubble from "../components/chatbot/MessageBubble.jsx";
import TypingIndicator from "../components/chatbot/TypingIndicator.jsx";
import { iconOf } from "../components/service/icons.js";
import { useAbout, useCongTy } from "../context/NoiDungContext.jsx";
import { openChat } from "../utils/chatBus.js";

// ============================================================
// "Về iMob" — GỘP 18/08/2026.
//
// Trước đây đây là HAI section riêng: Giới thiệu và Trợ lý AI, cộng lại khoảng
// bốn màn hình cuộn. Góp ý của công ty: trang chủ là một bộ slide chào hàng
// lần đầu, 4–5 slide là tối đa, không phải hồ sơ năng lực 20 trang.
//
// Gộp vào đây không phải để tiết kiệm chỗ. Trợ lý AI CHÍNH LÀ bằng chứng cho
// giá trị thứ ba mà công ty tự nêu — "Ứng dụng công nghệ mới: AI, Big Data và
// Cloud, đưa vào đúng chỗ". Nói giá trị rồi cho khách bấm thử ngay thứ mình
// vừa nói, mạnh hơn hẳn hai khối rời nhau.
//
// Đã nén: bốn giá trị cốt lõi từ bốn THẺ LỚN (p-8) xuống danh sách 2×2 gọn,
// dải năng lực bỏ khung thẻ. Chữ giữ nguyên — nén là nén bố cục, không cắt
// nội dung lấy từ ấn phẩm chính thức của công ty.
//
// Dải SỐ LIỆU đã chuyển lên khung hình đầu: người dừng lại ở màn hình đầu
// tiên phải nắm được quy mô ngay, không thì họ không bao giờ cuộn tới đây.
// ============================================================

// Map tên icon (chuỗi trong JSON) → component lucide: JSON không chứa được
// component. Bốn giá trị dùng map riêng ở đây; dải năng lực dùng chung
// `iconOf` với các section khác vì danh sách icon ở đó dài hơn.
const FEATURE_ICONS = {
  users: Users,
  shield: Shield,
  brain: Brain,
  handshake: Handshake,
};

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

export default function About() {
  const congTy = useCongTy();
  const about = useAbout();

  return (
    <section id="about" className="bg-mist py-20 lg:py-24">
      <Container className="space-y-14 lg:space-y-16">
        {/* ---------- Tiêu đề = sứ mệnh công ty ---------- */}
        <Reveal>
          <SectionTitle
            badge={about.phuDe}
            title={about.tieuDe}
            highlight={about.tieuDeNhan}
            description={about.moTa}
          />
        </Reveal>

        {/* ---------- Triết lý + bốn giá trị ‖ khối Trước → Sau ---------- */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              {/* Cỡ chữ lớn hơn đoạn văn thường: đây là câu công ty tự nói về
                  cách mình làm việc, đáng được đọc chậm. */}
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft sm:text-[1.1875rem]">
                {about.philosophy}
              </p>
            </Reveal>

            {/* Bốn giá trị: danh sách gọn thay cho bốn thẻ lớn. Cùng lượng chữ,
                bằng một phần ba chiều cao. */}
            <Reveal delay={0.1}>
              <ul className="mt-9 grid gap-x-7 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
                {about.features?.map((feature) => {
                  // ?? Star: JSON ghi tên icon lạ thì vẫn có icon dự phòng,
                  // không để trang trắng vì một lỗi gõ nhầm trong dữ liệu.
                  const Icon = FEATURE_ICONS[feature.icon] ?? Star;
                  return (
                    <li key={feature.title} className="flex gap-3.5">
                      <Icon
                        className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <h3 className="text-[0.9375rem] font-semibold text-ink">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-soft">
                          {feature.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <ChuyenDoiCard className="mx-auto max-w-md" />
          </Reveal>
        </div>

        {/* ---------- Trợ lý AI ----------
            Giá trị "Ứng dụng công nghệ mới" ở trên nói bằng lời; khối này cho
            bấm thử ngay. Ảnh chụp khung chat đặt bên trái, ngược chiều với
            khối Trước → Sau phía trên, để hai hàng không thành hai cột song
            song đơn điệu. */}
        <div className="grid items-center gap-10 border-t border-line pt-14 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            {/* Khung chat là thứ DUY NHẤT trên trang được phép đổ bóng rõ: nó mô
                phỏng một cửa sổ nổi lên trên mặt trang, bóng ở đây mang nghĩa
                "nằm trên", không phải trang trí. */}
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-block bg-panel shadow-lift">
              <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                <span className="h-3 w-3 rounded-full bg-line" />
                <span className="h-3 w-3 rounded-full bg-line" />
                <span className="h-3 w-3 rounded-full bg-line" />
                <p className="ml-2 text-sm font-medium text-ink-soft">iMob Assistant</p>
              </div>
              <div className="space-y-4 px-5 py-6">
                {PREVIEW_MESSAGES.map((m) => (
                  <MessageBubble key={m.id} role={m.role} text={m.text} plain />
                ))}
                <TypingIndicator />
              </div>
            </div>
          </Reveal>

          <div>
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
              <ul className="mt-7 space-y-3">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[1rem] text-ink-soft">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8">
                <Button onClick={openChat} size="lg">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Bắt đầu trò chuyện
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ---------- Năng lực nổi bật ----------
            Bỏ khung thẻ trắng, để thẳng trên nền xám của section — một dải icon
            thì không cần thêm một cái hộp bao quanh nữa.
            `?.` và kiểm tra độ dài: trường `nangLuc` thêm 17/08/2026, website
            chạy với database seed từ trước có thể chưa có. Thiếu thì cả khối
            biến mất, không vỡ trang. */}
        {about.nangLuc?.length > 0 && (
          <Reveal>
            <div className="border-t border-line pt-12">
              <p className="text-center text-sm font-semibold text-ink-faint">
                Năng lực nổi bật
              </p>
              <ul className="mt-7 grid gap-7 sm:grid-cols-3 lg:grid-cols-5">
                {about.nangLuc.map((nl) => {
                  const Icon = iconOf(nl.icon);
                  return (
                    <li
                      key={nl.label}
                      className="flex flex-col items-center gap-2.5 text-center"
                    >
                      <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                      <span className="text-[0.875rem] font-medium leading-snug text-ink">
                        {nl.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        )}

        {/* ---------- Slogan chốt section ----------
            Câu định vị chính thức của công ty, cỡ lớn giữa nhiều khoảng trắng. */}
        {congTy.slogan && (
          <Reveal>
            <p className="tieu-de-lon mx-auto max-w-3xl text-center text-[clamp(1.375rem,2.8vw,2rem)] text-ink">
              {congTy.name} — <span className="text-brand">{congTy.slogan}</span>
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
