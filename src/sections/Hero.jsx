import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Cpu,
  Globe,
  LayoutGrid,
  Map,
  GraduationCap,
  MessageCircle,
  MonitorSmartphone,
  Package,
  Phone,
  PlaneTakeoff,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Button from "../components/ui/Button.jsx";
import SlideSanPham from "../components/ui/SlideSanPham.jsx";
import MinhHoaThietBi from "../components/ui/MinhHoaThietBi.jsx";
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
/** Biểu tượng cho từng mảng công nghệ. Khớp không phân biệt hoa thường và
    khớp CHỨA chứ không khớp tuyệt đối, để "Zalo Mini App" hay "Mini App" đều
    ra đúng hình. Không khớp được thì dùng Sparkles — thà một hình chung chung
    còn hơn một viên thuốc trống trơn lệch hẳn so với các viên bên cạnh. */
const HINH_CONG_NGHE = [
  // "AI" khớp CẢ NHÃN (^ai$) chứ không khớp chứa: /ai/i sẽ bắt nhầm bất cứ
  // nhãn nào có hai chữ cái đó nằm giữa từ. Các mục còn lại khớp chứa vì chúng
  // là từ khoá đặc trưng, không lẫn vào đâu được.
  //
  // (Bản đầu viết ... cho đúng ranh giới từ, nhưng dấu gạch chéo bị nuốt
  //  lúc ghi file và biến thành ký tự điều khiển 0x08 lọt thẳng vào mã nguồn —
  //  ESLint bắt được. Dùng ^...$ vừa an toàn vừa đúng hơn cho danh sách nhãn.)
  [/^ai$|trí tuệ/i, Bot],
  [/zalo|mini ?app/i, MonitorSmartphone],
  [/gis|bản ?đồ/i, Map],
  [/web/i, Globe],
  [/iot|cảm biến/i, Cpu],
  [/platform|nền ?tảng/i, LayoutGrid],
];

function hinhCua(ten) {
  return HINH_CONG_NGHE.find(([re]) => re.test(ten))?.[1] ?? Sparkles;
}

