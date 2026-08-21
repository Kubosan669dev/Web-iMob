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
import { diaChiAnh } from "../utils/anh.js";

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
    <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[0.875rem] font-semibold tracking-wide text-tren-brand sm:text-[0.9375rem]">
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
      {/* Ô biểu tượng 40px chính là SÀN chiều cao của mỗi hàng: bốn mục có
          câu ngắn đều cao đúng 52px (40 + đệm) dù chữ chỉ chiếm một dòng. Vì
          vậy lần thử trước ẩn dòng phụ đi mà chiều cao không nhúc nhích một
          pixel nào — đo mới biết. Trên màn thấp thu ô này về 32px thì bốn hàng
          đó mới thật sự ngắn lại. */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft [@media(max-height:820px)]:h-8 [@media(max-height:820px)]:w-8">
        <Icon className="h-5 w-5 text-brand [@media(max-height:820px)]:h-4 [@media(max-height:820px)]:w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.875rem] font-medium leading-snug text-ink">
          {muc.nhan}
        </span>
        {/* KHÔNG dùng `truncate` nữa: nó cắt cụt giữa từ ("phần mềm quản…",
            "đang chạy trên tran…"). Công ty muốn truyền đạt được nhiều, mà một
            câu bị cắt dở thì vừa mất chữ vừa xấu. Cho xuống dòng, cùng lắm
            thành hai dòng — vẫn thấp hơn ba dòng nhãn của mục 3, 4, 7.
            (Ghi chú: `truncate` kèm white-space:nowrap chính là thứ từng làm
            tràn ngang trên điện thoại — xem grid-cols-[minmax(0,1fr)] bên dưới.
            Bỏ nó đi thì lỗi đó cũng không còn đường quay lại.) */}
        {/* ẨN dòng phụ trên màn hình THẤP (laptop 1366x768 chẳng hạn).
            Bốn dòng phụ này chiếm khoảng 72px — vừa đúng phần còn thiếu để cả
            khối lọt một màn hình ở cỡ đó.
            Bỏ chúng đi là AN TOÀN vì đây là chữ TÔI viết thêm cho rõ nghĩa,
            KHÔNG phải 7 mục anh Việt gửi trong file docx. Bảy nhãn chính
            (muc.nhan) vẫn hiện đủ ở mọi cỡ màn hình — đó mới là phần công ty
            dặn giữ nguyên từng chữ. */}
        <span className="block text-[0.8125rem] leading-snug text-ink-soft [@media(max-height:820px)]:hidden">
          {muc.phu}
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-brand"
        aria-hidden="true"
      />
    </>
  );

  const lop =
    "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-mist [@media(max-height:820px)]:py-1.5";

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
    phu: "Zalo Mini App · website · phần mềm",
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
    phu: "Bấm thử trợ lý đang chạy trên trang",
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
      {/* ⚠️ ĐỆM TRÊN KHÔNG ĐƯỢC NHỎ HƠN pt-20 (80px).
          Thanh menu CỐ ĐỊNH và cao 65px, nó ĐÈ LÊN khối này chứ không đẩy khối
          xuống. Bản thử đầu tôi hạ xuống pt-12 (48px) cho vừa màn hình, kết quả
          là tên công ty chui vào sau thanh menu — đo được đúng -1px, tức chồng
          lên nhau. pt-20 chừa lại 15px thở.
          Phần chiều cao cần rút để lọt màn hình đầu tiên lấy ở chỗ khác: các
          khoảng cách dọc bên dưới và cỡ chữ tiêu đề. */}
      {/* [@media(max-height:820px)] — biến thể theo CHIỀU CAO màn hình, không
          phải chiều rộng. Laptop 1366x768 vẫn rất phổ biến; ở đó khối này cao
          hơn màn hình 123px, tức là vẫn phải cuộn mới đọc hết — đúng cái công
          ty chê. Màn cao thì các giá trị này không áp dụng, nên không ai bị
          thiệt vì nó.
          Đệm trên GIỮ NGUYÊN pt-20 ở mọi cỡ: dưới mức đó là chui vào thanh
          menu cố định cao 65px. */}
      {/* ⚠️ ĐỆM DƯỚI (pb) PHẢI LỚN HƠN CÚ KÉO LÊN CỦA THẺ TRẮNG.
          Thẻ trắng bên dưới có -mt-24, tức tự kéo lên 96px. pb-24 = 96px nên
          hai số vừa khít, phần chữ ở trên không bị chạm tới.

          Bài học phải trả giá: có lúc tôi hạ pb xuống 40px cho "vừa màn hình
          768". Con số đo được đẹp lên thật — nhưng vì thẻ trắng leo lên che
          mất dòng "cho doanh nghiệp & chính quyền", chứ không phải vì bố cục
          gọn lại. Chụp màn hình mới lộ ra. Rút pb KHÔNG BAO GIỜ là tiết kiệm
          thật: giảm pb bao nhiêu thì phải giảm -mt bấy nhiêu, và tổng chiều
          cao không đổi một pixel. */}
      <div className="bg-brand pb-24 pt-20">
        <Container>
          {/* ⚠️ THANG CHỮ (20/08/2026) — đo bằng getComputedStyle rồi mới sửa.
              Trước đó khối này có NĂM cỡ chữ chen trong 4px: 13 · 14 · 15 · 16 ·
              17. Mắt không phân biệt được 15 với 16 với 17, nên chúng không tạo
              ra thứ bậc nào cả, chỉ làm trang trông rối — đúng lời công ty chê
              "cỡ chữ chưa cân đối".
              Tệ hơn, thứ bậc còn NGƯỢC: dải từ khoá "AI · Zalo Mini App · GIS…"
              để 17px đậm, to hơn cả câu nói iMob làm gì (16px thường).
              Nay còn BỐN bậc, mỗi bậc cách nhau đủ xa để nhận ra:
                 13px  dòng phụ, badge
                 15px  nhãn danh mục, dải từ khoá   (nhãn — đậm 600)
                 19px  câu định vị dưới tiêu đề     (câu văn)
                 28px  tên dự án
                 63px  tiêu đề chính
              Dải từ khoá hạ cỡ nhưng ĐẬM hơn (500 → 600) nên vẫn nổi, chỉ thôi
              tranh chỗ với câu văn.

              max-w-5xl chứ không phải max-w-3xl như bản trước.
              Góp ý 19/08/2026 chê đúng chỗ này: "cái phần đó to như vậy mà e k
              phóng to chữ ra, để thừa 2 bên, xong chữ ở giữa thì bé tí". */}
          <div className="mx-auto max-w-5xl text-center">
            {/* TÊN CÔNG TY — to và rõ hơn hẳn (công ty yêu cầu 20/08/2026:
                "Tên cty cho to rõ ràng hơn nhé").
                Trước: 13px, đậm 600, mờ 70%. Nay: 15px (18px từ sm), đậm 700,
                mờ 90%. Vẫn nhỏ hơn tiêu đề vài bậc nên không tranh chỗ, nhưng
                đã đọc được ngay từ xa thay vì phải nheo mắt. */}
            <p className="text-[0.9375rem] font-bold uppercase tracking-[0.2em] text-tren-brand/90 sm:text-lg">
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
            <h1 className="mt-3 text-tren-brand">
              <span className="tieu-de-lon block text-[clamp(2rem,6vw,4rem)] [@media(max-height:820px)]:text-[clamp(1.75rem,5vw,2.875rem)]">
                {hero.tieuDeTruoc}
              </span>
              <span className="tieu-de-lon mt-1.5 block text-[clamp(1.375rem,4vw,2.5rem)] text-tren-brand/90 [@media(max-height:820px)]:text-[clamp(1.25rem,3.4vw,1.875rem)]">
                {hero.tieuDeSau}
              </span>
            </h1>

            <DaiCongNghe tu={hero.tuKhoaDong} />

            {/* ĐÃ BỎ câu định vị "Đồng hành cùng doanh nghiệp và chính quyền
                trên hành trình chuyển đổi số – hiện đại hoá – phát triển bền
                vững." (công ty chốt 20/08/2026: "bỏ câu đồng hành...").

                Hai lý do, và cả hai đều đúng:
                · Nó LẶP LẠI ý của dòng tiêu đề ngay trên nó ("…cho doanh
                  nghiệp & chính quyền") — nói hai lần cùng một đối tượng trong
                  15 chữ.
                · Nó chiếm hai dòng chữ 19px ở đúng chỗ đắt nhất trang. Bỏ đi
                  là khối trắng bên dưới nhích lên khoảng 70px, giúp mọi thứ
                  trọng tâm lọt vào màn hình đầu tiên — yêu cầu chính của đợt
                  góp ý này.

                Trường `moTa` vẫn còn trong CMS nhưng KHÔNG còn được vẽ ra, và
                ô nhập tương ứng đã gỡ khỏi /admin để không ai gõ vào một chỗ
                không hiện đi đâu cả. */}
          </div>
        </Container>
      </div>

      {/* ---------- Thẻ trắng: ruột của khung hình đầu ----------
          ⚠️ id="projects" NẰM Ở ĐÂY từ 20/08/2026, sau khi khối <Projects />
          bị bỏ khỏi trang chủ. Băng chuyền dự án giờ là chỗ DUY NHẤT trưng dự
          án, nên neo phải trỏ về đây.

          KHÔNG được đổi id sang tên khác: nó là neo của mục "Dự án" trên menu
          (NAV_ITEMS trong utils/constants.js), là mốc cho useActiveSection tô
          sáng mục đang xem, VÀ được nhắc tới trong kho kiến thức chatbot. Đổi
          một chỗ là gãy cả ba. */}
      <Container id="projects" className="relative -mt-24 scroll-mt-24 pb-10 lg:pb-12">
        <div className="rounded-block bg-panel p-3 shadow-lift [@media(max-height:820px)]:p-2">
          {/* Hàng hành động — đúng vị trí ô tìm kiếm của TopCV.
              Số hotline để thẻ <a href="tel:"> chứ không phải chữ thường: trên
              điện thoại chạm là gọi luôn, khỏi phải chép tay. */}
          <div className="flex flex-wrap items-center gap-2.5 rounded-card bg-mist px-3 py-2.5 sm:px-4 [@media(max-height:820px)]:py-2">
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
                src={diaChiAnh(hero.anh)}
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
        {/* ⚠️ 20/08/2026 — HAI GÓP Ý TRONG CÙNG MỘT ĐỢT NÓI NGƯỢC NHAU Ở ĐÂY:
              ảnh 2: 'bỏ dòng "khu di tích…"' + "lắm chữ quá"
              ảnh 7: khoanh đỏ cả khối này, "Giữ nguyên mấy cái c khoanh đỏ nha"

            Đọc kỹ thì hết mâu thuẫn: khối này có HAI dòng, và mỗi góp ý nói về
            một dòng khác nhau.
              dòng 1  "Được tin tưởng bởi các chính quyền địa phương…"
              dòng 2  "Khu di tích danh thắng Yên Tử · Bảo tàng – Thư viện… ·
                       Phường An Sinh · Đông Triều… · Xã Quảng Tân… · Phường
                       Yên Tử"

            Câu 'bỏ dòng "khu di tích…"' trỏ đúng vào dòng 2 — dòng đó BẮT ĐẦU
            bằng chữ "Khu di tích". Nó cũng chính là chỗ "lắm chữ quá": sáu tên
            đơn vị nối bằng dấu chấm giữa, tràn hai dòng.

            Nên: BỎ dòng 2, GIỮ dòng 1. Vừa đúng cả hai góp ý, vừa không mất
            bằng chứng năng lực — câu còn lại vẫn nói rõ khách của iMob là
            chính quyền và khu di tích ở Quảng Ninh.

            Điều kiện donVi.length > 0 vẫn giữ: chưa có khách hàng nào trong CMS
            thì cả câu tự ẩn, không đi khoe một điều chưa có gì chống lưng. */}
        {donVi.length > 0 && (
          <p className="mx-auto mt-2 max-w-3xl text-center text-sm font-semibold leading-relaxed text-ink [@media(max-height:820px)]:mt-1">
            Được tin tưởng bởi các chính quyền địa phương, khu di tích và thiết chế văn hoá
            trên địa bàn Quảng Ninh
          </p>
        )}
      </Container>
    </section>
  );
}
