import { motion } from "motion/react";
import { Zap, ArrowRight, MessageCircle } from "lucide-react";
import Container from "../ui/Container.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import AnimatedGridBackground from "../ui/AnimatedGridBackground.jsx";
import { openChat } from "../../utils/chatBus.js";
import { iconOf } from "./icons.js";

// Hiệu ứng vào (stagger) — dùng lại đúng nhịp của Hero trang chủ cho đồng bộ.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

// ServiceHero: đầu trang mỗi dịch vụ. Badge + tiêu đề lớn (dòng thường +
// dòng gradient) + mô tả + 4 điểm nổi bật nhỏ + 2 nút CTA.
// pt cao để chừa chỗ cho Navbar cố định phía trên.
export default function ServiceHero({
  badge,
  title,
  highlight,
  description,
  highlights = [],
}) {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      <AnimatedGridBackground />

      <Container className="relative z-10 py-28 lg:py-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl space-y-7 text-center"
        >
          <motion.div variants={fadeUp} className="flex justify-center">
            <Badge icon={Zap}>{badge}</Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl"
          >
            {title} <span className="text-gradient">{highlight}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg"
          >
            {description}
          </motion.p>

          {/* 4 điểm nổi bật nhỏ dạng chip icon + chữ */}
          {highlights.length > 0 && (
            <motion.ul
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center gap-2.5"
            >
              {highlights.map(({ icon, label }) => {
                const Icon = iconOf(icon);
                return (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-gray-300"
                  >
                    <Icon className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                    {label}
                  </li>
                );
              })}
            </motion.ul>
          )}

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            {/* #contact = form Contact ở cuối chính trang này (không nhảy về trang chủ) */}
            <Button href="#contact" size="lg">
              Bắt đầu dự án <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button onClick={openChat} variant="outline" size="lg">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat AI
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
