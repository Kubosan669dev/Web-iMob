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

          {/* ⚠️ TIÊU ĐỀ Ở ĐÂY PHẢI VIẾT THƯỜNG — xem _note đầu servicePages.json.
              Ba trang này từng để IN HOA TOÀN BỘ ("ĐÀO TẠO / CHUYỂN ĐỔI SỐ") và
              bị chồng dấu: chữ hoa tiếng Việt xếp tới hai dấu lên nhau (Ể = Ê +
              hỏi), cao vượt hẳn chữ Latin, mà lớp tieu-de-lon lại siết
              line-height xuống 1.08. Dấu hỏi của Ể tách rời khỏi chữ, dấu của Ổ
              đè lên dòng bên trên. Viết thường thì dấu nằm gọn trong khoảng
              trên của chữ, hai dòng cạnh nhau cũng không đụng.

              text-balance: chia chữ cho hai dòng đều nhau thay vì nhồi đầy dòng
              trên rồi bỏ một từ lẻ xuống dòng dưới. Không có nó thì ở 1280px
              tiêu đề ngắt thành "Phát triển Zalo Mini / App" và "Phần mềm &
              phần / cứng" — cắt đứt giữa cụm từ, đọc rất khó chịu. */}
          <motion.h1
            variants={fadeUp}
            className="tieu-de-lon mt-5 text-balance text-[clamp(2.25rem,5.5vw,4.5rem)] text-ink"
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
