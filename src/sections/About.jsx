import { Sparkles, Handshake, Users, Wrench } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Card from "../components/ui/Card.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { SITE } from "../utils/constants.js";

// Số liệu và điểm mạnh — nội dung tĩnh của section, gom một chỗ cho dễ sửa
const STATS = [
  { value: "50+", label: "Dự án triển khai" },
  { value: "30+", label: "Khách hàng đồng hành" },
  { value: "99%", label: "Mức độ hài lòng" },
];

const FEATURES = [
  {
    icon: Handshake,
    title: "Đối tác tin cậy",
    description:
      "Đồng hành lâu dài từ khâu ý tưởng, tư vấn, thiết kế đến triển khai và đào tạo vận hành.",
  },
  {
    icon: Users,
    title: "Đội ngũ chuyên môn",
    description:
      "Kỹ sư giàu kinh nghiệm thực chiến trong phát triển sản phẩm số và tích hợp AI.",
  },
  {
    icon: Wrench,
    title: "Giải pháp may đo",
    description:
      "Không rập khuôn — mỗi giải pháp được thiết kế đúng theo bài toán và quy mô của bạn.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden py-24 lg:py-32">
      {/* Glow nhẹ một góc — tạo chiều sâu, không dùng full grid để đổi nhịp với Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-purple-600/10 blur-3xl"
      />

      <Container className="relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* ---------- Cột trái: nội dung + stats ---------- */}
        <div className="space-y-8">
          <Reveal>
            <SectionTitle
              align="left"
              badge="Về chúng tôi"
              icon={Sparkles}
              title="GIẢI PHÁP"
              highlight={SITE.name.toUpperCase()}
              description={`${SITE.description} — chúng tôi tin rằng thành công của khách hàng chính là minh chứng tốt nhất cho giá trị mình mang lại.`}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="leading-relaxed text-gray-400">
              Từ website, ứng dụng, phần mềm quản trị đến trợ lý AI — mỗi sản
              phẩm đều được xây trên một nền tảng: hiểu đúng bài toán của bạn
              trước, chọn công nghệ sau. Bắt đầu nhỏ, chạy thật, mở rộng dần.
            </p>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.2}>
            <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-gradient text-3xl font-black sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-gray-500 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ---------- Cột phải: feature cards ---------- */}
        <div className="space-y-5">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.12}>
              <Card hover className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-500/25 to-blue-500/25">
                  <feature.icon
                    className="h-6 w-6 text-cyan-300"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
