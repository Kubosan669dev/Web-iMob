import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Package, Phone } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Button from "../components/ui/Button.jsx";
import Anh from "../components/ui/Anh.jsx";
import MaQR from "../components/ui/MaQR.jsx";
import { iconOf } from "../components/service/icons.js";
import useManHinhRong from "../hooks/useManHinhRong.js";
import { useHero, useCongTy, useSanPham } from "../context/NoiDungContext.jsx";
import { demSoLieu } from "../utils/soLieu.js";
import { openChat } from "../utils/chatBus.js";
import services from "../data/services.json";

/* ================= RotatingWord =================
   Từ ở giữa dòng tiêu đề tự đổi liên tục (chính quyền số → doanh nghiệp → ...).
   Danh sách từ do trang /admin quyết định (tab Hero) — truyền vào qua prop chứ
   không đọc cứng, để sửa trong admin là đổi ngay.

   ---- Vì sao có LỚP GIỮ CHỖ ----
   Bản trước chỉ có đúng một <span> chứa từ đang hiện. Hai lỗi kéo theo:

   1. `mode="wait"` gỡ từ CŨ ra rồi mới gắn từ MỚI. Trong khoảng giữa, khung
      rỗng hoàn toàn → dòng chữ tụt lên rồi rơi xuống.
   2. Mỗi từ có chiều cao thật khác nhau vì dấu tiếng Việt: "chính quyền số"
      có dấu sắc/huyền vươn lên, "doanh nghiệp" có dấu nặng thụt xuống.

   Cách chữa: xếp CHỒNG toàn bộ các từ vào cùng MỘT ô lưới (col-start-1
   row-start-1). Các bản sao vô hình luôn có mặt nên ô lưới luôn lấy kích thước
   của từ RỘNG NHẤT và CAO NHẤT — đo bằng chữ thật chứ không đoán theo số ký
   tự. Từ đang hiện nằm chồng lên cùng ô đó và chỉ chạy `transform`, mà
   transform thì không đụng tới bố cục.

   `lop` truyền từ ngoài vào vì tiêu đề giờ nằm TRÊN DẢI MÀU THƯƠNG HIỆU — để
   nguyên `text-brand` như bản cũ là chữ tím trên nền tím, mất hút. Hero truyền
   vào cỡ chữ chứ không truyền màu, để từ khoá thừa hưởng màu của cả tiêu đề. */
function RotatingWord({ tu, lop = "text-brand" }) {
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
    <span className={`inline-grid ${lop}`}>
      {danhSach.map((t) => (
        <span
          key={`cho-${t}`}
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 whitespace-nowrap"
        >
          {t}
        </span>
      ))}

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

/* ================= Một dòng trong cột điều hướng ================= */
function DongMuc({ muc }) {
  const Icon = muc.icon;
  const ruot = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
        <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.9375rem] font-medium text-ink">{muc.nhan}</span>
        <span className="block truncate text-[0.8125rem] text-ink-soft">{muc.phu}</span>
      </span>
      {muc.so != null && (
        <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
          {muc.so}
        </span>
      )}
      <ChevronRight
        className="h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand"
        aria-hidden="true"
      />
    </>
  );

  const lop =
    "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-mist";

  if (muc.bam) {
    return (
      <li>
        <button type="button" onClick={muc.bam} className={lop}>
          {ruot}
        </button>
      </li>
    );
  }
  return (
    <li>
      <Link to={muc.den} className={lop}>
        {ruot}
      </Link>
    </li>
  );
}

/* ================= Hero =================
   DỰNG LẠI 18/08/2026 theo góp ý: "một ông chủ bận rộn vào 30 giây là hiểu
   hết", và "chào hàng lần đầu thì 4–5 slide là tối đa, không phải hồ sơ năng
   lực 20 trang".

   Bản trước là một màn hình chữ căn giữa kiểu apple.com: đẹp, nhưng cả khung
   hình đầu chỉ nói được đúng một câu định vị. Khách muốn biết iMob làm gì, đã
   làm cho ai, liên hệ ra sao thì phải cuộn qua năm khối nữa.

   Bố cục mới học đúng CƠ CHẾ của trang chủ TopCV: dải màu thương hiệu ở trên,
   một thẻ trắng lớn đè lên nó, trong thẻ là cột danh mục để khách TỰ CHỌN
   đường đi. Ai quan tâm mục nào thì bấm đi tiếp; ai không thì dừng ở đây vẫn
   đọc được đủ: làm gì, đã chạy ở đâu, gọi số nào.

   KHÔNG bê nguyên ô tìm kiếm của TopCV. TopCV có hàng chục nghìn tin tuyển
   dụng nên ô tìm kiếm là thứ đáng đặt to nhất; iMob có 6 sản phẩm, dựng ô tìm
   kiếm ở đây là dựng một cái ô rỗng. Chỗ đó thay bằng hàng hành động thật:
   khảo sát miễn phí · chat AI · số hotline bấm gọi được. */
