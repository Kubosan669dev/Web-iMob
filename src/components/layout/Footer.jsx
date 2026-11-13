import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import Container from "../ui/Container.jsx";
import { NAV_ITEMS, NUT_DANG_KY } from "../../utils/constants.js";
import { useCongTy } from "../../context/NoiDungContext.jsx";

// ============================================================
// Chân trang — giao diện công ty chốt 13/11/2026: ba cột (thương hiệu + câu
// trích, điều hướng, liên hệ) rồi dòng pháp lý dưới cùng.
//
// ⚠️ MỌI THÔNG TIN LIÊN HỆ ĐỌC TỪ useCongTy() (sửa ở /admin → Liên hệ), không
// viết cứng. Ảnh mẫu ghi "banbientap@imob.vn", "đầu mối Hà Nội • Đà Nẵng •
// TP.HCM", "63 tỉnh thành", "© 2025" — không cái nào đúng (email chính thức là
// admin@imob.vn, văn phòng ở Hạ Long, cả nước còn 34 tỉnh từ 01/07/2025), nên
// đã thay bằng dữ liệu thật.
//
// Câu trích là SỨ MỆNH chính thức của công ty (company.json → suMenh), không
// phải câu tự đặt.
//
// Chân trang cũ có hàng biểu tượng Facebook / YouTube / LinkedIn / GitHub — cả
// bốn đều trỏ "#" (chưa có trang thật) nên đã bỏ. Có trang thật thì thêm lại.
// ============================================================

function CotLink({ tieuDe, children }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink">{tieuDe}</h4>
      <ul className="space-y-2.5 text-sm text-ink-soft">{children}</ul>
    </div>
  );
}

export default function Footer() {
  const congTy = useCongTy();
  const goi = congTy.phone.replace(/\s/g, "");
  const nam = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-mist">
      <Container rong="max-w-6xl" className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_1.2fr] md:gap-12">
          <div className="max-w-md">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl font-semibold tracking-tight text-ink">{congTy.name}</span>
              <span className="rounded-md bg-panel px-2 py-0.5 text-xs text-ink-soft">
                Hỏi đáp AI cho địa phương
              </span>
            </div>
            {congTy.suMenh && (
              <p className="mt-5 font-display text-xl italic leading-snug text-ink">
                “{congTy.suMenh}”
              </p>
            )}
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {congTy.fullName}. {congTy.description}.
            </p>
          </div>

          <CotLink tieuDe="Điều hướng">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link to={item.to} className="transition-colors hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={NUT_DANG_KY.href} className="transition-colors hover:text-brand">
                {NUT_DANG_KY.label}
              </a>
            </li>
            <li>
              <Link to="/tour-360" className="transition-colors hover:text-brand">
                Tour thực tế ảo 360°
              </Link>
            </li>
          </CotLink>

          <CotLink tieuDe="Liên hệ hợp tác">
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <a href={`tel:${goi}`} className="font-medium text-ink hover:text-brand">
                {congTy.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <a href={`mailto:${congTy.email}`} className="font-medium text-ink hover:text-brand">
                {congTy.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{congTy.address}</span>
            </li>
            {congTy.workingHours && <li className="pl-[1.625rem]">{congTy.workingHours}</li>}
          </CotLink>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {nam} {congTy.fullName}.
          </p>
          <div className="flex gap-5">
            <Link to="/privacy-policy" className="hover:text-brand">
              Chính sách bảo mật
            </Link>
            <Link to="/terms-of-service" className="hover:text-brand">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
