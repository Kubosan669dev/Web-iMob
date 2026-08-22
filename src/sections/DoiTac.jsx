import { useReducedMotion } from "motion/react";
import { Building2, GraduationCap, Landmark, Library, Zap } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import { useDoiTac } from "../context/NoiDungContext.jsx";
import { diaChiAnh } from "../utils/anh.js";

// ============================================================
// DoiTac — dải tên các đơn vị đã đồng hành, CHẠY NGANG liên tục.
//
// Thêm 22/08/2026 theo yêu cầu của công ty:
//   "ở trên phần dịch vụ mình để chạy 1 dòng các đối tác và đơn vị đã triển
//    khai dự án cùng mình nhé"
// kèm ảnh chụp trang cmc.com.vn làm mẫu (dải logo Samsung SDS · TIME ·
// Microsoft chạy dưới mục Đối tác).
//
// ---- Vì sao là CHỮ chứ không phải LOGO như trang mẫu ----
// Bảy trong mười một đơn vị là phường, xã, thành phố. Cơ quan hành chính không
// có logo riêng; thứ duy nhất đại diện cho họ là Quốc huy, mà Quốc huy đặt
// trên dải quảng bá của một công ty tư nhân là việc không nên làm. Bốn đơn vị
// còn lại là doanh nghiệp/đơn vị sự nghiệp — họ CÓ logo, nhưng logo là nhãn
// hiệu của họ, muốn đăng phải xin phép bằng văn bản.
//
// Nên dải này dựng bằng TÊN + biểu tượng theo nhóm. Có thêm một cái lợi ngoài
// dự tính: tên đọc được, còn một hàng logo lạ thì phần lớn khách không nhận ra
// logo nào của ai. Với khách của iMob là cơ quan nhà nước, chữ "Bảo tàng –
// Thư viện tỉnh Quảng Ninh" nặng hơn hẳn một hình tròn không tên.
//
// Xin được logo lúc nào thì điền đường dẫn vào trường `logo` trong
// data/doiTac.json — khối này tự đổi sang hiện ảnh, không phải sửa file này.
//
// ---- Vì sao KHÔNG đặt trong <Reveal> ----
// Reveal chỉ chạy khi CUỘN TỚI. Dải này nằm ngay dưới khối đầu trang, phần lớn
// máy để bàn nhìn thấy nó ngay khi trang vừa mở — bọc Reveal thì nó nằm im ở
// độ mờ 0 cho tới khi người ta cuộn, tức là mất hẳn.
// ============================================================

/* Biểu tượng theo nhóm đơn vị. Cố ý dùng lại đúng bộ biểu tượng đang có trong
   projects.json (landmark / library / building-2) để cả site nói cùng một thứ
   tiếng hình ảnh: khách thấy hình toà nhà cột trụ ở dải này rồi lại thấy nó ở
   thẻ dự án bên trên thì hiểu ngay hai chỗ đang nói về cùng một loại đơn vị. */
const HINH_NHOM = {
  "chinh-quyen": Landmark,
  "van-hoa": Library,
  "giao-duc": GraduationCap,
  "nang-luong": Zap,
  "doanh-nghiep": Building2,
};

/** Phần đứng trước cái tên: ảnh logo nếu đã xin được, không thì biểu tượng
    của nhóm. `alt=""` cho ảnh là cố ý — tên đơn vị nằm ngay bên cạnh dưới
    dạng chữ, để alt nữa là trình đọc màn hình đọc tên hai lần. */
function DauDong({ dv }) {
  if (dv.logo) {
    return (
      <img
        src={diaChiAnh(dv.logo)}
        alt=""
        className="h-7 w-auto max-w-[7rem] shrink-0 object-contain"
      />
    );
  }
  const Icon = HINH_NHOM[dv.nhom] ?? Building2;
  return <Icon className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />;
}

function TenDonVi({ dv }) {
  return (
    // mr-* nằm trên <li> chứ không phải gap trên <ul> — xem ghi chú của
    // --animate-chay-ngang trong styles/index.css, vòng lặp phụ thuộc vào đó.
    <li className="mr-10 flex shrink-0 items-center gap-2.5 lg:mr-14">
      <DauDong dv={dv} />
      <span className="whitespace-nowrap text-[0.9375rem] font-semibold text-ink-soft">
        {dv.ten}
      </span>
    </li>
  );
}

export default function DoiTac() {
  const doiTac = useDoiTac();
  const reduceMotion = useReducedMotion();
  const danhSach = doiTac.danhSach ?? [];

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
           hình nên đứng yên là mất hút quá nửa số tên. */
        <Container className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {danhSach.map((dv) => (
              <li key={dv.ten} className="flex items-center gap-2.5">
                <DauDong dv={dv} />
                <span className="text-[0.9375rem] font-semibold text-ink-soft">
                  {dv.ten}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      ) : (
        /* Băng chạy.
           · overflow-hidden ở ngoài để phần chưa tới lượt nằm ngoài khung.
           · mask hai mép: tên không "bốp" một cái hiện ra ở rìa mà mờ dần vào
             nền — không có nó thì mắt bị mép cắt chữ kéo sự chú ý.
           · dừng khi rê chuột: đang đọc dở một cái tên mà nó trôi mất thì bực. */
        <div
          className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4rem,black_calc(100%-4rem),transparent)]"
        >
          <div className="flex w-max animate-chay-ngang hover:[animation-play-state:paused]">
            {/* Bản 1 — bản người dùng thật sự đọc */}
            <ul className="flex items-center">
              {danhSach.map((dv) => (
                <TenDonVi key={dv.ten} dv={dv} />
              ))}
            </ul>
            {/* Bản 2 — bản chạy nối đuôi cho liền mạch. aria-hidden để trình
                đọc màn hình không đọc danh sách khách hàng hai lần. */}
            <ul className="flex items-center" aria-hidden="true">
              {danhSach.map((dv) => (
                <TenDonVi key={dv.ten} dv={dv} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
