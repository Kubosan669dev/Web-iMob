import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Bot,
  ChevronRight,
  GraduationCap,
  MessageCircle,
  MonitorSmartphone,
  Package,
  Phone,
  PlaneTakeoff,
  Radar,
  ShieldCheck,
} from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Button from "../components/ui/Button.jsx";
import Anh from "../components/ui/Anh.jsx";
import SlideSanPham from "../components/ui/SlideSanPham.jsx";
import { useHero, useCongTy, useSanPham } from "../context/NoiDungContext.jsx";
import { danhSachDonVi } from "../utils/soLieu.js";
import { openChat } from "../utils/chatBus.js";

/* ================= DaiCongNghe =================
   Dòng liệt kê các mảng công nghệ của iMob, hiện HẾT cùng lúc và sáng dần từng
   cụm một.

   Thay cho RotatingWord (một từ đổi liên tục) của bản trước. Văn bản góp ý
   19/08/2026 chê thẳng: "nhìn vào cũng chưa biết đc công nghệ của iMob là gì".
   Đúng — cho xem mỗi lần một từ thì khách phải đứng đợi đủ một vòng mới biết
   công ty làm những gì, mà không ai đợi cả. Liệt kê hết là trả lời được ngay
   câu hỏi đó trong một cái liếc mắt.

   Vẫn giữ chuyển động, chỉ đổi vai: thay vì thay chữ, nó DI CHUYỂN SỰ CHÚ Ý
   qua từng mảng. Được cả hai — vừa đọc được toàn bộ, vừa có nhịp cho mắt bám.

   ---- Vì sao làm nổi bằng ĐỘ MỜ chứ không bằng MÀU ----
   Dải này nằm trên nền màu thương hiệu, mà ở đó chỉ có ĐÚNG MỘT màu chữ đọc
   được (--color-tren-brand, đã đo tương phản cho cả 9 bảng màu). Đổi màu là
   hoặc chìm vào nền, hoặc hụt chuẩn ở một bảng nào đó. Độ mờ + độ đậm thì
   bảng màu nào cũng đúng.

   Người bật "giảm chuyển động" thì hiện tất cả ở mức sáng nhất, không chạy. */
function DaiCongNghe({ tu }) {
  const danhSach = tu?.length ? tu : ["AI", "Zalo Mini App", "Website"];
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (reduceMotion || danhSach.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % danhSach.length),
      1800
    );
    return () => clearInterval(timer);
  }, [danhSach.length, reduceMotion]);

  return (
    <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[clamp(0.8125rem,1.5vw,1.0625rem)] font-medium text-tren-brand">
      {danhSach.map((t, n) => (
        <span key={t} className="flex items-center gap-3">
          {n > 0 && (
            <span className="text-tren-brand/35" aria-hidden="true">
              •
            </span>
          )}
          <span
            className={
              "transition-opacity duration-500 " +
              (reduceMotion || n === index ? "opacity-100" : "opacity-55")
            }
          >
            {t}
          </span>
        </span>
      ))}
    </p>
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
      <ChevronRight
        className="h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand"
        aria-hidden="true"
      />
    </>
  );

  const lop =
    "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-mist";

  if (muc.bam) {
    return (
      <li>
        <button type="button" onClick={muc.bam} className={lop}>
          {ruot}
        </button>
      </li>
    );
  }

  // NEO TRONG CÙNG TRANG PHẢI DÙNG <a>, KHÔNG DÙNG <Link>.
  // <Link to="/#projects"> khi đang đứng ở trang chủ chỉ đổi hash trên URL:
  // React Router không tự cuộn tới neo, mà ScrollToTop thì cố ý bỏ qua khi có
  // hash — kết quả là bấm vào không có gì xảy ra. Thẻ <a> để trình duyệt tự lo
  // việc cuộn, đúng cách thanh menu trên cùng đang làm (Navbar.jsx). Khoảng
  // hụt do thanh menu che đã có `section[id] { scroll-margin-top }` trong
  // styles/index.css xử lý.
  const trongTrang = muc.den.startsWith("#") || muc.den.startsWith("/#");

  return (
    <li>
      {trongTrang ? (
        <a href={muc.den} className={lop}>
          {ruot}
        </a>
      ) : (
        <Link to={muc.den} className={lop}>
          {ruot}
        </Link>
      )}
    </li>
  );
}

