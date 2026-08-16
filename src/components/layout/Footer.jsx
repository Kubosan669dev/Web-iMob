import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
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

// Link cột LINKS lấy từ menu chính; cột SERVICES lấy từ dropdown SERVICES
// → một nguồn dữ liệu duy nhất trong constants.js
const serviceLinks = NAV_ITEMS.find((item) => item.id === "services")?.children ?? [];

function FooterHeading({ children }) {
  return (
    <h4 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
      {children}
    </h4>
  );
}

// FooterLink: dùng <Link> khi là route thật (to), <a> khi là mục hash trang chủ (href).
function FooterLink({ href, to, children }) {
  const cls =
    "block py-1.5 text-sm text-gray-400 transition-colors hover:text-cyan-300";
  return to ? (
    <Link to={to} className={cls}>
      {children}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}

export default function Footer() {
  // Thông tin công ty lấy từ context: mặc định là company.json trong bundle,
  // sẽ tự đổi sang bản sửa trong /admin khi API trả về. Xem NoiDungContext.jsx.
  const congTy = useCongTy();

  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-transparent to-blue-950/10">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ---------- Cột 1: Brand ---------- */}
          <div className="space-y-4">
            <a href="/#home" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <img src="/logo-imob-white.png" alt="iMob" className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <p className="text-lg font-black text-white">{congTy.name}</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-400">
                  {congTy.tagline}
                </p>
              </div>
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              {congTy.description}. Sẵn sàng đồng hành cùng bạn trong hành trình
              chuyển đổi số.
            </p>
          </div>

          {/* ---------- Cột 2: Links ---------- */}
          <div>
            <FooterHeading>Links</FooterHeading>
            {NAV_ITEMS.map((item) => (
              <FooterLink key={item.id} href={item.href}>
                {item.label.charAt(0) + item.label.slice(1).toLowerCase()}
              </FooterLink>
            ))}
          </div>

          {/* ---------- Cột 3: Services ---------- */}
          <div>
            <FooterHeading>Services</FooterHeading>
            {serviceLinks.map((service) => (
              <FooterLink key={service.label} to={service.to}>
                {service.label}
              </FooterLink>
            ))}
          </div>

          {/* ---------- Cột 4: Liên hệ + Social ---------- */}
          <div>
            <FooterHeading>Follow us</FooterHeading>
            <div className="mb-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ id, label, href }) => {
                const Icon = SOCIAL_ICONS[id];
                return (
                  <a
                    key={id}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-all duration-300 hover:border-purple-500/50 hover:text-white hover:shadow-glow-purple"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                  </a>
                );
              })}
            </div>
            {/* shrink-0 + mt-0.5: icon giữ nguyên kích thước và neo ở dòng đầu
                khi chữ dài phải xuống dòng (địa chỉ trên màn hình hẹp) */}
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
                {congTy.phone}
              </p>
              <p className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
                <span className="break-all">{congTy.email}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
                {congTy.address}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ---------- Copyright + liên kết pháp lý ---------- */}
      <div className="border-t border-white/5 py-5">
        <Container className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {congTy.name} {congTy.tagline}. Tất cả
            quyền được bảo lưu.
          </p>
          <nav
            className="flex items-center gap-3 text-xs text-gray-400"
            aria-label="Liên kết pháp lý"
          >
            <Link to="/privacy-policy" className="transition-colors hover:text-cyan-300">
              Chính sách bảo mật
            </Link>
            <span aria-hidden="true" className="text-gray-700">·</span>
            <Link to="/terms-of-service" className="transition-colors hover:text-cyan-300">
              Điều khoản dịch vụ
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
