import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import Container from "../ui/Container.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { openChat } from "../../utils/chatBus.js";
import { iconOf } from "./icons.js";

// Hiệu ứng vào (stagger) — dùng lại đúng nhịp của Hero trang chủ cho đồng bộ.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ServiceHero: đầu trang mỗi dịch vụ. Dòng dẫn + tiêu đề lớn + mô tả +
// vài điểm nổi bật + 2 nút.
//
// Bỏ lớp nền trang trí (lưới kỹ thuật + quầng sáng) như Hero trang chủ: nền
// phẳng tuyệt đối là thứ làm giao diện kiểu Apple sạch được.
// pt cao để chừa chỗ cho Navbar cố định phía trên.
export default function ServiceHero({
  badge,
  title,
  highlight,
  description,
  highlights = [],
}) {
  return (
    <section className="flex min-h-[80vh] items-center justify-center py-32 lg:py-40">
      <Container>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge>{badge}</Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="tieu-de-lon mt-5 text-[clamp(2.25rem,5.5vw,4.5rem)] text-ink"
          >
            {title} <span className="text-brand">{highlight}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-7 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft sm:text-[1.25rem]"
          >
            {description}
          </motion.p>

          {/* Vài điểm nổi bật dạng chip. Nền xám nhạt, không viền — cùng ngôn
              ngữ với thẻ nội dung ở các section bên dưới. */}
          {highlights.length > 0 && (
            <motion.ul
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
            >
              {highlights.map(({ icon, label }) => {
                const Icon = iconOf(icon);
                return (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-[0.8125rem] text-ink-soft"
                  >
                    <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                    {label}
                  </li>
                );
              })}
            </motion.ul>
          )}

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            {/* #contact = form Contact ở cuối chính trang này (không nhảy về trang chủ) */}
            <Button href="#contact" size="lg">
              Nhận tư vấn miễn phí
            </Button>
            <Button onClick={openChat} variant="outline" size="lg">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Chat với AI
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