function DaiCongNghe({ tu }) {
  const danhSach = tu?.length ? tu : ["AI", "Zalo Mini App", "Website"];
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (reduceMotion || danhSach.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % danhSach.length), 1800);
    return () => clearInterval(timer);
  }, [danhSach.length, reduceMotion]);

  return (
    <ul className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start [@media(max-height:1000px)]:mt-4 [@media(max-height:1000px)]:gap-2">
      {danhSach.map((t, n) => {
        const Icon = hinhCua(t);
        const dangSang = reduceMotion || n === index;
        return (
          <li key={t}>
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors duration-500 " +
                (dangSang
                  ? "border-tren-brand/45 bg-tren-brand/15 text-tren-brand"
                  : "border-tren-brand/20 text-tren-brand/70")
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t}
            </span>
          </li>
        );
      })}
    </ul>
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
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft [@media(max-height:1000px)]:h-8 [@media(max-height:1000px)]:w-8">
        <Icon className="h-5 w-5 text-brand [@media(max-height:1000px)]:h-4 [@media(max-height:1000px)]:w-4" aria-hidden="true" />
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
    "group flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition-colors hover:bg-mist";

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
    // ĐÍCH ĐỔI 21/08/2026: "/#contact" -> "/robot".
    // Trước đó mục này đẩy thẳng khách xuống form liên hệ, tức là bắt để lại
    // số điện thoại TRƯỚC khi được biết bên mình làm được gì — cách chắc chắn
    // nhất để mất một khách đang tìm hiểu. Lúc ấy không còn cách nào khác vì
    // chưa có tài liệu để dựng trang. Nay đã có hồ sơ kỹ thuật hai loại robot.
    nhan: "Ứng dụng các loại robot tuần tra/lễ tân, UAV, Drone theo yêu cầu",
    phu: "Robot lễ tân và robot tuần tra tự hành",
    den: "/robot",
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

  // Ảnh cho cột phải khối đầu trang — CHỈ lấy từ ô "Ảnh banner" trong /admin.
  //
  // ⚠️ ĐÃ BỎ ĐƯỜNG LÙI "mượn ảnh của sản phẩm cuối danh sách" (22/08/2026).
  // Đường lùi đó chính là lỗi công ty chỉ ra: "đoạn này dùng hình minh họa
  // khác đi em, ở dưới có rồi trông nó thừa ra". Hàng thẻ dự án ngay bên dưới
  // trượt qua CẢ SÁU dự án, nên mượn ảnh của bất kỳ dự án nào thì cũng có lúc
  // nó nằm cùng màn hình với chính nó — không có cách nào chọn khéo hơn được.
  //
  // Ô trống nay không còn nghĩa là "cột phải để trắng": chưa điền ảnh banner
  // thì hiện <MinhHoaThietBi /> — hình vẽ ba màn hình chung chung, đúng thứ
  // công ty dặn ("Lấy hình chung chung thôi nhé đừng lấy cửa dự án nào cả").
  const anhBanner = (hero.anh || "").trim();

  return (
    <section id="home" className="relative">
      {/* ---------- Dải màu thương hiệu: HAI CỘT ----------
          Dựng lại 20/08/2026 theo đúng ảnh bố cục công ty gửi: chữ dồn về bên
          TRÁI, ảnh sản phẩm bên PHẢI. Bản trước căn giữa toàn bộ.

          Vì sao bố cục này chứa được nhiều hơn hẳn: căn giữa thì mỗi dòng chữ
          phải tự giới hạn bề ngang cho dễ đọc, nên hai bên luôn thừa ra hai
          mảng trống lớn — đúng cái công ty chê "vẫn còn nhiều kgian thừa".
          Chia đôi thì mảng trống bên phải biến thành chỗ đặt ảnh thật, còn chữ
          bên trái vẫn giữ đúng bề ngang dễ đọc.

          ⚠️ pt- phải LỚN HƠN chiều cao thanh điều hướng (65px): Navbar là
          `fixed` nên không chiếm chỗ trong dòng chảy, nội dung bắt đầu quá cao
          sẽ chui vào sau nó. pt-20 = 80px, chừa 15px thở.
          ⚠️ QUAN HỆ pb Ở ĐÂY VỚI -mt CỦA THẺ TRẮNG BÊN DƯỚI — đọc kỹ chỗ này
          trước khi đổi một trong hai số:

              khoảng hở giữa hàng nút và mép trên thẻ trắng  =  pb  −  |-mt|

          pb-32 (128px) với -mt-24 (96px) => hở 32px.
          · Bằng nhau (pb-24 với -mt-24, như bản trước 21/08/2026) thì hở 0 —
            mép thẻ rơi ĐÚNG vào chân hàng nút, dính vào nhau. Đó chính là chỗ
            người dùng chỉ ra: "đang sát nhau quá cần giãn khoảng cách".
          · Rút pb mà không rút -mt thì hiệu số ÂM: thẻ trắng leo lên CHE MẤT
            chữ. Đã mắc một lần rồi — thu pb từ 96 xuống 40 mà quên -mt, đo
            thì thấy "tiết kiệm được 56px" nhưng thật ra thẻ đè lên dòng thứ
            hai của tiêu đề. Chỉ ảnh chụp mới lộ ra.
          · Tăng pb hay giảm -mt đều làm trang CAO THÊM đúng bấy nhiêu pixel.
            Không có cách nào giãn chỗ này mà miễn phí. */}
      {/* ---------- Nền dải màu đầu trang ----------
          21/08/2026: đổi từ một mảng màu phẳng sang chuyển sắc.
          22/08/2026: đổi tiếp từ chuyển sắc MỘT MÀU (brand -> brand-deep, tức
          là chỉ đậm nhạt) sang chuyển sắc HAI MÀU (brand-deep -> brand ->
          accent). Đây là chỗ chính chữa lời chê "màu trông đơn điệu quá, cty
          công nghệ mà nhạt nhẽo thế à": một dải chàm đậm dần thì mắt vẫn chỉ
          đọc ra một màu, phải có màu thứ hai thì mới thành chuyển sắc thật.

          ⚠️ CẢ BA ĐIỂM DỪNG ĐỀU LÀ TOKEN, không ghim mã màu.
          brand, brand-deep và accent đều đã qua phép đo "chữ trắng đọc được
          trên nền này" ở CẢ 10 bảng màu (xem scripts/kiem-tra-bang-mau.mjs).
          Ghim một mã xanh navy như trong ảnh mẫu thì chín bảng còn lại hỏng
          hết — và chữ trắng trên đó có thể tụt xuống dưới chuẩn mà không ai
          hay, vì không phép đo nào chạy qua mã ghim cứng. */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-deep via-brand to-accent pb-32 pt-24 [@media(max-height:1000px)]:pt-20">
        {/* Quầng sáng mờ — thứ duy nhất trong cả trang được phép làm nền không
            phẳng. Đặt lệch hẳn sang phải và xuống dưới, tức là NẰM SAU cột
            hình minh hoạ chứ không sau cột chữ: nó chỉ thêm chiều sâu, không
            đụng tới nền của bất kỳ dòng chữ nào. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-accent/40 blur-3xl"
        />
        {/* `relative` KHÔNG THỪA: quầng sáng ở trên là phần tử đã định vị, nên
            theo thứ tự vẽ của CSS nó nằm TRÊN mọi phần tử tĩnh đứng sau. Không
            có dòng này thì cả cột chữ và cột hình bị một mảng mờ phủ lên. */}
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 [@media(max-height:1000px)]:gap-6 [@media(max-height:1000px)]:lg:gap-10">
            {/* ================= Cột trái: chữ ================= */}
            <div className="text-center lg:text-left">
              {/* TÊN CÔNG TY — to và rõ (công ty yêu cầu: "Tên cty cho to rõ
                  ràng hơn nhé"). */}
              <p className="text-[0.9375rem] font-bold uppercase tracking-[0.2em] text-tren-brand/90 sm:text-lg">
                {hero.badge}
              </p>

              {/* Hai dòng đều to, dòng dưới nhỏ hơn một bậc: dòng trên là việc
                  iMob làm, dòng dưới là làm cho ai.
                  ĐÃ BỎ cụm "ở Quảng Ninh" khỏi tiêu đề (chốt 19/08/2026):
                  người ngoài tỉnh nhìn vào tưởng iMob chỉ làm trong Quảng Ninh
                  nên tự loại mình. Bằng chứng về Quảng Ninh chuyển xuống dòng
                  "Được tin tưởng bởi…" ở cuối — chỗ đó là chứng minh năng lực
                  chứ không phải giới hạn phạm vi. */}
              <h1 className="mt-5 text-tren-brand [@media(max-height:1000px)]:mt-3">
                <span className="tieu-de-lon block text-[clamp(1.75rem,4vw,3rem)] [@media(max-height:1000px)]:text-[clamp(1.75rem,4.2vw,2.75rem)]">
                  {hero.tieuDeTruoc}
                </span>
                <span className="tieu-de-lon mt-1 block text-[clamp(1.25rem,2.8vw,1.875rem)] text-tren-brand/85 [@media(max-height:1000px)]:text-[clamp(1.25rem,3vw,1.75rem)]">
                  {hero.tieuDeSau}
                </span>
              </h1>

              <DaiCongNghe tu={hero.tuKhoaDong} />

              {/* ---------- Hai nút + số gọi ----------
                  Chuyển lên đây từ thanh "Bạn đang cần gì?" ở đầu thẻ trắng,
                  theo đúng ảnh mẫu (hai nút nằm ngay dưới phần chữ).
                  KHÔNG mất thứ gì: cả hai nút và số hotline bấm-gọi-được đều
                  còn nguyên, chỉ đổi chỗ. Bỏ đi đúng mấy chữ "Bạn đang cần gì?"
                  vì trong bố cục mới hai cái nút đã tự nói lên việc của chúng. */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start [@media(max-height:1000px)]:mt-5">
                <Button href="#contact" variant="tren-brand">
                  {hero.nutChinh}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="vien-tren-brand" onClick={openChat}>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {hero.nutPhu}
                </Button>
                <a
                  href={`tel:${(congTy.phone ?? "").replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.9375rem] font-semibold text-tren-brand transition-colors hover:bg-tren-brand/15"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {congTy.phone}
                </a>
              </div>
            </div>

            {/* ================= Cột phải: hình minh hoạ =================
                Ảnh mẫu công ty gửi có một cụm maket nhiều thiết bị. Lần dựng
                trước tôi kết luận "cụm đó là ảnh thiết kế sẵn, không dựng lại
                được bằng mã" nên thay tạm bằng ảnh chụp một dự án — và đó là
                thứ công ty chê thừa. Kết luận ấy sai: một cụm maket phẳng thì
                vẽ bằng div và SVG được, xem MinhHoaThietBi.jsx.

                Nay cột này có hai trạng thái, KHÔNG còn trạng thái nào để
                trống:
                  · điền "Ảnh banner" trong /admin  -> hiện đúng ảnh đó
                  · để trống (mặc định)             -> hiện hình vẽ ba màn hình
                Cả hai đều nằm trong CÙNG một khung nền mờ, cùng tỉ lệ 2/1, nên
                đổi qua lại không xô lệch chiều cao cột. */}
            <div className="hidden lg:block">
              {/* ⚠️ TỈ LỆ 2/1 — CẢ HAI NHÁNH DƯỚI ĐÂY PHẢI DÙNG CHUNG.
                  Đây là con số đo được, không phải thẩm mỹ: cột này CAO HƠN
                  cột chữ bên trái, mà lưới đang căn giữa (items-center) nên
                  phần dôi ra bị chia đôi thành hai mảng trống trên và dưới
                  phần chữ — đo được 25px thừa phía trên riêng ở màn 1440.
                  Đã đo hai lần mới ra đúng số: 16/10 -> 16/9 vẫn còn dôi,
                  phải xuống 2/1 thì cột ảnh (~235px) mới ngang bằng cột chữ
                  (~235px) và mảng trống biến mất hẳn.
                  Đây cũng là lý do rút lề bên trong CỘT CHỮ không ăn thua gì:
                  lưới căn giữa nên chiều cao lấy theo cột CAO NHẤT, mà cột cao
                  nhất là cột này. Đo mới biết. */}
              <div className="overflow-hidden rounded-block bg-tren-brand/10 p-2 ring-1 ring-tren-brand/20">
                {anhBanner ? (
                  <img
                    src={diaChiAnh(anhBanner)}
                    alt={hero.anhMoTa || "Ảnh giới thiệu iMob"}
                    className="aspect-[2/1] w-full rounded-card object-cover [@media(max-height:1000px)]:aspect-[21/9]"
                  />
                ) : (
                  <MinhHoaThietBi className="aspect-[2/1] w-full [@media(max-height:1000px)]:aspect-[21/9]" />
                )}
              </div>
            </div>
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
      <Container id="projects" className="relative -mt-24 scroll-mt-24 pb-6 lg:pb-6 [@media(max-height:1000px)]:pb-5">
        {/* HAI THẺ RIÊNG, không phải một thẻ lớn chia đôi (theo ảnh mẫu
            20/08/2026). Khác biệt không chỉ ở hình thức: hai thẻ rời thì mỗi
            thẻ tự cao theo ruột của nó, không thẻ nào bị kéo giãn theo thẻ kia
            — đúng cái gốc của lời chê "nhiều khoảng trống quá" suốt mấy đợt góp
            ý trước.

            ⚠️ KHE gap-5 KHÔNG CÓ BẢN RÚT GỌN CHO MÀN THẤP, và đó là cố ý:
            trên lg đây là lưới HAI CỘT nên gap chỉ tính theo chiều NGANG —
            nới nó ra không tốn một pixel chiều cao nào. Đây là kiểu nới rộng
            duy nhất trong cả khối này mà không phải đánh đổi gì; mọi chỗ khác
            (lề trong thẻ, đệm hàng, hở giữa dải màu và thẻ) đều làm trang cao
            thêm đúng bằng số pixel nới ra.

            ⚠️ 21/08/2026 — PHẦN LỚN BIẾN THỂ [@media(max-height:1000px)] Ở
            KHU NÀY ĐÃ BỎ (lề thẻ, đệm hàng, khoảng cách tiêu đề, dải AI). Lý
            do: sau khi người dùng bảo "đang sát nhau quá cần giãn khoảng
            cách", bậc màn-thấp được nới lên gần bằng bậc màn-cao, nên hai bậc
            khai hai con số giống hệt nhau — giữ lại chỉ tổ làm người đọc sau
            tưởng có khác biệt. Giờ hai bậc chỉ còn khác nhau ở đúng những chỗ
            THẬT SỰ khác: đệm trên của dải màu, nhịp chữ trong dải màu, cỡ ô
            biểu tượng, tỉ lệ ảnh, và việc ẩn dòng phụ (ngưỡng riêng 820px). */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
          {/* ========== Thẻ trái: 7 mục ==========
              ⚠️ NỘI DUNG BẢY MỤC GIỮ NGUYÊN TỪNG CHỮ (anh Việt: "7 mục bên
              trái e giữ nguyên nd như a việt gửi nha, c chỉ gợi ý bố cục
              thôi"). Ảnh mẫu có 5 mục — đó là 5 mục của công ty khác, chỉ để
              tham khảo CÁCH BÀY. */}
          <div className="rounded-block bg-panel p-4 shadow-lift">
            <p className="mb-3 px-1.5 text-base font-bold text-ink">
              Giải pháp nổi bật
            </p>
            {/* ⚠️ grid-cols-[minmax(0,1fr)] Ở THẺ CHA KHÔNG THỪA — xem ghi chú
                lịch sử bên dưới về lỗi tràn ngang trên điện thoại. */}
            <ul className="space-y-0.5">
              {MUC.map((m) => (
                <DongMuc key={m.nhan} muc={m} />
              ))}
            </ul>
          </div>

          {/* ========== Thẻ phải: dự án ==========
              flex flex-col: lưới kéo hai thẻ cao bằng nhau, mà cột 7 mục bên
              trái luôn cao hơn hàng bốn thẻ dự án. Không có nó thì phần dôi ra
              đọng thành mảng trắng ở đáy thẻ phải — đúng thứ công ty chê suốt
              mấy đợt. Có nó thì hàng thẻ tự nở ra và căn giữa theo chiều dọc,
              còn dòng "Được tin tưởng bởi…" bám đáy. */}
          <div className="flex min-w-0 flex-col rounded-block bg-panel p-4 shadow-lift">
            <SlideSanPham danhSach={sanPham} />

            {/* ---------- Đơn vị đang dùng ----------
                CHUYỂN VÀO TRONG THẺ DỰ ÁN 21/08/2026. Trước đây nó là một dòng
                chữ căn giữa nằm chơ vơ bên dưới hai thẻ. Ở đây đúng chỗ hơn
                hẳn: ngay dưới hàng ảnh sáu dự án làm cho chính những đơn vị đó,
                câu này thành lời chú cho thứ khách vừa nhìn thấy chứ không còn
                là một khẩu hiệu rời. Tiện thể tiết kiệm được một dòng trên
                trang — thứ đang phải giành từng chục pixel để lọt một màn hình.

                ⚠️ 20/08/2026 — HAI GÓP Ý TRONG CÙNG MỘT ĐỢT NÓI NGƯỢC NHAU Ở
                ĐÂY:
                  ảnh 2: 'bỏ dòng "khu di tích…"' + "lắm chữ quá"
                  ảnh 7: khoanh đỏ cả khối này, "Giữ nguyên mấy cái c khoanh đỏ"

                Đọc kỹ thì hết mâu thuẫn: khối này có HAI dòng, và mỗi góp ý nói
                về một dòng khác nhau.
                  dòng 1  "Được tin tưởng bởi các chính quyền địa phương…"
                  dòng 2  "Khu di tích danh thắng Yên Tử · Bảo tàng – Thư
                           viện… · Phường An Sinh · …"
                Câu 'bỏ dòng "khu di tích…"' trỏ đúng vào dòng 2 — dòng đó BẮT
                ĐẦU bằng chữ "Khu di tích", và cũng chính là chỗ "lắm chữ quá".
                Nên: BỎ dòng 2, GIỮ dòng 1.

                Điều kiện donVi.length > 0 vẫn giữ: chưa có khách hàng nào
                trong CMS thì cả câu tự ẩn, không đi khoe một điều chưa có gì
                chống lưng. */}
            {donVi.length > 0 && (
              <p className="mt-5 border-t border-line pt-4 text-center text-[0.8125rem] font-semibold leading-relaxed text-ink-soft [@media(max-height:1000px)]:mt-3 [@media(max-height:1000px)]:pt-2.5">
                Được tin tưởng bởi các chính quyền địa phương, khu di tích và thiết
                chế văn hoá trên địa bàn Quảng Ninh
              </p>
            )}
          </div>
        </div>

        {/* ---------- Dải "Hỏi iMob AI" ----------
            CÓ TRONG ẢNH MẪU công ty gửi, nằm đúng chỗ này — dưới hai thẻ,
            chạy hết bề ngang. Lần dựng trước tôi bỏ qua vì nghĩ đã có bong
            bóng chat ở góc phải rồi. Nghĩ lại thì hai thứ khác việc nhau:
            bong bóng là cái nút chờ sẵn cho ai đã biết mình muốn hỏi, còn dải
            này là lời MỜI — nó nói cho khách biết trợ lý làm được gì, mà phần
            đông khách vào trang giới thiệu không tự nghĩ ra chuyện bấm vào một
            bong bóng tròn ở góc.
            Bong bóng vẫn nguyên ở góc phải (công ty dặn: "cái chat bot vẫn để
            ở góc phải như cũ cũng được") — dải này chỉ mở đúng cửa sổ chat đó,
            không dựng thêm một khung chat thứ hai. */}
        {/* Nền dải này đổi từ một màu phẳng (bg-brand-soft) sang chuyển sắc
            hai màu nhạt 22/08/2026 — cùng lý do với dải đầu trang, và cố ý
            dùng LẠI ĐÚNG cặp màu đó ở dạng nhạt để hai khối nhìn ra là một bộ. */}
        <div className="mt-3 flex flex-col items-center gap-4 rounded-block bg-gradient-to-r from-brand-soft to-accent-soft px-6 py-2.5 text-center sm:flex-row sm:justify-center sm:text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand [@media(max-height:1000px)]:h-9 [@media(max-height:1000px)]:w-9">
            <Bot className="h-6 w-6 text-tren-brand [@media(max-height:1000px)]:h-5 [@media(max-height:1000px)]:w-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 sm:mr-auto">
            <p className="text-base font-bold text-ink">Hỏi iMob AI</p>
            {/* Câu mời viết đúng việc trợ lý làm được thật: nó đọc kho kiến
                thức về dịch vụ, sản phẩm và cách làm việc của iMob rồi trả
                lời. KHÔNG hứa "nhận giải pháp phù hợp nhất" như chữ trong ảnh
                mẫu — đó là lời của một công ty khác, và một con bot thì không
                thể chọn hộ khách giải pháp tốt nhất được. */}
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-soft">
              Đang có việc cần làm mà chưa biết bắt đầu từ đâu? Hỏi trợ lý của iMob
              về dịch vụ, sản phẩm và cách triển khai.
            </p>
          </div>

          <Button onClick={openChat} className="shrink-0">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {hero.nutPhu}
          </Button>
        </div>
      </Container>
    </section>
  );
}
