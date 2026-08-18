import { Link } from "react-router-dom";
import Container from "../ui/Container.jsx";
import {
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  GithubIcon,
} from "../icons/BrandIcons.jsx";
import { NAV_ITEMS, SOCIAL_LINKS } from "../../utils/constants.js";
import { useCongTy } from "../../context/NoiDungContext.jsx";

// Map id social (từ constants) → icon thương hiệu (SVG inline —
// lucide v1 đã bỏ brand icons, xem components/icons/BrandIcons.jsx)
const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
};

// Link cột Dịch vụ lấy từ dropdown SERVICES của menu chính
// → một nguồn dữ liệu duy nhất trong constants.js
const serviceLinks = NAV_ITEMS.find((item) => item.id === "services")?.children ?? [];

/* Chân trang kiểu Apple: CHỮ RẤT NHỎ (12–13px), nhiều cột link, một vạch kẻ
   mảnh, rồi dòng pháp lý dưới cùng. Không icon to, không ô màu, không đổ bóng.
   Chân trang là nơi tra cứu chứ không phải nơi gây ấn tượng, nên nó nhường hết
   sự chú ý cho phần nội dung phía trên. */

function CotLink({ tieuDe, children }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold text-ink">{tieuDe}</h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function DongLink({ href, to, children }) {
  const cls = "text-xs text-ink-soft transition-colors hover:text-brand";
  return (
    <li>
      {to ? (
        <Link to={to} className={cls}>
          {children}
        </Link>
      ) : (
        <a href={href} className={cls}>
          {children}
        </a>
      )}
    </li>
  );
}

export default function Footer() {
  // Thông tin công ty lấy từ context: mặc định là company.json trong bundle,
  // sẽ tự đổi sang bản sửa trong /admin khi API trả về. Xem NoiDungContext.jsx.
  const congTy = useCongTy();
  const soDienThoaiGoi = congTy.phone.replace(/\s/g, "");

  return (
    <footer className="border-t border-line bg-paper">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ---------- Cột 1: Điều hướng ---------- */}
          <CotLink tieuDe="Khám phá">
            {NAV_ITEMS.map((item) => (
              <DongLink key={item.id} href={item.href}>
                {item.label}
              </DongLink>
            ))}
          </CotLink>

          {/* ---------- Cột 2: Dịch vụ ---------- */}
          <CotLink tieuDe="Dịch vụ">
            {serviceLinks.map((service) => (
              <DongLink key={service.label} to={service.to}>
                {service.label}
              </DongLink>
            ))}
          </CotLink>

          {/* ---------- Cột 3: Liên hệ ---------- */}
          <CotLink tieuDe="Liên hệ">
            <DongLink href={`tel:${soDienThoaiGoi}`}>{congTy.phone}</DongLink>
            <DongLink href={`mailto:${congTy.email}`}>{congTy.email}</DongLink>
            <li className="text-xs leading-relaxed text-ink-soft">
              {congTy.workingHours}
            </li>
          </CotLink>

          {/* ---------- Cột 4: Địa chỉ + mạng xã hội ---------- */}
          <CotLink tieuDe="Văn phòng">
            <li className="text-xs leading-relaxed text-ink-soft">
              {congTy.address}
            </li>
            <li className="pt-3">
              <div className="flex items-center gap-4">
                {SOCIAL_LINKS.map(({ id, label, href }) => {
                  const Icon = SOCIAL_ICONS[id];
                  return (
                    <a
                      key={id}
                      href={href}
                      aria-label={label}
                      className="text-ink-faint transition-colors hover:text-brand"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                    </a>
                  );
                })}
              </div>
            </li>
          </CotLink>
        </div>
      </Container>

      {/* ---------- Dòng pháp lý ---------- */}
      <div className="border-t border-line py-6">
        <Container className="space-y-3">
          {/* Tên pháp nhân. Công ty xác nhận 18/08/2026 chỉ dùng MỘT địa chỉ —
              văn phòng HL68, đã hiện ở cột Liên hệ phía trên nên không lặp lại. */}
          <p className="text-xs leading-relaxed text-ink-faint">{congTy.fullName}</p>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-faint">
              © {new Date().getFullYear()} {congTy.name}. Tất cả quyền được bảo
              lưu.
            </p>
            <nav
              className="flex items-center gap-4 text-xs"
              aria-label="Liên kết pháp lý"
            >
              <Link
                to="/privacy-policy"
                className="text-ink-soft transition-colors hover:text-brand"
              >
                Chính sách bảo mật
              </Link>
              <Link
                to="/terms-of-service"
                className="text-ink-soft transition-colors hover:text-brand"
              >
                Điều khoản dịch vụ
              </Link>
            </nav>
          </div>
        </Container>
      </div>
    </footer>
  );
}