/* ================= Cột danh mục =================
   BẢY MỤC do công ty chốt (18/08/2026) — đây là danh mục chào hàng chính thức,
   không phải ba dịch vụ cũ trong services.json nữa.

   ⚠️ CHỮ LẤY NGUYÊN VĂN TỪ FILE "Cac san pham noi bat trong nam.docx"
   (20/08/2026). Anh Việt nhắn: "7 mục anh kê ở đây là anh đã chọn từ ngữ phù
   hợp rồi, em giữ nguyên từ đấy đưa vào nhé đừng chỉnh lại". Bản trước tôi tự
   rút gọn cho vừa một dòng — nay trả lại đúng câu của công ty. Chỉ bỏ dấu
   chấm/hai chấm cuối câu vì đây là danh sách điều hướng, không đổi một chữ nào.

   Ba mục có câu dài (3, 4, 7) thì BỎ dòng phụ: câu gốc đã nói đủ ý, thêm dòng
   phụ do tôi tự viết vào nữa là vừa thừa vừa trái lời dặn. Bốn mục còn lại câu
   ngắn nên giữ dòng phụ làm rõ thêm.

   ⚠️ MỤC 3 VÀ 7 dùng cụm "an toàn an ninh mạng cấp độ 2". Cấp độ 1–5 thuộc
   Luật An toàn thông tin mạng 2015, KHÔNG thuộc Luật An ninh mạng 2018 — tôi
   đã sửa chỗ khác trong ngày theo chính góp ý 09:22 của anh Việt về dùng từ
   đúng chuyên môn. Ở đây giữ nguyên vì anh dặn đừng chỉnh. Công ty chốt lại
   thì sửa cả hai nơi cho khớp.

   ⚠️ BỐN MỤC CHƯA CÓ TRANG RIÊNG — an toàn thông tin, robot/UAV/Drone, giám
   sát 24/7 — nên tạm dẫn về form Liên hệ. Đó là đích ĐÚNG cho dịch vụ phải
   khảo sát trước khi báo giá, nhưng nếu muốn mỗi mục một trang như ba dịch vụ
   cũ thì phải có nội dung thật cho từng mục; tôi không tự viết được vì không
   kiểm chứng được năng lực cụ thể của công ty ở ba mảng đó. */
const MUC = [
  {
    nhan: "Các sản phẩm nổi bật trong năm",
    phu: "Đã bàn giao và đang chạy tại Quảng Ninh",
    den: "/#projects",
    icon: Package,
  },
  {
    nhan: "Thiết kế app/web theo yêu cầu",
    phu: "Zalo Mini App · website · phần mềm quản lý",
    den: "/#services",
    icon: MonitorSmartphone,
  },
  {
    nhan: "Khảo sát và nâng cấp app/web, phần mềm đang có lên chuẩn an toàn an ninh mạng cấp độ 2 trở lên",
    den: "/#contact",
    icon: ShieldCheck,
  },
  {
    nhan: "Ứng dụng các loại robot tuần tra/lễ tân, UAV, Drone theo yêu cầu",
    den: "/#contact",
    icon: PlaneTakeoff,
  },
  {
    nhan: "Tập huấn chuyển đổi số",
    phu: "Chương trình đào tạo theo từng đơn vị",
    den: "/digital-transformation",
    icon: GraduationCap,
  },
  {
    nhan: "Xây dựng trợ lý AI doanh nghiệp",
    phu: "Bấm thử chính trợ lý đang chạy trên trang này",
    bam: openChat,
    icon: Bot,
  },
  {
    nhan: "Vận hành, ứng cứu sự cố an toàn an ninh mạng và hỗ trợ tư vấn an ninh mạng, giám sát 24/7 không cần xây dựng đội ngũ nội bộ",
    den: "/#contact",
    icon: Radar,
  },
];


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
   dụng nên ô tìm kiếm là thứ đáng đặt to nhất; ở đây không có kho gì để tìm,
   dựng ô tìm kiếm là dựng một cái ô rỗng. Chỗ đó thay bằng hàng hành động thật:
   khảo sát miễn phí · chat AI · số hotline bấm gọi được. */
