import { ArrowUpRight } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Anh from "../components/ui/Anh.jsx";
import { iconOf } from "../components/service/icons.js";
import duLieu from "../data/projects.json";

/* ================= Sản phẩm đã triển khai =================
   Năm sản phẩm THẬT trong ấn phẩm "iMob 2026 — Các sản phẩm nổi bật".

   Đặt ngay sau Hero, TRƯỚC cả phần Dịch vụ. Lý do: khách hàng lớn nhất của
   iMob là cơ quan nhà nước, và với nhóm khách đó câu hỏi đầu tiên luôn là
   "đã làm cho ai chưa". Yên Tử, Bảo tàng tỉnh, Đông Triều, An Sinh — trả lời
   được câu đó thì mọi lời tự giới thiệu phía sau mới có sức nặng.

   Bố cục kiểu Apple: sản phẩm đầu tiên chiếm trọn bề ngang như một "sản phẩm
   chủ lực", bốn cái còn lại xếp lưới 2×2 bên dưới. Cách này vừa xử lý gọn con
   số 5 lẻ (lưới 3 cột sẽ hụt mất một ô), vừa tạo được thứ bậc.

   Thẻ KHÔNG viền KHÔNG bóng — nền trắng đặt trên dải nền xám nhạt là đủ tách.

   ---- Ảnh và mã QR ----
   Ba trường `anh`, `qr`, `lienKet` trong data/projects.json đều CÓ THỂ ĐỂ
   TRỐNG. Trống thì phần tương ứng tự ẩn và thẻ trở về đúng dáng chữ-thuần như
   hiện nay; điền vào là tự hiện, không phải sửa file này. Component Anh còn
   tự biến mất nếu file ảnh không tải được, nên gõ nhầm tên file cũng không để
   lại ô ảnh vỡ giữa trang. */

const { danhSach: SAN_PHAM } = duLieu;

function TheSanPham({ sp, noiBat = false }) {
  const Icon = iconOf(sp.icon);
  // Có link thì cả thẻ bấm được; chưa có thì render div tĩnh.
  const Tag = sp.lienKet ? "a" : "div";

  return (
    <Tag
      href={sp.lienKet || undefined}
      target={sp.lienKet ? "_blank" : undefined}
      rel={sp.lienKet ? "noopener noreferrer" : undefined}
      className={
        "group flex h-full flex-col rounded-block bg-panel transition-colors duration-200 " +
        (sp.lienKet ? "hover:bg-brand-soft " : "") +
        (noiBat ? "p-8 sm:p-12" : "p-8")
      }
    >
      {/* Ảnh minh hoạ — chỉ hiện khi data có `anh` VÀ file tải được. */}
      <Anh
        src={sp.anh}
        alt={`Giao diện ${sp.title}`}
        boc="mb-7 overflow-hidden rounded-card bg-mist"
        className="aspect-[16/10] w-full object-cover"
      />

      {/* Loại sản phẩm + icon nhỏ đi kèm. Icon để nhỏ và nằm cùng dòng chữ chứ
          không đứng riêng một khối lớn: khi có ảnh thật ở trên, một icon to
          nữa là thừa; khi chưa có ảnh, dòng này vẫn đủ để thẻ không trống trải. */}
      <p className="flex items-center gap-2 text-sm font-semibold text-brand">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {sp.loai}
      </p>

      <h3
        className={
          "tieu-de-lon mt-2.5 text-ink " +
          (noiBat ? "text-[clamp(1.75rem,3.4vw,2.5rem)]" : "text-2xl")
        }
      >
        {sp.title}
      </h3>

      <p
        className={
          "mt-3 leading-relaxed text-ink-soft " +
          (noiBat ? "max-w-xl text-[1.0625rem]" : "text-[0.9375rem]")
        }
      >
        {sp.description}
      </p>

      {/* mt-auto: dòng khách hàng luôn nằm đáy thẻ, các thẻ cao khác nhau vẫn
          thẳng hàng nhau ở mép dưới. */}
      <p className="mt-auto pt-6 text-sm text-ink-faint">
        {sp.khachHang}
        {sp.lienKet && (
          <ArrowUpRight
            className="ml-1 inline h-4 w-4 text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </p>
    </Tag>
  );
}

/* ---------- Dải mã QR ----------
   CHỈ hiện từ màn hình lg trở lên. Lý do rất thực tế: mã QR trên website mở
   bằng điện thoại là vô dụng — không ai quét được màn hình của chính máy mình.
   Trên máy tính thì ngược lại, quét bằng điện thoại là cách nhanh nhất để mở
   ứng dụng Zalo. Khách dùng điện thoại đã có liên kết bấm thẳng ở mỗi thẻ.

   Ảnh QR KHÔNG nằm trong dữ liệu: nó sinh ra từ chính `lienKet` bằng lệnh
   `npm run qr` và luôn ở đường dẫn /qr/<id>.svg. Nhờ vậy địa chỉ chỉ tồn tại
   ở MỘT chỗ — đổi địa chỉ mà quên thay ảnh QR là chuyện không xảy ra được.

   Cả dải tự ẩn khi chưa sản phẩm nào có `lienKet`. */
function DaiMaQR({ danhSach }) {
  const coQR = danhSach.filter((sp) => sp.lienKet);
  if (coQR.length === 0) return null;

  return (
    <Reveal>
      <div className="hidden rounded-block bg-panel px-8 py-10 lg:block">
        <p className="text-center text-sm font-semibold text-ink-faint">
          Quét mã để mở ngay trên điện thoại
        </p>
        <ul className="mt-8 flex flex-wrap items-start justify-center gap-10">
          {coQR.map((sp) => (
            <li key={sp.id} className="w-36 text-center">
              <Anh
                src={`/qr/${sp.id}.svg`}
                alt={`Mã QR mở ${sp.title}`}
                boc="rounded-card bg-white p-2 ring-1 ring-line"
                className="aspect-square w-full object-contain"
              />
              <p className="mt-3 text-[0.8125rem] leading-snug text-ink-soft">
                {sp.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function Projects() {
  const [noiBat, ...conLai] = SAN_PHAM;

  return (
    <section id="projects" className="bg-mist py-24 lg:py-32">
      <Container className="space-y-14">
        <Reveal>
          <SectionTitle
            badge="Sản phẩm"
            title="Đã chạy thật,"
            highlight="ở Quảng Ninh."
            description="Chính quyền địa phương, khu di tích và thiết chế văn hoá của tỉnh đang dùng sản phẩm do iMob xây dựng."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Sản phẩm chủ lực chiếm trọn bề ngang */}
            <div className="sm:col-span-2">
              <TheSanPham sp={noiBat} noiBat />
            </div>
            {conLai.map((sp) => (
              <TheSanPham key={sp.id} sp={sp} />
            ))}
          </div>
        </Reveal>

        <DaiMaQR danhSach={SAN_PHAM} />
      </Container>
    </section>
  );
}
