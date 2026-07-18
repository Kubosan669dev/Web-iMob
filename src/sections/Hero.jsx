import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Zap, ArrowRight, MessageCircle, Cpu, Cloud, Wifi } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import AnimatedGridBackground from "../components/ui/AnimatedGridBackground.jsx";
import { SITE } from "../utils/constants.js";
import { openChat } from "../utils/chatBus.js";

/* ================= Entrance animation (stagger) ================= */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

/* ================= TerminalCard =================
   Giả lập terminal boot: từng dòng log hiện dần (timer),
   xong hết → hiện "SYSTEM ONLINE" + chips trạng thái.  */
const BOOT_LINES = [
  "Khởi tạo hệ thống...",
  "Nạp modules AI...",
  "Kết nối mạng lưới...",
  "Đồng bộ cloud...",
];

const STATUS_CHIPS = [
  { icon: Cpu, label: "AI PROCESSING", color: "text-blue-400" },
  { icon: Cloud, label: "CLOUD SYNC", color: "text-purple-400" },
  { icon: Wifi, label: "IOT NETWORK", color: "text-cyan-400" },
];

function TerminalCard() {
  // Số dòng log đang hiển thị; tăng dần mỗi 550ms cho tới hết
  const [visibleCount, setVisibleCount] = useState(0);
  const booted = visibleCount >= BOOT_LINES.length;

  useEffect(() => {
    if (booted) return;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 550);
    return () => clearTimeout(timer);
  }, [visibleCount, booted]);

  return (
    <div className="relative">
      {/* Glow phía sau card */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-600/25 via-purple-600/15 to-cyan-500/20 blur-2xl animate-glow-pulse"
      />

      <div className="glass relative animate-float rounded-2xl font-mono text-sm shadow-2xl shadow-black/40">
        {/* Title bar kiểu macOS */}
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <p className="ml-3 text-xs text-gray-500">imob@system: ~</p>
        </div>

        {/* Body */}
        <div className="space-y-2.5 px-5 py-5">
          <p className="text-cyan-300">
            <span className="text-purple-400">$</span> imob --status
          </p>

          {BOOT_LINES.slice(0, visibleCount).map((line) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-gray-400"
            >
              <span className="text-green-400">✓</span> {line}
            </motion.p>
          ))}

          {booted && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 pt-1 font-semibold text-cyan-300"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                </span>
                SYSTEM ONLINE
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500"
              >
                <span className="animate-pulse text-purple-400">▊</span> Sẵn
                sàng nhận lệnh của bạn...
              </motion.p>
            </>
          )}
        </div>

        {/* Chips trạng thái */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-5 py-4">
          {STATUS_CHIPS.map(({ icon: Icon, label, color }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold tracking-wider text-gray-300"
            >
              <Icon className={`h-3 w-3 ${color}`} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= Hero ================= */
export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <AnimatedGridBackground />

      <Container className="relative z-10 grid items-center gap-14 py-28 lg:grid-cols-2 lg:gap-10 lg:py-32">
        {/* ---------- Cột trái ---------- */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-7 text-center lg:text-left"
        >
          <motion.div variants={fadeUp}>
            <Badge icon={Zap}>Giải pháp số thế hệ mới</Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl xl:text-7xl"
          >
            DIGITAL
            <br />
            <span className="text-gradient">FUTURE</span>
            <br />
            STARTS HERE
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg lg:mx-0"
          >
            {SITE.description}. Chúng tôi thiết kế và triển khai giải pháp phần
            mềm, ứng dụng và AI — đồng hành từ ý tưởng đến vận hành.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Button href="#contact" size="lg">
              Liên hệ <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button onClick={openChat} variant="outline" size="lg">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat AI
            </Button>
          </motion.div>
        </motion.div>

        {/* ---------- Cột phải: terminal ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.35, ease: "easeOut" }}
          className="mx-auto w-full max-w-lg lg:max-w-none"
        >
          <TerminalCard />
        </motion.div>
      </Container>
    </section>
  );
}