export default function Hero() {
  const hero = useHero();
  const congTy = useCongTy();
  const sanPham = useSanPham();
  const rong = useManHinhRong();

  const soLieu = demSoLieu(sanPham);
  const noiBat = sanPham[0]; // sản phẩm chủ lực = sản phẩm đầu danh sách trong /admin

  // Cột danh mục = đúng mục lục của bộ "slide" trang chủ. Không có file dữ
  // liệu riêng cho nó: sản phẩm đếm từ CMS, ba dịch vụ lấy từ services.json.
  // Thêm một nguồn nữa chỉ là thêm một chỗ để quên cập nhật.
  const MUC = [
    {
      nhan: "Sản phẩm đã chạy thật",
      phu: sanPham
        .slice(0, 3)
        .map((s) => s.khachHang || s.title)
        .join(" · "),
      so: soLieu.sanPham,
      den: "/#projects",
      icon: Package,
    },
    ...services.map((dv) => ({
      nhan: dv.title,
      phu: dv.features?.[0] ?? "",
      den: dv.route,
      icon: iconOf(dv.icon),
    })),
    {
      nhan: "Trợ lý AI",
      phu: "Hỏi thử ngay — trả lời trong vài giây",
      bam: openChat,
      icon: MessageCircle,
    },
  ];

  return (
    <section id="home" className="relative">
      {/* ---------- Dải màu thương hiệu ----------
          Chiều cao chạy THEO NỘI DUNG chứ không đặt cứng: tiêu đề xuống dòng
          khác nhau ở mỗi bề ngang màn hình, đặt cứng thì có cỡ máy nào đó dải
          màu kết thúc ngay trên mép thẻ trắng, để lại một vệt hở nhìn thấy rõ.
          pb-28 + -mt-24 bên dưới cho thẻ luôn đè lên dải đúng 24 đơn vị. */}
      {/* pt- phải LỚN HƠN chiều cao thanh điều hướng: Navbar là `fixed` nên nó
          không chiếm chỗ trong dòng chảy, nội dung nào bắt đầu quá cao sẽ chui
          xuống dưới nó. Thanh đó cao 3.5rem trên điện thoại, và 5.5rem từ 640px
          trở lên (có thêm dải liên hệ ở trên). Sửa chiều cao Navbar thì phải
          sửa cả đây. */}
      <div className="bg-brand pb-28 pt-20 sm:pt-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-tren-brand/75">{hero.badge}</p>

            {/* ---------- Tiêu đề: NỔI BẬT BẰNG CỠ CHỮ, không bằng hộp ----------
                Đã thử bọc từ khoá trong một ô nền sáng cho nổi rồi bỏ: cả hệ
                thiết kế này đang cố giảm số hộp và số đường kẻ xuống ít nhất có
                thể, nhét một cái hộp to vào giữa tiêu đề là chọi hẳn với phần
                còn lại của trang.

                Đổi màu chữ cũng không được: trên dải màu thương hiệu chỉ có
                ĐÚNG MỘT màu chữ đọc được (--color-tren-brand, đã đo tương phản
                cho cả 9 bảng màu). Màu nào khác cũng hoặc chìm vào nền, hoặc
                hụt chuẩn ở một trong 9 bảng.

                Còn lại là thứ khỏi phải xin phép ai: THỨ BẬC CỠ CHỮ. "Công nghệ
                cho" và "ở Quảng Ninh." chỉ là chữ nối — cho nhỏ lại. Từ khoá to
                gấp hơn hai lần, và nó lại là thứ duy nhất chuyển động.

                BA DÒNG XẾP CHỒNG chứ không viết liền một câu: RotatingWord có
                lớp giữ chỗ nên bề rộng của nó LUÔN bằng từ dài nhất. Nằm giữa
                câu thì từ ngắn để hở hai khoảng trắng to hai bên; đứng riêng
                một dòng căn giữa thì phần thừa đó thành lề, không ai thấy. */}
            <h1 className="mt-4 text-tren-brand">
              <span className="block text-[clamp(1.0625rem,2vw,1.5rem)] font-medium tracking-tight">
                {hero.tieuDeTruoc}
              </span>

              <span className="mt-1.5 block">
                <RotatingWord
                  tu={hero.tuKhoaDong}
                  lop="tieu-de-lon text-[clamp(2.125rem,5vw,3.75rem)]"
                />
              </span>

              <span className="mt-1.5 block text-[clamp(1.0625rem,2vw,1.5rem)] font-medium tracking-tight">
                {hero.tieuDeSau}
              </span>
            </h1>

            {/* max-w hẹp hơn tiêu đề: một dòng văn xuôi dài quá 65-70 ký tự là
                mắt khó bắt được đầu dòng kế tiếp. */}
            <p className="mx-auto mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-tren-brand/75 sm:text-base">
              {hero.moTa}
            </p>
          </div>
        </Container>
      </div>

      {/* ---------- Thẻ trắng: ruột của khung hình đầu ---------- */}
      <Container className="relative -mt-24 pb-16 lg:pb-20">
        <div className="rounded-block bg-panel p-3 shadow-lift sm:p-4">
          {/* Hàng hành động — đúng vị trí ô tìm kiếm của TopCV.
              Số hotline để thẻ <a href="tel:"> chứ không phải chữ thường: trên
              điện thoại chạm là gọi luôn, khỏi phải chép tay. */}
          <div className="flex flex-wrap items-center gap-2.5 rounded-card bg-mist px-3 py-3 sm:px-4">
            <p className="mr-1 text-sm font-medium text-ink-soft">Bạn đang cần gì?</p>
            <Button href="#contact">{hero.nutChinh}</Button>
            <Button variant="outline" onClick={openChat}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {hero.nutPhu}
            </Button>
            <a
              href={`tel:${(congTy.phone ?? "").replace(/\s/g, "")}`}
              className="ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.9375rem] font-semibold text-brand transition-colors hover:bg-brand-soft"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {congTy.phone}
            </a>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,23rem)_1fr]">
            {/* ---------- Cột trái: danh mục tự chọn đường đi ---------- */}
            <ul className="space-y-0.5">
              {MUC.map((m) => (
                <DongMuc key={m.nhan} muc={m} />
              ))}
            </ul>

            {/* ---------- Cột phải ----------
                Ưu tiên ảnh banner nếu /admin có điền (đúng chỗ TopCV để banner
                quảng cáo). Chưa có ảnh thì đứng thay là SẢN PHẨM CHỦ LỰC — thứ
                thật, mở ra dùng được ngay, chứ không phải một ảnh minh hoạ mua
                sẵn về để lấp chỗ trống. */}
            {hero.anh ? (
              <Anh
                src={hero.anh}
                alt={hero.anhMoTa || ""}
                boc="overflow-hidden rounded-card bg-mist"
                className="h-full w-full object-cover"
              />
            ) : (
              noiBat && (
                <div className="flex flex-col justify-between rounded-card bg-brand-soft p-6 sm:p-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                      Sản phẩm chủ lực · đang chạy thật
                    </p>
                    <h2 className="tieu-de-lon mt-3 text-[clamp(1.5rem,2.6vw,2rem)] text-ink">
                      {noiBat.title}
                    </h2>
                    <p className="mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
                      {noiBat.description}
                    </p>
                    <p className="mt-3 text-sm text-ink-faint">{noiBat.khachHang}</p>
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-5">
                    {noiBat.lienKet && (
                      <Button
                        href={noiBat.lienKet}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Mở thử ngay
                      </Button>
                    )}

                    {/* Mã QR chỉ trên máy tính — xem lý do trong
                        hooks/useManHinhRong.js */}
                    {rong && noiBat.lienKet && (
                      <div className="text-center">
                        <div className="rounded-xl bg-white p-1.5">
                          <MaQR
                            noiDung={noiBat.lienKet}
                            alt={`Mã QR mở ${noiBat.title}`}
                            className="h-24 w-24"
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-ink-faint">Quét bằng điện thoại</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* ---------- Số liệu ----------
            ĐẾM từ danh sách sản phẩm, không gõ tay (xem utils/soLieu.js).
            Đặt ngay dưới thẻ để người dừng lại ở khung hình đầu vẫn nắm được
            quy mô, khỏi phải cuộn xuống mới biết. */}
        <p className="mt-5 text-center text-sm text-ink-soft">
          <span className="font-semibold text-ink">{soLieu.sanPham} sản phẩm</span> đang
          chạy cho{" "}
          <span className="font-semibold text-ink">{soLieu.donVi} cơ quan, đơn vị</span>{" "}
          tại Quảng Ninh · {soLieu.nhom} nhóm giải pháp
        </p>
      </Container>
    </section>
  );
}
