import { useState } from "react";
import { Building2, GraduationCap, Landmark, Library, Pause, Play, Zap } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import { useDoiTac } from "../context/NoiDungContext.jsx";
import { diaChiAnh } from "../utils/anh.js";

// ============================================================
// DoiTac — dải LOGO các đơn vị đã đồng hành, chạy ngang liên tục.
//
// Thêm 22/08/2026 theo yêu cầu của công ty:
//   "ở trên phần dịch vụ mình để chạy 1 dòng các đối tác và đơn vị đã triển
//    khai dự án cùng mình nhé"
// kèm ảnh chụp trang cmc.com.vn làm mẫu (dải logo Samsung SDS · TIME ·
// Microsoft chạy dưới mục Đối tác).
//
// ---- Bản dựng đầu là LOGO + TÊN, nay chỉ còn LOGO ----
// Lúc chưa có logo nào, dải này là biểu tượng + tên chữ. Khi công ty gửi logo
// thì tôi ghép cả hai — logo đứng trước, tên đứng sau. Công ty xem rồi chốt
// lại: "ý tôi là chỉ hiện logo và cho các logo chạy theo ấy". Đúng với ảnh mẫu
// họ gửi từ đầu: cmc.com.vn chỉ có logo, không có tên.
//
// Bỏ chữ đi được hai thứ: mỗi ô hẹp lại chừng một nửa nên nhìn một lượt thấy
// được nhiều đơn vị hơn, và logo được phóng to (28px -> 40px, rồi -> 64px) —
// ở cỡ đầu nhiều logo chỉ còn là một chấm màu.
//
// ---- LỊCH SỬ "vẫn đứng yên nè" — đọc trước khi đụng vào chuyển động ----
// Công ty báo hai lần là dải không chạy. Nguyên nhân KHÔNG nằm trong file này
// mà nằm ở chỗ máy của họ tắt hiệu ứng Windows, nên trình duyệt khai
// prefers-reduced-motion: reduce, và có HAI thứ cùng chặn:
//   1. nhánh useReducedMotion() ngay trong file này (đã bỏ);
//   2. luật quét cả site trong styles/index.css rút mọi animation xuống
//      0,01ms kèm !important (nay miễn trừ riêng cho dải này).
// Sửa một trong hai mà quên cái kia thì dải vẫn đứng im. Chi tiết và lý lẽ
// nằm ở khối băng chạy bên dưới và ở index.css.
//
// ---- Ba đơn vị CHƯA CÓ LOGO thì làm gì ----
// Phường Hà An, phường An Sinh, Thuỷ điện Sapa. KHÔNG bỏ họ ra khỏi dải: đây
// là danh sách khách hàng thật, vắng mặt ai là bớt đi một bằng chứng năng lực.
// Ba đơn vị đó hiện một ô CHỮ — cùng khung, cùng chiều cao với ô logo, nên
// hàng vẫn đều. Có logo lúc nào thì điền vào doiTac.json là ô chữ tự thành ô
// ảnh, không phải sửa file này.
//
// ---- Vì sao KHÔNG đặt trong <Reveal> ----
// Reveal chỉ chạy khi CUỘN TỚI. Dải này nằm ngay dưới khối đầu trang, phần lớn
// máy để bàn nhìn thấy nó ngay khi trang vừa mở — bọc Reveal thì nó nằm im ở
// độ mờ 0 cho tới khi người ta cuộn, tức là mất hẳn.
// ============================================================

/* Biểu tượng theo nhóm đơn vị, dùng cho ô chữ của đơn vị chưa có logo. Cố ý
   lấy lại đúng bộ biểu tượng đang có trong projects.json (landmark / library /
   building-2) để cả site nói cùng một thứ tiếng hình ảnh. */
const HINH_NHOM = {
  "chinh-quyen": Landmark,
  "van-hoa": Library,
  "giao-duc": GraduationCap,
  "nang-luong": Zap,
  "doanh-nghiep": Building2,
};

/* Số giây cho MỘT đơn vị trôi qua hết màn hình. Nhân với số đơn vị ra thời
   gian một vòng, nên thêm bớt đơn vị thì TỐC ĐỘ KHÔNG ĐỔI — chỉ vòng dài ra.
   Ghim cứng một con số giây cho cả vòng thì mỗi lần thêm khách hàng là dải lại
   chạy nhanh thêm một chút, đến lúc nào đó thành nhấp nháy.
   3,2 giây/đơn vị. Trước là 2,8; nới ra khi phóng to logo (22/08/2026): ô to
   hơn thì cùng một khoảng thời gian phải đi qua nhiều pixel hơn, giữ nguyên
   2,8 là dải chạy từ ~51 lên ~61px/giây — vật càng to trôi càng nhanh thì mắt
   càng thấy vội. 3,2 kéo lại về khoảng 54px/giây, gần đúng nhịp cũ. */
const GIAY_MOI_DON_VI = 3.2;