export default function Hero() {
  const hero = useHero();
  const congTy = useCongTy();
  const sanPham = useSanPham();
  const donVi = danhSachDonVi(sanPham);

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
      <div className="bg-brand pb-28 pt-24 sm:pt-28">
        <Container>
          {/* max-w-5xl chứ không phải max-w-3xl như bản trước.
              Góp ý 19/08/2026 chê đúng chỗ này: "cái phần đó to như vậy mà e k
              phóng to chữ ra, để thừa 2 bên, xong chữ ở giữa thì bé tí". */}
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-tren-brand/70 sm:text-sm">
              {hero.badge}
            </p>

            {/* ---------- Tiêu đề ----------
                Viết theo đúng mẫu công ty đưa trong văn bản góp ý:

                    iMob Solution & Technology
                    Kiến tạo hệ sinh thái số
                    cho doanh nghiệp & chính quyền
                    AI • Zalo Mini App • GIS • Website • IoT • Digital Platform

                ĐÃ BỎ cụm "ở Quảng Ninh" khỏi tiêu đề (công ty chốt 19/08/2026):
                người ngoài tỉnh nhìn vào tưởng iMob chỉ làm cho đơn vị trong
                Quảng Ninh nên tự loại mình. Bằng chứng thật về Quảng Ninh không
                mất đi — nó chuyển xuống dòng "Được tin tưởng bởi..." ở cuối thẻ
                trắng, chỗ đó là chứng minh năng lực chứ không phải giới hạn
                phạm vi.

                Hai dòng đều to, dòng dưới nhỏ hơn một bậc: dòng trên là việc
                iMob làm, dòng dưới là làm cho ai. */}
            <h1 className="mt-5 text-tren-brand">
              <span className="tieu-de-lon block text-[clamp(2rem,6vw,4.25rem)]">
                {hero.tieuDeTruoc}
              </span>
              <span className="tieu-de-lon mt-1.5 block text-[clamp(1.375rem,4vw,2.75rem)] text-tren-brand/90">
                {hero.tieuDeSau}
              </span>
            </h1>

            <DaiCongNghe tu={hero.tuKhoaDong} />

            {/* max-w hẹp hơn tiêu đề: một dòng văn xuôi dài quá 65-70 ký tự là
                mắt khó bắt được đầu dòng kế tiếp. */}
            <p className="mx-auto mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-tren-brand/75 sm:text-base">
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

          {/* ⚠️ grid-cols-[minmax(0,1fr)] KHÔNG PHẢI thừa — đừng rút gọn.
              Ô lưới mặc định rộng tối thiểu bằng "min-content" của thứ nằm
              trong. Dòng mô tả trong DongMuc dùng class `truncate`, mà
              `truncate` kèm luôn `white-space: nowrap`, nên min-content của nó
              là ĐỘ DÀI CẢ CÂU chứ không phải một chữ. Kết quả: trên điện thoại
              rộng 390px, cả trang bị kéo rộng 509px và trôi ngang.
              Đo được bằng cách nạp trang vào iframe 390px rồi đọc scrollWidth —
              lỗi này đã lên web thật, mắt thường lướt qua không thấy vì phần
              tràn nằm bên phải ngoài màn hình.
              minmax(0,1fr) cho phép ô co xuống dưới min-content, lúc đó
              `truncate` mới làm đúng việc của nó là cắt chữ kèm dấu "…". */}
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(0,23rem)_1fr]">
            {/* ---------- Cột trái: danh mục tự chọn đường đi ---------- */}
            {/* ⚠️ ĐỪNG giãn đều hay căn giữa lại. Đã thử cả hai (19–20/08/2026),
                công ty chê "nhiều khoảng trống quá". Cách đúng là làm THẺ BÊN
                PHẢI thấp xuống — ảnh maket nay nằm cạnh chữ chứ không nằm trên
                — để hai cột tự cao xấp xỉ nhau mà không hàng nào bị kéo giãn. */}
            <ul className="space-y-0.5">
              {MUC.map((m) => (
                <DongMuc key={m.nhan} muc={m} />
              ))}
            </ul>

            {/* ---------- Cột phải ----------
                Ưu tiên ảnh banner nếu /admin có điền (đúng chỗ TopCV để banner
                quảng cáo). Chưa có ảnh thì đứng thay là BĂNG CHUYỀN SẢN PHẨM —
                thứ thật, mở ra dùng được ngay, chứ không phải một ảnh minh hoạ
                mua sẵn về để lấp chỗ trống. */}
            {hero.anh ? (
              <Anh
                src={hero.anh}
                alt={hero.anhMoTa || ""}
                boc="overflow-hidden rounded-card bg-mist"
                className="h-full w-full object-cover"
              />
            ) : (
              <SlideSanPham danhSach={sanPham} />
            )}
          </div>
        </div>

        {/* ---------- Đơn vị đang dùng ----------
            BỎ CON SỐ (18/08/2026). Bản trước ghi "6 sản phẩm đang chạy cho 6
            cơ quan, đơn vị". Công ty góp ý đúng: kê rõ số lượng thì một số
            khách sẽ nghĩ công ty nhỏ, chưa làm được nhiều.

            Thay bằng TÊN khách hàng, đọc thẳng từ danh sách sản phẩm trong
            CMS. Không bỏ đi thông tin nào, cũng không thêm lời nào không kiểm
            được — mà "Bảo tàng – Thư viện tỉnh Quảng Ninh" thì nặng hơn hẳn
            một con số. */}
        {/* Câu dẫn đổi 19/08/2026 theo đúng chữ công ty đề nghị trong văn bản
            góp ý. "Đang phục vụ" nghe như một dịch vụ đang chạy; "Được tin
            tưởng bởi" là lời chứng thực — cùng một danh sách tên nhưng nói được
            nhiều hơn hẳn. Đây cũng là chỗ chữ "Quảng Ninh" chuyển xuống sau khi
            rời khỏi tiêu đề: ở đây nó là BẰNG CHỨNG đã làm được, chứ không phải
            giới hạn phạm vi phục vụ. */}
        {donVi.length > 0 && (
          <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">
              Được tin tưởng bởi các chính quyền địa phương, khu di tích và thiết chế văn hoá trên
              địa bàn Quảng Ninh
            </span>
            <span className="mt-1 block">{donVi.join(" · ")}</span>
          </p>
        )}
      </Container>
    </section>
  );
}
