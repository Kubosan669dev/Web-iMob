import { useReducedMotion } from "motion/react";
import { Building2, GraduationCap, Landmark, Library, Zap } from "lucide-react";
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
// được nhiều đơn vị hơn, và logo được phóng to gấp rưỡi (28px -> 40px) — ở cỡ
// cũ nhiều logo chỉ còn là một chấm màu.
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
   2,8 giây/đơn vị ứng với khoảng 55px mỗi giây ở cỡ ô hiện tại: đủ chậm để
   nhận ra logo, đủ nhanh để không ai thấy nó đứng im. */
const GIAY_MOI_DON_VI = 2.8;

/** Một ô trong dải: ảnh logo nếu có, không thì tên đơn vị dạng chữ.

    ---- Vì sao logo phải nằm trong một Ô NỀN chứ không đặt thẳng lên dải ----
    Tám logo công ty gửi có đủ kiểu nền: nền trắng đặc (Bảo tàng, EVNGENCO1),
    nền trong suốt, và một cái là chữ TRẮNG trên nền trong suốt (VHunter). Thả
    thẳng lên dải nền xám nhạt thì cái có nền trắng thành một ô trắng lệch tông,
    còn VHunter mất hút hẳn. Cho tất cả vào cùng một ô bo góc nền trắng thì
    chúng thành một bộ — đây cũng đúng cách trang cmc.com.vn đang làm.

    `logoNenToi` cho riêng logo chữ sáng: ô của chúng đổi sang nền tối. Một ô
    tối giữa các ô trắng nhìn vẫn thuận, còn hơn một logo không thấy gì. */
function OChip({ dv }) {
  const Icon = HINH_NHOM[dv.nhom] ?? Building2;

  return (
    // mr-* nằm trên <li> chứ không phải gap trên <ul> — xem ghi chú của
    // --animate-chay-ngang trong styles/index.css, vòng lặp phụ thuộc vào đó.
    <li className="mr-4 shrink-0 lg:mr-6">
      <span
        className={
          "flex h-16 items-center justify-center rounded-2xl px-5 " +
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
            className="h-10 w-auto max-w-[10rem] object-contain"
          />
        ) : (
          <span className="flex items-center gap-2 whitespace-nowrap text-[0.9375rem] font-bold text-ink-soft">
            <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            {dv.ten}
          </span>
        )}
      </span>
    </li>
  );
}

export default function DoiTac() {
  const doiTac = useDoiTac();
  const reduceMotion = useReducedMotion();

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
        <p className="text-center text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
          {tieuDe}
        </p>
      </Container>

      {reduceMotion ? (
        /* Người bật "giảm chuyển động": bày thành nhiều dòng, đứng yên. KHÔNG
           dùng lại băng chạy rồi tắt animation — băng chạy rộng gấp đôi màn
           hình nên đứng yên là mất hút quá nửa số logo. */
        <Container className="mt-7">
          {/* CHỈ gap-y. Khoảng hở NGANG đã nằm trên từng ô (mr-* trong OChip,
              băng chạy cần nó ở đó) — thêm gap-x nữa là các ô cách nhau gấp
              đôi so với lúc chạy. Hở DỌC thì mr không lo được, phải khai. */}
          <ul className="flex flex-wrap items-center justify-center gap-y-4">
            {danhSach.map((dv) => (
              <OChip key={dv.ten} dv={dv} />
            ))}
          </ul>
        </Container>
      ) : (
        /* Băng chạy.
           · overflow-hidden ở ngoài để phần chưa tới lượt nằm ngoài khung.
           · mask hai mép: logo không "bốp" một cái hiện ra ở rìa mà mờ dần vào
             nền — không có nó thì mắt bị mép cắt ngang kéo sự chú ý.
           · dừng khi rê chuột: đang nhìn một logo mà nó trôi mất thì bực. */
        <div className="mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4rem,black_calc(100%-4rem),transparent)]">
          <div
            className="flex w-max animate-chay-ngang hover:[animation-play-state:paused]"
            style={{ animationDuration: `${danhSach.length * GIAY_MOI_DON_VI}s` }}
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
      )}
    </section>
  );
}