/** Một ô trong dải: ảnh logo nếu có, không thì tên đơn vị dạng chữ.

    ---- Vì sao logo phải nằm trong một Ô NỀN chứ không đặt thẳng lên dải ----
    Tám logo công ty gửi có đủ kiểu nền: nền trắng đặc (Bảo tàng, EVNGENCO1),
    nền trong suốt, và một cái là chữ TRẮNG trên nền trong suốt (VHunter). Thả
    thẳng lên dải nền xám nhạt thì cái có nền trắng thành một ô trắng lệch tông,
    còn VHunter mất hút hẳn. Cho tất cả vào cùng một ô bo góc nền trắng thì
    chúng thành một bộ — đây cũng đúng cách trang cmc.com.vn đang làm.

    `logoNenToi` cho riêng logo chữ sáng: ô của chúng đổi sang nền tối. Một ô
    tối giữa các ô trắng nhìn vẫn thuận, còn hơn một logo không thấy gì.

    ---- CỠ LOGO: 64px, và đó là TRẦN chứ không phải sở thích (22/08/2026) ----
    Công ty: "phóng to logo ra". Đo trước khi chỉnh: tám tệp trong
    public/anh/logo/ đều cao đúng 128px. Màn hình đời nay phần lớn là 2 điểm
    ảnh vật lý trên 1 điểm CSS, nên 128px tệp gốc hiện nét căng ở đúng 64px và
    bắt đầu nhoè từ 65px trở lên. Vì vậy h-16 (64px) là cỡ LỚN NHẤT còn nét —
    to hơn nữa thì phải xuất lại tệp, mà logo EVNGENCO1 bản gốc chỉ cao 90px
    (New folder/logo-goc) nên riêng nó không phóng thêm được bao nhiêu.
    Ô cao 96px = 64 logo + 16 đệm trên dưới.

    ---- max-w-[15rem] để một logo BỀ NGANG không đè bẹp cả hàng ----
    Bảy trên tám logo gần vuông (tỉ lệ 0,80–1,04). Riêng EVNGENCO1 là chữ nằm
    ngang, tỉ lệ 5,13 — để cao 64px thì nó rộng 328px, gấp năm lần các ô kia.
    Chặn bề ngang ở 240px thì object-contain tự hạ nó xuống còn cao ~47px:
    vừa không có logo nào bị bóp méo, vừa cân về mặt thị giác (một dòng chữ
    dài cao bằng một con dấu tròn thì nhìn nó to gấp mấy lần). */
function OChip({ dv }) {
  const Icon = HINH_NHOM[dv.nhom] ?? Building2;

  return (
    // mr-* nằm trên <li> chứ không phải gap trên <ul> — xem ghi chú của
    // --animate-chay-ngang trong styles/index.css, vòng lặp phụ thuộc vào đó.
    <li className="mr-5 shrink-0 lg:mr-7">
      <span
        className={
          "flex h-24 items-center justify-center rounded-2xl px-6 " +
          (dv.logoNenToi ? "bg-ink" : "bg-paper shadow-soft")
        }
      >
        {dv.logo ? (
          /* alt là TÊN ĐƠN VỊ, không để trống. Bản trước để alt="" vì tên nằm
             ngay bên cạnh dưới dạng chữ; nay chữ đã bỏ, alt là thứ DUY NHẤT
             cho người dùng trình đọc màn hình biết đây là đơn vị nào. */
          <img
            src={diaChiAnh(dv.logo)}
            alt={dv.ten}
            loading="lazy"
            className="h-16 w-auto max-w-[15rem] object-contain"
          />
        ) : (
          <span className="flex items-center gap-2.5 whitespace-nowrap text-base font-bold text-ink-soft">
            <Icon className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
            {dv.ten}
          </span>
        )}
      </span>
    </li>
  );
}

