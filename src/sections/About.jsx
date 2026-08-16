import { Sparkles, Handshake, Users, Wrench, Star } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Card from "../components/ui/Card.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { useCongTy } from "../context/NoiDungContext.jsx";
import about from "../data/about.json";

// Nội dung section đọc từ data/about.json — trước đây hardcode ngay ở đây
// nên chatbot không biết gì về số liệu và điểm mạnh của công ty.
// (Các câu trả lời "about-stats" / "strengths" trong data/kienThuc.json
// lấy đúng những số này — sửa số ở đây thì nhớ sửa cả bên đó.)
//
// Map tên icon (chuỗi trong JSON) → component lucide, giống cách
// Services.jsx đang làm: JSON không chứa được component.
const FEATURE_ICONS = {
  handshake: Handshake,
  users: Users,
  wrench: Wrench,
};

export default function About() {
  const congTy = useCongTy();

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
              highlight={congTy.name.toUpperCase()}
              description={`${congTy.description} — chúng tôi tin rằng thành công của khách hàng chính là minh chứng tốt nhất cho giá trị mình mang lại.`}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="leading-relaxed text-gray-400">{about.philosophy}</p>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.2}>
            <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-8">
              {about.stats.map((stat) => (
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
          {about.features.map((feature, index) => {
            // ?? Star: nếu JSON ghi tên icon lạ thì vẫn có icon dự phòng,
            // không để trang trắng vì một lỗi gõ nhầm trong dữ liệu.
            const Icon = FEATURE_ICONS[feature.icon] ?? Star;
            return (
              <Reveal key={feature.title} delay={index * 0.12}>
                <Card hover className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-500/25 to-blue-500/25">
                    <Icon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
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
            );
          })}
        </div>
      </Container>
    </section>
  );
}
