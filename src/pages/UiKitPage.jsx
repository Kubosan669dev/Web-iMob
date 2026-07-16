import {
  Zap,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Cpu,
  Rocket,
} from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";

// ------------------------------------------------------------------
// UiKitPage: style-guide NỘI BỘ (route /ui-kit) — không link ra ngoài.
// Dùng để duyệt design tokens & components trước khi xây các section.
// ------------------------------------------------------------------

// Khối tiêu đề nhóm demo
function DemoBlock({ title, children }) {
  return (
    <section className="space-y-6">
      <h3 className="border-l-2 border-purple-500 pl-3 font-mono text-sm uppercase tracking-widest text-gray-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

// Ô màu trong palette
function Swatch({ name, varName, hex }) {
  return (
    <div className="space-y-2">
      <div
        className="h-20 rounded-xl border border-white/10"
        style={{ backgroundColor: hex }}
      />
      <p className="text-sm font-semibold text-white">{name}</p>
      <p className="font-mono text-xs text-gray-500">
        {varName} · {hex}
      </p>
    </div>
  );
}

export default function UiKitPage() {
  return (
    <div className="relative min-h-screen overflow-hidden py-16">
      {/* Preview nền grid công nghệ (component hoàn chỉnh sẽ làm ở bước Hero) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.35) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(59,130,246,0.35) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      {/* Glow blob demo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl animate-glow-pulse"
      />

      <Container className="relative space-y-16">
        {/* ---------- Header ---------- */}
        <header className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            /ui-kit · internal style guide
          </p>
          <h1 className="text-5xl font-black text-white">
            iMob <span className="text-gradient">Design System</span>
          </h1>
          <p className="max-w-xl text-gray-400">
            Duyệt tông màu, chữ và component gốc tại đây trước khi xây các
            section. Trang này chỉ dùng nội bộ trong quá trình phát triển.
          </p>
        </header>

        {/* ---------- Palette ---------- */}
        <DemoBlock title="01 · Palette">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            <Swatch name="Night (nền)" varName="--color-night" hex="#05050a" />
            <Swatch name="Surface (panel)" varName="--color-surface" hex="#0b0b14" />
            <Swatch name="Primary" varName="--color-primary" hex="#3b82f6" />
            <Swatch name="Accent" varName="--color-accent" hex="#a855f7" />
            <Swatch name="Neon" varName="--color-neon" hex="#22d3ee" />
          </div>
        </DemoBlock>

        {/* ---------- Typography ---------- */}
        <DemoBlock title="02 · Typography">
          <div className="space-y-4">
            <h2 className="text-6xl font-black leading-tight text-white">
              DIGITAL <span className="text-gradient">FUTURE</span>
              <br />
              STARTS HERE
            </h2>
            <p className="max-w-2xl leading-relaxed text-gray-400">
              Font chính: Inter Variable — dùng cho toàn bộ nội dung. Đoạn mô
              tả dài dùng text-gray-400 để dịu mắt trên nền tối.
            </p>
            <p className="font-mono text-sm text-cyan-300">
              $ font-mono: JetBrains Mono — dùng cho terminal, badge kỹ thuật
            </p>
          </div>
        </DemoBlock>

        {/* ---------- Badges ---------- */}
        <DemoBlock title="03 · Badges">
          <div className="flex flex-wrap items-center gap-4">
            <Badge icon={Zap}>Giải pháp số thế hệ mới</Badge>
            <Badge icon={Sparkles}>Về chúng tôi</Badge>
            <Badge>Không icon</Badge>
          </div>
        </DemoBlock>

        {/* ---------- Buttons ---------- */}
        <DemoBlock title="04 · Buttons">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg">
                Liên hệ <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <MessageCircle className="h-4 w-4" /> Chat AI
              </Button>
              <Button variant="ghost" size="lg">
                Ghost
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="md">Size md</Button>
              <Button variant="outline" size="md">
                Size md
              </Button>
              <Button size="sm">Size sm</Button>
              <Button variant="outline" size="sm">
                Size sm
              </Button>
            </div>
          </div>
        </DemoBlock>

        {/* ---------- Cards ---------- */}
        <DemoBlock title="05 · Cards (glassmorphism)">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <Cpu className="mb-4 h-8 w-8 text-blue-400" />
              <h4 className="mb-2 text-lg font-bold text-white">Card thường</h4>
              <p className="text-sm leading-relaxed text-gray-400">
                Nền kính mờ (glass) + viền xanh nhạt. Dùng cho khối thông tin
                tĩnh.
              </p>
            </Card>
            <Card hover>
              <Rocket className="mb-4 h-8 w-8 text-purple-400" />
              <h4 className="mb-2 text-lg font-bold text-white">Card hover</h4>
              <p className="text-sm leading-relaxed text-gray-400">
                Di chuột vào đây: nhấc nhẹ + viền tím + glow. Dùng cho card
                dịch vụ / dự án.
              </p>
            </Card>
            <Card hover className="flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 animate-float items-center justify-center rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/30 to-blue-500/30">
                <Zap className="h-6 w-6 text-cyan-300" />
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-gray-400">
                animate-float
              </p>
            </Card>
          </div>
        </DemoBlock>

        {/* ---------- SectionTitle ---------- */}
        <DemoBlock title="06 · SectionTitle">
          <div className="space-y-12">
            <SectionTitle
              badge="Dịch vụ của chúng tôi"
              icon={Sparkles}
              title="Comprehensive"
              highlight="Solutions"
              description="Đây là khối tiêu đề chuẩn dùng cho mọi section: badge nhỏ phía trên, tiêu đề trắng + phần nhấn gradient, mô tả xám bên dưới."
            />
            <SectionTitle
              align="left"
              badge="Căn trái"
              icon={Zap}
              title="Về"
              highlight="iMob"
              description="Biến thể căn trái dùng cho section bố cục 2 cột."
            />
          </div>
        </DemoBlock>
      </Container>
    </div>
  );
}