export default function DoiTac() {
  const doiTac = useDoiTac();
  const [dangChay, setDangChay] = useState(true);

  // Lọc đơn vị hỏng ngay tại đây: danh sách này sửa được trong /admin, một
  // dòng lỡ để trống tên không được phép làm hiện ra một ô rỗng giữa dải.
  const danhSach = (doiTac.danhSach ?? []).filter((dv) => (dv?.ten ?? "").trim());

  // Chưa có đơn vị nào thì ẩn hẳn khối — không để lại một dải trống có mỗi
  // dòng tiêu đề, đúng cách các khối khác trong site đang làm.
  if (danhSach.length === 0) return null;

  const tieuDe = doiTac.tieuDe || "Đối tác và các đơn vị đã đồng hành cùng iMob";

  return (
    <section className="border-t border-line bg-mist py-10 lg:py-12">
      <Container>
        {/* Tiêu đề và nút tạm dừng nằm CÙNG MỘT HÀNG, căn giữa. Nút đặt cạnh
            tiêu đề chứ không đặt ở góc dải: ở góc thì nó đè lên logo, mà thu
            nhỏ dải lại để chừa chỗ thì mất chỗ của chính thứ cần khoe. */}
        <div className="flex items-center justify-center gap-2">
          <p className="text-center text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            {tieuDe}
          </p>

          {/* ---- Nút tạm dừng: BẮT BUỘC PHẢI CÓ, không phải để cho đẹp ----
              Chuẩn WCAG 2.2.2 (mức A): thứ gì tự chạy quá 5 giây thì phải có
              cách dừng lại được. Bản trước lấy "rê chuột thì dừng" làm cách
              đó — nhưng rê chuột thì bàn phím không làm được, màn hình cảm
              ứng cũng không. Nay dải chạy cho cả người đã bật "giảm chuyển
              động" (xem ghi chú ở khối băng chạy bên dưới), nên càng phải có
              một cái nút thật: bấm được, tab tới được, đọc màn hình hiểu được.

              Không dùng aria-pressed vì đây không phải công tắc bật/tắt một
              trạng thái — nhãn đổi theo việc bấm vào sẽ LÀM GÌ, đúng cách một
              nút play/pause thường làm. */}
          <button
            type="button"
            onClick={() => setDangChay((v) => !v)}
            aria-label={dangChay ? "Tạm dừng dải logo đối tác" : "Cho dải logo đối tác chạy"}
            title={dangChay ? "Tạm dừng" : "Cho chạy"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-line/70 text-ink-soft transition-colors hover:bg-line hover:text-ink"
          >
            {/* fill-current: hai vạch của biểu tượng Pause vốn chỉ có nét
                viền, ở khổ 16px thì mảnh đến mức nhìn như vết bẩn. Tô đặc
                mới ra hình cái nút tạm dừng. */}
            {dangChay ? (
              <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {/* ---- Băng chạy — CHỈ CÒN MỘT NHÁNH, không còn bản đứng yên ----

          ⚠️ ĐỌC TRƯỚC KHI ĐỊNH "TRẢ LẠI" NHÁNH GIẢM CHUYỂN ĐỘNG:
          Trước đây chỗ này rẽ hai nhánh theo useReducedMotion(). Công ty báo
          hai lần "vẫn đứng yên nè". Đo ra thì máy của họ có
          SPI_GETCLIENTAREAANIMATION = 0, tức Windows đang tắt hiệu ứng, nên
          trình duyệt khai prefers-reduced-motion: reduce và họ luôn rơi vào
          nhánh đứng yên.

          Vấn đề không nằm ở một cái máy. Trên Windows, công tắc đó vừa mang
          nghĩa "tôi bị chóng mặt vì chuyển động" vừa mang nghĩa "máy tôi yếu,
          tắt hiệu ứng cho nhanh" — và máy văn phòng nhà nước thường bị tắt vì
          nghĩa thứ hai. Khách hàng thật của iMob dùng đúng loại máy đó. Nghe
          theo tín hiệu này là một phần khách không bao giờ thấy dải chạy.

          Nên: dải chạy cho MỌI NGƯỜI, và đổi lại phải có nút dừng thật ở trên
          — đó mới là thứ chuẩn WCAG 2.2.2 đòi, và nó tốt hơn hẳn "rê chuột thì
          dừng" của bản cũ vì bàn phím và cảm ứng đều dùng được.

          ⚠️ Chỉ sửa ở đây là CHƯA ĐỦ. styles/index.css còn một luật quét cả
          site trong @media (prefers-reduced-motion: reduce) rút mọi animation
          xuống 0,01ms kèm !important. Băng này được miễn trừ riêng ở đó — sửa
          một chỗ mà quên chỗ kia thì dải lại đứng im.

          · overflow-hidden ở ngoài để phần chưa tới lượt nằm ngoài khung.
          · mask hai mép: logo không "bốp" một cái hiện ra ở rìa mà mờ dần vào
            nền — không có nó thì mắt bị mép cắt ngang kéo sự chú ý.
          · rê chuột vẫn dừng: đang nhìn một logo mà nó trôi mất thì bực. */}
      <div className="mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4rem,black_calc(100%-4rem),transparent)]">
        {/* Hai biến CSS thay cho việc đặt thẳng animation-duration /
            animation-play-state:
            · --nhip-chay  : luật miễn trừ trong index.css cần đọc lại đúng con
                             số này, mà nó không với tới style nội tuyến được.
            · --chay       : đặt thẳng animation-play-state bằng style nội tuyến
                             thì style nội tuyến thắng luôn cả lớp hover, tức là
                             rê chuột hết dừng. Qua biến thì hai lớp cùng hạng,
                             lớp hover đứng sau nên thắng — giữ được cả hai. */}
        <div
          className="flex w-max animate-chay-ngang [animation-play-state:var(--chay)] hover:[animation-play-state:paused]"
          style={{
            "--nhip-chay": `${danhSach.length * GIAY_MOI_DON_VI}s`,
            "--chay": dangChay ? "running" : "paused",
          }}
        >
          {/* Bản 1 — bản người dùng thật sự nhìn */}
          <ul className="flex items-center">
            {danhSach.map((dv) => (
              <OChip key={dv.ten} dv={dv} />
            ))}
          </ul>
          {/* Bản 2 — bản chạy nối đuôi cho liền mạch. aria-hidden để trình
              đọc màn hình không đọc danh sách khách hàng hai lần. */}
          <ul className="flex items-center" aria-hidden="true">
            {danhSach.map((dv) => (
              <OChip key={dv.ten} dv={dv} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
