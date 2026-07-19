import { Zap, Mail, Phone, MapPin } from "lucide-react";
import Container from "../ui/Container.jsx";
import {
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  GithubIcon,
} from "../icons/BrandIcons.jsx";
import { NAV_ITEMS, SITE, SOCIAL_LINKS } from "../../utils/constants.js";

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

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      className="block py-1.5 text-sm text-gray-400 transition-colors hover:text-cyan-300"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-transparent to-blue-950/10">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ---------- Cột 1: Brand ---------- */}
          <div className="space-y-4">
            <a href="#home" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <Zap className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <p className="text-lg font-black text-white">{SITE.name}</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-400">
                  {SITE.tagline}
                </p>
              </div>
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              {SITE.description}. Sẵn sàng đồng hành cùng bạn trong hành trình
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
              <FooterLink key={service.label} href={service.href}>
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
                {SITE.phone}
              </p>
              <p className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
                <span className="break-all">{SITE.email}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
                {SITE.address}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ---------- Copyright ---------- */}
      <div className="border-t border-white/5 py-5">
        <Container className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {SITE.name} {SITE.tagline}. Tất cả
            quyền được bảo lưu.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
            Made with React + Tailwind
          </p>
        </Container>
      </div>
    </footer>
  );
}
