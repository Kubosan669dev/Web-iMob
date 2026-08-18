import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";
import { useSanPham } from "../../context/NoiDungContext.jsx";
import { danhSachDonVi } from "../../utils/soLieu.js";

// ============================================================
// Dải "Đang phục vụ" — đọc thẳng tên các đơn vị đang dùng sản phẩm của iMob.
//
// TRƯỚC ĐÂY LÀ DẢI SỐ LIỆU (StatsBand), và đã đổi hai lần:
//
//   Lần 1 — bỏ số bịa. Ba trang dịch vụ đều khai "50+ dự án · 30+ khách hàng ·
//   99% hài lòng", không ấn phẩm nào của công ty có con số đó.
//
//   Lần 2 (18/08/2026) — bỏ luôn số ĐẾM ĐƯỢC. Công ty góp ý đúng: kê rõ số
//   lượng thì một phần khách sẽ nghĩ công ty nhỏ, chưa làm được nhiều. Nói
//   đúng và nói mạnh là hai việc khác nhau.
//
// Cái còn lại là thứ mạnh nhất và cũng thật nhất: TÊN khách hàng. Với khách là
// cơ quan nhà nước, "Bảo tàng – Thư viện tỉnh Quảng Ninh" nặng hơn mọi con số,
// vì nó kiểm chứng được bằng một cuộc điện thoại.
//
// Không nhận dữ liệu qua prop: đọc thẳng danh sách sản phẩm trong CMS. Chừng
// nào còn một ô để gõ số vào thì còn có người gõ số không có thật vào đó.
// ============================================================
export default function DaiKhachHang() {
  const donVi = danhSachDonVi(useSanPham());
  if (donVi.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-16 lg:py-20">
      {/* Mảng sương màu thương hiệu mờ phía sau cho dải nổi lên */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl"
      />
      <Container className="relative">
        {/* Reveal bọc CẢ khối, không bọc từng <li>: Reveal render ra một <div>,
            mà <div> nằm giữa <ul> và <li> là HTML sai. */}
        <Reveal>
          <div className="rounded-block bg-mist px-8 py-12">
            <p className="text-center text-sm font-semibold uppercase tracking-wider text-ink-faint">
              Đang phục vụ
            </p>

            <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {donVi.map((ten) => (
                <li
                  key={ten}
                  className="text-center text-[1.0625rem] font-semibold leading-snug text-ink sm:text-xl"
                >
                  {ten}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
