import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Anh from "../components/ui/Anh.jsx";
import { useHero, useCongTy } from "../context/NoiDungContext.jsx";
import { openChat } from "../utils/chatBus.js";

/* ================= Entrance animation ================= */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ================= RotatingWord =================
   Từ ở giữa dòng tiêu đề tự đổi liên tục (chính quyền số → doanh nghiệp → ...).
   Danh sách từ do trang /admin quyết định (tab Hero) — truyền vào qua prop chứ
   không đọc cứng, để sửa trong admin là đổi ngay.

   ---- Vì sao có LỚP GIỮ CHỖ (sửa 17/08/2026) ----
   Bản trước chỉ có đúng một <span> chứa từ đang hiện. Hai lỗi kéo theo:

   1. `mode="wait"` gỡ từ CŨ ra rồi mới gắn từ MỚI. Trong khoảng giữa, khung
      rỗng hoàn toàn → dòng chữ tụt lên rồi rơi xuống. Đây là cái "nhếch lên
      một chút" nhìn thấy được.
   2. Mỗi từ có chiều cao thật khác nhau vì dấu tiếng Việt: "chính quyền số"
      có dấu sắc/huyền vươn lên, "doanh nghiệp" có dấu nặng thụt xuống. Cộng
      với `align-top`, mỗi lần đổi từ là chiều cao dòng đổi theo.

   Cách chữa: xếp CHỒNG toàn bộ các từ vào cùng MỘT ô lưới (col-start-1
   row-start-1). Các bản sao vô hình luôn có mặt nên ô lưới luôn lấy kích thước
   của từ RỘNG NHẤT và CAO NHẤT — đo bằng chữ thật chứ không đoán theo số ký
   tự. Từ đang hiện nằm chồng lên cùng ô đó và chỉ chạy `transform`, mà
   transform thì không đụng tới bố cục. Kết quả: khung đứng yên tuyệt đối, chỉ
   có chữ trượt.

   Đổi lại: chiều rộng khung luôn bằng từ dài nhất, nên từ ngắn sẽ có khoảng
   trống hai bên. Ở tiêu đề căn giữa thì đó lại là điểm cộng — dòng chữ không
   co giãn ngang mỗi lần đổi từ nữa.

   y dùng đơn vị "em" để bước trượt co giãn theo cỡ chữ khổng lồ của hero. */
function RotatingWord({ tu }) {
  const [index, setIndex] = useState(0);
  // Rỗng thì vẫn phải có một từ, không thì tiêu đề trang chủ hụt mất một dòng.
  const danhSach = tu?.length ? tu : ["chính quyền số"];

  useEffect(() => {
    // Danh sách đổi (vừa tải xong nội dung từ API) -> quay lại từ đầu, tránh
    // index cũ trỏ ra ngoài mảng mới.
    setIndex(0);
    if (danhSach.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % danhSach.length),
      2600
    );
    return () => clearInterval(timer);
  }, [danhSach.length]);

  const tuHienTai = danhSach[index % danhSach.length];

  return (
    <span className="inline-grid text-brand">
      {/* Lớp giữ chỗ — vô hình nhưng vẫn chiếm chỗ (visibility: hidden, KHÔNG
          phải display: none). aria-hidden để trình đọc màn hình không đọc lặp
          lại cả danh sách từ. */}
      {danhSach.map((t) => (
        <span
          key={`cho-${t}`}
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 whitespace-nowrap"
        >
          {t}
        </span>
      ))}

      {/* Lớp hiển thị — nằm chồng đúng ô đó. Không bao giờ lớn hơn lớp giữ chỗ
          (nó là một trong các từ đã tính ở trên) nên không làm khung đổi cỡ. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={tuHienTai}
          initial={{ opacity: 0, y: "0.28em" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-0.28em" }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="col-start-1 row-start-1 whitespace-nowrap"
        >
          {tuHienTai}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ================= Hero =================
   Dựng lại theo cách apple.com mở đầu một trang: CĂN GIỮA, chữ khổng lồ,
   nền phẳng tuyệt đối, một câu phụ, hai nút. Hết. Không lưới, không quầng
   sáng, không hạt bay, không khối minh hoạ bên cạnh.

   Bỏ hết lớp nền trang trí là thay đổi lớn nhất so với các bản trước, và cũng
   là thứ khiến trang Apple trông sạch. Khi không còn gì để nhìn ngoài chữ,
   chữ buộc phải nói được điều đáng nói — nên tiêu đề phải là định vị thật:
   iMob làm công nghệ cho CẢ chính quyền lẫn doanh nghiệp, ngay tại Quảng Ninh.

   Dưới cùng là dòng sứ mệnh thật của công ty, cỡ nhỏ, màu nhạt — kiểu chú
   thích chân màn hình mà Apple hay dùng. */
export default function Hero() {
  const hero = useHero();
  const congTy = useCongTy();

  return (
    <section
      id="home"
      className="flex min-h-[92vh] items-center justify-center py-32 lg:py-40"
    >
      <Container>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge>{hero.badge}</Badge>
          </motion.div>

          {/* Cỡ chữ co theo bề rộng màn hình: 2.5rem trên điện thoại →
              5.5rem trên màn hình rộng. `tieu-de-lon` siết khoảng cách chữ cái
              (xem ghi chú của utility đó trong styles/index.css). */}
          <motion.h1
            variants={fadeUp}
            className="tieu-de-lon mt-5 text-[clamp(2.5rem,6.5vw,5.5rem)] text-ink"
          >
            {hero.tieuDeTruoc}
            <br />
            <RotatingWord tu={hero.tuKhoaDong} />
            <br />
            {hero.tieuDeSau}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-7 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft sm:text-[1.3125rem]"
          >
            {hero.moTa}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button href="#contact" size="lg">
              {hero.nutChinh}
            </Button>
            <Button onClick={openChat} variant="outline" size="lg">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {hero.nutPhu}
            </Button>
          </motion.div>

          {/* Ảnh minh hoạ dưới lời kêu gọi — đúng chỗ apple.com đặt ảnh sản
              phẩm. Để trống trường `anh` trong /admin thì khối này tự ẩn và
              Hero trở về đúng dáng chữ-thuần; component Anh còn tự biến mất
              nếu file không tải được, nên không bao giờ lòi ra ô ảnh vỡ. */}
          <motion.div variants={fadeUp}>
            <Anh
              src={hero.anh}
              alt={hero.anhMoTa || ""}
              boc="mx-auto mt-16 max-w-4xl overflow-hidden rounded-block"
              className="w-full"
            />
          </motion.div>

          {/* Sứ mệnh — lấy từ company.json, cùng nguồn với chatbot.
              `?.` phòng trường hợp database đã seed bản company cũ chưa có
              trường này: thiếu thì cả dòng biến mất, không vỡ trang. */}
          {congTy.suMenh && (
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-14 max-w-md text-sm leading-relaxed text-ink-faint"
            >
              {congTy.suMenh}
            </motion.p>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
